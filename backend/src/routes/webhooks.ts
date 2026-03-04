import { Hono } from "hono";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../utils/config/envUtil";

const webhooks = new Hono();

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events.
 * Must verify signature before processing any events.
 */
webhooks.post("/stripe", async (c) => {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe not configured");
    return c.json({ error: "Stripe not configured" }, 500);
  }

  const signature = c.req.header("stripe-signature");
  if (!signature) {
    return c.json({ error: "Missing stripe-signature header" }, 400);
  }

  // Get raw body for signature verification
  const rawBody = await c.req.text();

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" });

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return c.json({ error: `Webhook Error: ${err.message}` }, 400);
    }

    const { prisma } = await import("../services/db/prisma");

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.info("[webhook] checkout.session.completed:", session.id);

        // Only process payment mode sessions (not subscription mode — those are handled by Firebase Extension)
        if (session.mode === "payment" && session.payment_status === "paid") {
          try {
            // Find the user by Firebase UID in metadata or customer email
            let userId: string | null = null;

            if (session.metadata?.firebaseUID) {
              const user = await prisma.user.findUnique({
                where: { firebaseUid: session.metadata.firebaseUID },
                select: { id: true },
              });
              userId = user?.id || null;
            }

            if (!userId && session.customer_email) {
              const user = await prisma.user.findUnique({
                where: { email: session.customer_email },
                select: { id: true },
              });
              userId = user?.id || null;
            }

            if (userId) {
              // Prevent replay attacks with unique session ID
              const existingOrder = await prisma.order.findUnique({
                where: { stripeSessionId: session.id },
              });

              if (!existingOrder) {
                await prisma.order.create({
                  data: {
                    userId,
                    stripeSessionId: session.id,
                    totalAmount: session.amount_total ? session.amount_total / 100 : 0,
                    status: "paid",
                  },
                });
                console.info("[webhook] Order created for session:", session.id);
              }
            } else {
              console.warn("[webhook] Could not find user for session:", session.id);
            }
          } catch (err) {
            console.error("[webhook] Failed to create order:", err);
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.info("[webhook] payment_intent.succeeded:", paymentIntent.id);
        // Payment recorded — Order creation happens in checkout.session.completed
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.info("[webhook] invoice.payment_succeeded:", invoice.id);
        // Subscription renewal — Firebase Extension handles Firestore sync
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.warn("[webhook] invoice.payment_failed:", invoice.id);
        // Firebase Extension handles subscription status update in Firestore
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.info("[webhook] customer.subscription.updated:", subscription.id, "status:", subscription.status);
        // Firebase Extension handles Firestore sync automatically
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.info("[webhook] customer.subscription.deleted:", subscription.id);
        // Firebase Extension handles Firestore sync automatically
        break;
      }

      default:
        console.info("[webhook] Unhandled event type:", event.type);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("[webhook] Unexpected error:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

export default webhooks;
