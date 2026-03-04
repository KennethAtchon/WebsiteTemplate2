import { NextRequest } from "next/server";
import { prisma } from "@/shared/services/db/prisma";
import debugLog from "@/shared/utils/debug";
import {
  validateCurrencyAmount,
  sanitizeFinancialData,
} from "@/shared/utils/validation/api-validation";
import { withUserProtection } from "@/shared/middleware/api-route-protection";
import type { AuthResult } from "@/features/auth/types/auth.types";
import { sendOrderConfirmationEmail } from "@/shared/services/email/resend";
import { createCustomerOrderSchema } from "@/shared/utils/validation/api-validation";
import {
  createSuccessResponse,
  createBadRequestResponse,
  createInternalErrorResponse,
} from "@/shared/utils/api/response-helpers";

/**
 * Creates an order for ONE-TIME PURCHASES only
 *
 * ARCHITECTURE NOTE:
 * ==================
 * This function creates Orders in Prisma for ONE-TIME purchases only.
 *
 * DO NOT use this for subscriptions:
 *   - Subscriptions are handled by Firebase Stripe Extension → stored in Firestore
 *   - Subscriptions view: /admin/subscriptions (queries Firestore)
 *
 * Use this for:
 *   - One-time product purchases
 *   - One-time service payments
 *   - Any non-recurring payment
 *
 * Separation of concerns:
 *   - Subscriptions → Firestore (via Firebase Extension)
 *   - One-time Orders → Prisma (this function)
 */
async function createOrder(data: {
  userId: string;
  totalAmount: number;
  status: string | undefined;
  stripeSessionId?: string;
  skipPayment?: boolean;
}) {
  return await prisma.order.create({
    data: {
      userId: data.userId,
      totalAmount: data.totalAmount,
      status: data.status,
      stripeSessionId: data.stripeSessionId,
      skipPayment: data.skipPayment ?? false,
      // orderType defaults to "one_time" in schema (subscriptions are in Firestore)
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Finds existing order
 */
async function findExistingOrder(stripeSessionId: string, userId: string) {
  return await prisma.order.findFirst({
    where: {
      stripeSessionId: stripeSessionId,
      userId: userId,
      isDeleted: false, // Only find active orders
    },
    include: {
      user: true,
    },
  });
}

/**
 * Send order confirmation email asynchronously without blocking the response
 */
async function sendOrderConfirmationEmailAsync(
  order: Record<string, unknown>,
  userId: string
) {
  try {
    // Get customer profile information for the email
    const customer = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        notes: true,
      },
    });

    if (!customer) {
      debugLog.warn(
        "Customer not found for email sending",
        {
          service: "customer-orders-create",
          operation: "sendOrderConfirmationEmailAsync",
        },
        { orderId: order.id, userId }
      );
      return;
    }

    // Prepare email data
    const emailData = {
      customerName: customer.name || "Valued Customer",
      customerEmail: customer.email,
      orderId: String(order.id),
      products: [], // Product feature removed
      totalAmount: String(order.totalAmount),
      address: customer.address || "Address not provided",
      phone: customer.phone || undefined,
      notes: customer.notes || undefined,
    };

    debugLog.info(
      "Sending order confirmation email",
      {
        service: "customer-orders-create",
        operation: "sendOrderConfirmationEmailAsync",
      },
      {
        orderId: order.id,
        customerEmail: customer.email,
      }
    );

    const emailResult = await sendOrderConfirmationEmail(emailData);

    if (emailResult.success) {
      debugLog.info(
        "Order confirmation email sent successfully",
        {
          service: "customer-orders-create",
          operation: "sendOrderConfirmationEmailAsync",
        },
        {
          orderId: order.id,
          emailId: emailResult.id,
        }
      );
    } else {
      debugLog.error(
        "Failed to send order confirmation email",
        {
          service: "customer-orders-create",
          operation: "sendOrderConfirmationEmailAsync",
        },
        {
          orderId: order.id,
          error: emailResult.error,
        }
      );
    }
  } catch (error) {
    debugLog.error(
      "Error in sendOrderConfirmationEmailAsync",
      {
        service: "customer-orders-create",
        operation: "sendOrderConfirmationEmailAsync",
      },
      {
        orderId: order.id,
        error,
      }
    );
  }
}

/**
 * POST /api/customer/orders/create
 * Creates a new order for ONE-TIME PURCHASES only.
 *
 * ARCHITECTURE NOTE:
 * ==================
 * This route is for ONE-TIME purchases only. Do NOT use for subscriptions.
 *
 * For subscriptions:
 *   - Use client-side Firestore + onSnapshot approach (see features/payments/services/stripe-checkout.ts)
 *   - Subscriptions are stored in Firestore (not Prisma)
 *   - View subscriptions: /admin/subscriptions
 *
 * For one-time purchases:
 *   - Use: This route
 *   - Orders are stored in Prisma
 *   - View orders: /admin/orders
 *
 * @param {Object} body - Order creation data with totalAmount and optional payment info
 * @returns {Object} Created order
 */
async function postHandler(
  request: NextRequest,
  { auth }: { auth: AuthResult }
) {
  try {
    const body = await request.json();
    const { totalAmount, status, stripeSessionId, skipPayment } = body;

    // Basic validation
    if (
      totalAmount === undefined ||
      totalAmount === null ||
      typeof totalAmount !== "number"
    ) {
      return createBadRequestResponse(
        "totalAmount is required and must be a number"
      );
    }

    // Validate currency amount
    validateCurrencyAmount(totalAmount, "Order total amount");

    // Sanitize financial data
    const sanitizedData = sanitizeFinancialData({ totalAmount });
    const finalTotalAmount = sanitizedData.totalAmount;

    debugLog.info(
      "Processing order creation",
      {
        service: "customer-orders-create",
        operation: "POST",
      },
      {
        customerId: auth.user.id,
        totalAmount: finalTotalAmount,
      }
    );

    // Check for duplicate order if stripeSessionId is provided
    if (stripeSessionId) {
      const existingOrder = await findExistingOrder(
        stripeSessionId,
        auth.user.id
      );

      if (existingOrder) {
        debugLog.info(
          "Returning existing order for Stripe session",
          {
            service: "customer-orders-create",
            operation: "POST",
          },
          { orderId: existingOrder.id, stripeSessionId }
        );

        return createSuccessResponse({ order: existingOrder });
      }
    }

    // Create order
    const order = await createOrder({
      userId: auth.user.id,
      totalAmount: finalTotalAmount,
      status,
      stripeSessionId,
      skipPayment,
    });

    debugLog.info(
      "Order created successfully",
      {
        service: "customer-orders-create",
        operation: "POST",
      },
      {
        orderId: order.id,
        customerId: auth.user.id,
        totalAmount: order.totalAmount,
        skipPayment: order.skipPayment,
      }
    );

    // Send order confirmation email for paid orders
    if (!order.skipPayment) {
      sendOrderConfirmationEmailAsync(order, auth.user.id);
    } else {
      debugLog.info(
        "Skipping order confirmation email for skip payment order",
        {
          service: "customer-orders-create",
          operation: "POST",
        },
        { orderId: order.id }
      );
    }

    return createSuccessResponse({ order }, undefined, 201);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    // Handle specific validation errors
    if (errorMessage.includes("Amount")) {
      debugLog.warn(
        "Currency validation failed",
        {
          service: "customer-orders-create",
          operation: "POST",
        },
        { customerId: auth.user.id, error: errorMessage }
      );

      return createBadRequestResponse("Invalid financial data", {
        details: errorMessage,
      });
    }

    debugLog.error(
      "Failed to create order",
      {
        service: "customer-orders-create",
        operation: "POST",
      },
      {
        customerId: auth.user.id,
        error,
      }
    );

    return createInternalErrorResponse("Failed to create order", error);
  }
}

export const POST = withUserProtection(postHandler, {
  bodySchema: createCustomerOrderSchema,
  rateLimitType: "payment",
});
