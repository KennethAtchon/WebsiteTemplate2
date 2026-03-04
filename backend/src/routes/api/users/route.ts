import { NextRequest, NextResponse } from "next/server";
import prisma from "@/shared/services/db/prisma";
import { FirebaseUserSync } from "@/shared/services/firebase/sync";
import { debugLog } from "@/shared/utils/debug";
import {
  createPaginatedResponse,
  createSearchConditions,
} from "@/shared/utils/helpers/pagination";
import {
  userSearchSchema,
  validateSearchInput,
} from "@/shared/utils/validation/search-validation";
import {
  withGetProtection,
  withMutationProtection,
} from "@/shared/middleware/api-route-protection";

/**
 * GET /api/users
 * Returns paginated list of users for admin dashboard (Admin only).
 * Query parameters:
 * - page: Page number (1-based, default: 1)
 * - limit: Records per page (1-100, default: 50)
 * - search: Search term to filter by name or email
 */
async function getHandler(request: NextRequest) {
  // Require admin access
  try {
    const { searchParams } = new URL(request.url);

    // Validate input parameters using security schema
    const validationResult = validateSearchInput(
      userSearchSchema,
      {
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        search: searchParams.get("search") || undefined, // Convert null to undefined
      },
      "users-search"
    );

    // Add debug parameter to include deleted users
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    if (!validationResult.success) {
      debugLog.warn(
        "Invalid search parameters for user search",
        {
          service: "users",
          operation: "GET",
        },
        { error: validationResult.error }
      );

      return NextResponse.json(
        { error: `Invalid search parameters: ${validationResult.error}` },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const { page, limit, search } = validatedData;
    const skip = (page - 1) * limit;

    debugLog.info(
      "Fetching paginated users",
      {
        service: "users",
        operation: "GET",
      },
      { page, limit, skip, search, includeDeleted }
    );

    // Build search filter conditions
    const searchConditions = createSearchConditions(search, ["name", "email"]);
    const whereConditions = {
      ...searchConditions,
      // Only include active users by default (unless includeDeleted is true)
      ...(includeDeleted ? {} : { isDeleted: false }),
    };

    // Get total count for pagination metadata
    const totalCount = await prisma.user.count({
      where: whereConditions,
    });

    // Get paginated users with all fields
    const users = await prisma.user.findMany({
      where: whereConditions,
      orderBy: [
        { isActive: "desc" }, // Active users first
        { createdAt: "desc" },
      ],
      take: limit,
      skip: skip,
    });

    const response = createPaginatedResponse(users, totalCount, page, limit);

    debugLog.info(
      "Successfully fetched paginated users",
      {
        service: "users",
        operation: "GET",
      },
      { ...response.pagination }
    );

    return NextResponse.json({
      users: response.data,
      pagination: response.pagination,
    });
  } catch (error) {
    debugLog.error(
      "Failed to fetch users",
      { service: "users", operation: "GET" },
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

async function postHandler(request: NextRequest) {
  // Require admin access
  try {
    const { name, email, password, createInFirebase, timezone } =
      await request.json();

    let firebaseUid = null;

    // Optionally create user in Firebase
    if (createInFirebase) {
      const syncResult = await FirebaseUserSync.syncUserCreate({
        email,
        name,
        password,
        role: "user",
      });

      if (!syncResult.success) {
        return NextResponse.json(
          { error: `Failed to create Firebase user: ${syncResult.error}` },
          { status: 500 }
        );
      }

      firebaseUid = syncResult.firebaseUid;
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        firebaseUid,
        role: "user",
        isActive: true,
        timezone: timezone || "UTC",
      },
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    debugLog.error(
      "Error creating user",
      { service: "users", operation: "POST" },
      error
    );
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// PATCH /api/users
async function patchHandler(request: NextRequest) {
  // Require admin access
  try {
    const {
      id,
      phone,
      address,
      role,
      name,
      password,
      email,
      isActive,
      timezone,
    } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
    }

    // Find the user first to get Firebase UID
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(role !== undefined && { role }),
        ...(name !== undefined && { name }),
        ...(password !== undefined && { password }),
        ...(email !== undefined && { email }),
        ...(isActive !== undefined && { isActive }),
        ...(timezone !== undefined && { timezone }),
      },
    });

    // Sync changes to Firebase if user has Firebase UID
    if (existingUser.firebaseUid) {
      const syncData: Record<string, unknown> = {};
      if (email !== undefined) syncData.email = email;
      if (name !== undefined) syncData.name = name;
      if (role !== undefined) syncData.role = role;
      if (isActive !== undefined) syncData.isActive = isActive;

      if (Object.keys(syncData).length > 0) {
        const syncResult = await FirebaseUserSync.syncUserUpdate(
          existingUser.firebaseUid,
          syncData
        );
        if (!syncResult.success) {
          debugLog.warn(
            `Failed to sync user update to Firebase: ${syncResult.error}`,
            { service: "users", operation: "PATCH" }
          );
          // Continue with the response - database is the source of truth
        }
      }
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    debugLog.error(
      "Error updating user",
      { service: "users", operation: "PATCH" },
      error
    );
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users
async function deleteHandler(request: NextRequest) {
  // Require admin access
  try {
    const { id, hardDelete = false } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
    }

    // Find the user first to get Firebase UID
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (hardDelete) {
      // Hard delete from database
      await prisma.user.delete({
        where: { id },
      });
    } else {
      // Soft delete (deactivate)
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
    }

    // Sync deletion to Firebase if user has Firebase UID
    if (existingUser.firebaseUid) {
      const syncResult = await FirebaseUserSync.syncUserDelete(
        existingUser.firebaseUid,
        hardDelete
      );
      if (!syncResult.success) {
        debugLog.warn(
          `Failed to sync user deletion to Firebase: ${syncResult.error}`,
          { service: "users", operation: "DELETE" }
        );
        // Continue with the response - database is the source of truth
      }
    }

    return NextResponse.json({
      success: true,
      message: hardDelete ? "User deleted permanently" : "User deactivated",
    });
  } catch (error) {
    debugLog.error(
      "Error deleting user",
      { service: "users", operation: "DELETE" },
      error
    );
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

import {
  createUserSchema,
  updateUserSchema,
  usersQuerySchema,
  deleteUserSchema,
} from "@/shared/utils/validation/api-validation";

export const GET = withGetProtection(getHandler, {
  querySchema: usersQuerySchema,
  rateLimitType: "default",
});
export const POST = withMutationProtection(postHandler, {
  bodySchema: createUserSchema,
  rateLimitType: "default",
});
export const PATCH = withMutationProtection(patchHandler, {
  bodySchema: updateUserSchema,
  rateLimitType: "default",
});
export const DELETE = withMutationProtection(deleteHandler, {
  bodySchema: deleteUserSchema,
  rateLimitType: "default",
});
