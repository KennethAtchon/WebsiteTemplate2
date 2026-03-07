import { Hono } from "hono";
import { rateLimiter } from "../../middleware/protection";
import { adminAuth } from "../../services/firebase/admin";
import { prisma } from "../../services/db/prisma";

const authRoutes = new Hono();

/**
 * POST /api/auth/register
 *
 * Called by the frontend after Firebase sign-up or Google sign-in.
 * Verifies the Firebase token and upserts the user in Postgres.
 * No auth middleware — the user may not exist in DB yet.
 */
authRoutes.post("/register", rateLimiter("auth"), async (c) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Authorization header required" }, 401);
  }

  try {
    const token = authHeader.substring(7);
    const decoded = await adminAuth.verifyIdToken(token, true);

    const email = decoded.email;
    if (!email) {
      return c.json({ error: "Firebase token missing email" }, 400);
    }

    const name =
      decoded.name || decoded.displayName || email.split("@")[0] || "User";

    const user = await prisma.user.upsert({
      where: { firebaseUid: decoded.uid },
      update: { lastLogin: new Date() },
      create: {
        firebaseUid: decoded.uid,
        email,
        name,
        role: "user",
        isActive: true,
        timezone: "UTC",
      },
      select: { id: true, email: true, role: true, name: true },
    });

    return c.json({ user }, 200);
  } catch (error) {
    console.error("Auth register error:", error);
    return c.json({ error: "Invalid or expired token" }, 401);
  }
});

export default authRoutes;
