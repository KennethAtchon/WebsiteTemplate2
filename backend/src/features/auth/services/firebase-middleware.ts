import { NextRequest, NextResponse } from "hono";
import { adminAuth } from "@/services/firebase/admin";
import { prisma } from "@/services/db/prisma";
import { debugLog } from "@/utils/debug";
import type {
  DatabaseUser,
  AuthResult,
  AdminAuthResultWithDbUserId,
} from "@/features/auth/types/auth.types";

/**
 * Extracts and verifies the Firebase ID token from the request headers
 */
function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") || null;
}

/**
 * Handles authentication errors and returns appropriate error responses
 */
function handleAuthError(error: unknown): NextResponse {
  debugLog.error("Authentication error", { service: "auth-middleware" }, error);

  if (error && typeof error === "object" && "code" in error) {
    const code = error.code as string;
    if (code === "auth/id-token-expired") {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }
    if (code === "auth/id-token-revoked" || code === "auth/user-disabled") {
      // Token was explicitly revoked (e.g. password change, account disable, forced sign-out)
      return NextResponse.json(
        { error: "Session revoked. Please sign in again." },
        { status: 401 }
      );
    }
  }

  return NextResponse.json({ error: "Invalid token" }, { status: 401 });
}

/**
 * Gets or creates a database user for the given Firebase UID
 * Also handles timezone updates if detected from headers
 */
async function getOrCreateDbUser(
  firebaseUid: string,
  decodedToken: { email?: string; name?: string },
  detectedTimezone: string | null
): Promise<DatabaseUser> {
  // Find existing database user
  let dbUser = await prisma.user.findUnique({
    where: { firebaseUid },
  });

  if (!dbUser) {
    debugLog.info("Creating missing database user", {
      service: "auth-middleware",
      firebaseUid,
    });

    // Get the actual Firebase user record to get the most current displayName
    let userName = "User";
    try {
      const firebaseUser = await adminAuth.getUser(firebaseUid);
      userName = firebaseUser.displayName || decodedToken.name || "User";
    } catch {
      debugLog.warn("Could not fetch Firebase user for display name", {
        service: "auth-middleware",
        firebaseUid,
      });
      userName = decodedToken.name || "User";
    }

    dbUser = await prisma.user.create({
      data: {
        firebaseUid,
        email: decodedToken.email || "",
        name: userName,
        role: "user",
        isActive: true,
        timezone: detectedTimezone || "UTC",
      },
    });
  } else if (detectedTimezone && dbUser.timezone !== detectedTimezone) {
    // Update timezone only if detected timezone is provided and different
    debugLog.info("Updating user timezone", {
      service: "auth-middleware",
      firebaseUid,
      oldTimezone: dbUser.timezone,
      newTimezone: detectedTimezone,
    });

    dbUser = await prisma.user.update({
      where: { firebaseUid },
      data: { timezone: detectedTimezone },
    });
  }

  return dbUser as DatabaseUser;
}

/**
 * Requires authentication for any user
 * Returns the authenticated user's database record and Firebase token
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthResult | NextResponse> {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the Firebase ID token (checkRevoked: true rejects revoked tokens
    // immediately rather than waiting for natural 1-hour expiry)
    const decodedToken = await adminAuth.verifyIdToken(token, true);

    // Detect user's timezone from headers
    const detectedTimezone = request.headers.get("x-timezone");

    // Get or create database user
    const dbUser = await getOrCreateDbUser(
      decodedToken.uid,
      decodedToken,
      detectedTimezone
    );

    return {
      firebaseUser: decodedToken,
      userId: decodedToken.uid,
      user: dbUser,
    };
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * Requires admin authentication
 * Always includes dbUserId and staffId for convenience
 *
 * ROLE DETERMINATION STRATEGY:
 * ============================
 * - Database is the SINGLE SOURCE OF TRUTH for role writes
 * - Firebase custom claims are used for READS (performance optimization)
 * - Flow: Database (write) -> Firebase (sync) -> Firebase (read)
 *
 * When checking roles:
 * 1. PRIMARY: Read from Firebase custom claims (fast, no DB query)
 * 2. FALLBACK: If Firebase claim missing, read from database and sync to Firebase
 * 3. SYNC: If Firebase and database differ, database wins (sync DB -> Firebase)
 *
 * This ensures:
 * - Fast reads (no DB query when Firebase claim exists)
 * - Database remains source of truth (users can't write to Firebase directly)
 * - Automatic sync keeps Firebase claims up-to-date
 */
export async function requireAdmin(
  request: NextRequest
): Promise<AdminAuthResultWithDbUserId | NextResponse> {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the Firebase ID token (checkRevoked: true rejects revoked tokens
    // immediately rather than waiting for natural 1-hour expiry)
    const decodedToken = await adminAuth.verifyIdToken(token, true);

    // Detect user's timezone from headers
    const detectedTimezone = request.headers.get("x-timezone");

    // PRIMARY: Check Firebase custom claims first (fast, no DB query needed)
    // Database is source of truth for writes, but we read from Firebase claims for performance
    const firebaseRole = decodedToken.role as string | undefined;

    // Get database user (needed for return value and fallback)
    const dbUser = await getOrCreateDbUser(
      decodedToken.uid,
      decodedToken,
      detectedTimezone
    );

    // Determine user role: Firebase claim (primary) or database (fallback)
    let userRole = firebaseRole || dbUser.role;

    // If Firebase claim is missing, sync database role to Firebase
    if (!firebaseRole && dbUser.role) {
      try {
        debugLog.info("Syncing database role to Firebase custom claims", {
          service: "auth-middleware",
          databaseRole: dbUser.role,
          userId: decodedToken.uid,
        });
        await adminAuth.setCustomUserClaims(decodedToken.uid, {
          role: dbUser.role,
        });
      } catch (error) {
        debugLog.error(
          "Error syncing database role to Firebase custom claims",
          {
            service: "auth-middleware",
          },
          error
        );
        // Continue with database role as fallback
      }
    }
    // If Firebase claim exists but differs from database, sync database to Firebase
    // (Database is source of truth, so database wins)
    else if (firebaseRole && dbUser.role && firebaseRole !== dbUser.role) {
      try {
        debugLog.info(
          "Syncing database role to Firebase (database is source of truth)",
          {
            service: "auth-middleware",
            firebaseRole,
            databaseRole: dbUser.role,
            userId: decodedToken.uid,
          }
        );
        await adminAuth.setCustomUserClaims(decodedToken.uid, {
          role: dbUser.role,
        });
        userRole = dbUser.role;
      } catch (error) {
        debugLog.warn(
          "Failed to sync database role to Firebase",
          {
            service: "auth-middleware",
          },
          error
        );
        // Database is source of truth: use DB role even when sync fails
        userRole = dbUser.role;
      }
    }

    // Check if user has admin role (from Firebase claim or database fallback)
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Ensure firebaseUid is not null for our return types
    if (!dbUser.firebaseUid) {
      return NextResponse.json(
        { error: "Invalid user data - missing Firebase UID" },
        { status: 500 }
      );
    }

    return {
      firebaseUser: decodedToken,
      userId: decodedToken.uid,
      user: dbUser,
      dbUserId: dbUser.id,
      staffId: dbUser.id, // Alias for availability/staff operations
    };
  } catch (error) {
    return handleAuthError(error);
  }
}
