import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/shared/services/email/resend";
import debugLog from "@/shared/utils/debug";
import { withMutationProtection } from "@/shared/middleware/api-route-protection";
import { sendEmailSchema } from "@/shared/utils/validation/api-validation";

// POST send order confirmation email (PUBLIC - customers get confirmation emails)
async function postHandler(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      orderId,
      therapies,
      products,
      totalAmount,
      address,
      phone,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !orderId || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send confirmation email
    const result = await sendOrderConfirmationEmail({
      customerName,
      customerEmail,
      orderId,
      therapies: therapies || [],
      products: products || [],
      totalAmount,
      address,
      phone,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Confirmation email sent successfully",
        emailId: result.id,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send confirmation email", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    debugLog.error(
      "Failed to send confirmation email",
      { service: "emails", operation: "POST" },
      error
    );
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}

export const POST = withMutationProtection(postHandler, {
  bodySchema: sendEmailSchema,
  rateLimitType: "public",
});
