import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/infrastructure/database/lib/generated/prisma";
import { debugLog } from "@/shared/utils/debug";
import {
  parsePaginationParams,
  createPaginatedResponse,
  createSearchConditions,
  createDateRangeConditions,
} from "@/shared/utils/helpers/pagination";
import {
  contactMessageSchema,
  contactMessagesQuerySchema,
} from "@/shared/utils/validation/api-validation";
import {
  withGetProtection,
  withMutationProtection,
} from "@/shared/middleware/api-route-protection";
import { requireAdmin } from "@/features/auth/services/firebase-middleware";
import {
  createSuccessResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

const prisma = new PrismaClient();

/**
 * GET /api/shared/contact-messages
 * Returns paginated list of contact messages for admin dashboard (Admin only).
 * Query parameters:
 * - page: Page number (1-based, default: 1)
 * - limit: Records per page (1-100, default: 50)
 * - search: Search term to filter by name, email, or subject
 * - dateFrom: Filter messages from this date (ISO string)
 * - dateTo: Filter messages up to this date (ISO string)
 */
async function getHandler(request: NextRequest) {
  const adminResult = await requireAdmin(request);
  if (adminResult instanceof NextResponse) {
    return adminResult; // Error response
  }

  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip, search } = parsePaginationParams(
      {
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        search: searchParams.get("search"),
      },
      {
        defaultLimit: 50,
        maxLimit: 100,
      }
    );

    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    debugLog.info(
      "Fetching paginated contact messages",
      {
        service: "contact-messages",
        operation: "GET",
      },
      { page, limit, skip, search, dateFrom, dateTo }
    );

    // Build search and filter conditions
    const searchConditions = createSearchConditions(search, [
      "name",
      "email",
      "subject",
    ]);
    const dateConditions = createDateRangeConditions(
      dateFrom,
      dateTo,
      "createdAt"
    );

    const whereConditions = {
      ...searchConditions,
      ...dateConditions,
    };

    // Get total count for pagination metadata
    const totalCount = await prisma.contactMessage.count({
      where: whereConditions,
    });

    // Get paginated contact messages
    const messages = await prisma.contactMessage.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc", // Most recent first
      },
      take: limit,
      skip: skip,
    });

    const response = createPaginatedResponse(messages, totalCount, page, limit);

    debugLog.info(
      "Successfully fetched paginated contact messages",
      {
        service: "contact-messages",
        operation: "GET",
      },
      { ...response.pagination }
    );

    return createSuccessResponse({
      messages: response.data,
      pagination: response.pagination,
    });
  } catch (error) {
    debugLog.error(
      "Failed to fetch contact messages",
      { service: "contact-messages", operation: "GET" },
      error
    );
    return createInternalErrorResponse(
      "Failed to fetch contact messages",
      error
    );
  }
}

/**
 * POST /api/shared/contact-messages
 * Creates a new contact message (PUBLIC - customers can submit contact forms).
 * Includes comprehensive validation, rate limiting, and security measures.
 *
 * @param {ContactMessageInput} body - Contact message data
 * @returns {Object} Created contact message confirmation
 */
async function postHandler(request: NextRequest) {
  try {
    // Body is already validated by middleware (bodySchema: contactMessageSchema)
    const data = await request.json();
    const { name, email, phone, subject, message, category } = data;

    debugLog.info(
      "Processing contact message submission",
      {
        service: "contact-messages",
        operation: "POST",
      },
      {
        email: email.substring(0, 3) + "***", // Partial email for privacy
        category,
        messageLength: message.length,
      }
    );

    // Additional security checks for suspicious content
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /(http|https):\/\/[^\s]{10,}/gi, // Multiple URLs
      /(.)\1{50,}/gi, // Repeated characters (potential spam)
    ];

    const isSuspicious = suspiciousPatterns.some(
      (pattern) =>
        pattern.test(message) || pattern.test(subject) || pattern.test(name)
    );

    if (isSuspicious) {
      debugLog.warn(
        "Suspicious contact message content detected",
        {
          service: "contact-messages",
          operation: "POST",
        },
        {
          email: email.substring(0, 3) + "***",
          reason: "suspicious_patterns",
        }
      );

      return createBadRequestResponse(
        "Your message could not be submitted. Please ensure your message contains appropriate content.",
        { code: "CONTENT_VALIDATION_FAILED" }
      );
    }

    // Create contact message
    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        // Note: category field might need to be added to the database schema
        // For now, we'll store it in the message or create a separate field
      },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        createdAt: true,
        // Don't return the full message content for security
      },
    });

    debugLog.info(
      "Contact message created successfully",
      {
        service: "contact-messages",
        operation: "POST",
      },
      {
        messageId: newMessage.id,
        email: email.substring(0, 3) + "***",
      }
    );

    // Return success without exposing sensitive data
    return createSuccessResponse(
      {
        message:
          "Your message has been sent successfully. We will get back to you soon.",
        id: newMessage.id,
        timestamp: newMessage.createdAt,
      },
      undefined,
      201
    );
  } catch (error: unknown) {
    debugLog.error(
      "Failed to create contact message",
      {
        service: "contact-messages",
        operation: "POST",
      },
      {
        error,
      }
    );

    // Don't expose internal error details to public users
    return createInternalErrorResponse(
      "Unable to send your message at this time. Please try again later or contact us directly.",
      { code: "SUBMISSION_FAILED" }
    );
  }
}

export const GET = withGetProtection(getHandler, {
  querySchema: contactMessagesQuerySchema,
  rateLimitType: "public",
});
export const POST = withMutationProtection(postHandler, {
  bodySchema: contactMessageSchema,
  rateLimitType: "public",
});
