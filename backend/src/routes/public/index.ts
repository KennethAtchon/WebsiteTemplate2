import { Hono } from "hono";
import {
  authMiddleware,
  csrfMiddleware,
  rateLimiter,
} from "../../middleware/protection";

const publicRoutes = new Hono();

// ─── GET /api/shared/contact-messages ────────────────────────────────────────

publicRoutes.get(
  "/contact-messages",
  rateLimiter("admin"),
  authMiddleware("admin"),
  async (c) => {
    try {
      const { prisma } = await import("../services/db/prisma");

      const page = parseInt(c.req.query("page") || "1", 10);
      const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 100);
      const search = c.req.query("search");
      const dateFrom = c.req.query("dateFrom");
      const dateTo = c.req.query("dateTo");
      const skip = (page - 1) * limit;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { subject: { contains: search, mode: "insensitive" } },
        ];
      }
      if (dateFrom || dateTo) {
        where.createdAt = {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        };
      }

      const [messages, total] = await Promise.all([
        prisma.contactMessage.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            subject: true,
            message: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip,
        }),
        prisma.contactMessage.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      return c.json({
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
          hasPrevious: page > 1,
        },
      });
    } catch (error) {
      console.error("Failed to fetch contact messages:", error);
      return c.json({ error: "Failed to fetch contact messages" }, 500);
    }
  },
);

// ─── POST /api/shared/contact-messages ───────────────────────────────────────

publicRoutes.post("/contact-messages", rateLimiter("public"), async (c) => {
  try {
    const { prisma } = await import("../services/db/prisma");
    const data = await c.req.json();
    const { name, email, phone, subject, message } = data;

    if (!name || !email || !subject || !message) {
      return c.json(
        { error: "name, email, subject, and message are required" },
        400,
      );
    }

    // Basic spam detection
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /(.)\1{50,}/gi,
    ];

    const content = `${name} ${subject} ${message}`;
    const isSuspicious = suspiciousPatterns.some((p) => p.test(content));
    if (isSuspicious) {
      return c.json(
        {
          error:
            "Your message could not be submitted. Please ensure your message contains appropriate content.",
        },
        400,
      );
    }

    const newMessage = await prisma.contactMessage.create({
      data: { name, email, phone: phone || null, subject, message },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        createdAt: true,
      },
    });

    return c.json(
      {
        message:
          "Your message has been sent successfully. We will get back to you soon.",
        id: newMessage.id,
        timestamp: newMessage.createdAt,
      },
      201,
    );
  } catch (error) {
    console.error("Failed to create contact message:", error);
    return c.json(
      {
        error:
          "Unable to send your message at this time. Please try again later.",
      },
      500,
    );
  }
});

// ─── POST /api/shared/emails ──────────────────────────────────────────────────

publicRoutes.post("/emails", rateLimiter("public"), async (c) => {
  try {
    const { sendOrderConfirmationEmail } =
      await import("../services/email/resend");
    const body = await c.req.json();
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

    if (!customerName || !customerEmail || !orderId || !totalAmount) {
      return c.json({ error: "Missing required fields" }, 400);
    }

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
      return c.json({
        success: true,
        message: "Confirmation email sent successfully",
        emailId: result.id,
      });
    } else {
      return c.json(
        { error: "Failed to send confirmation email", details: result.error },
        500,
      );
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    return c.json({ error: "Failed to send email" }, 500);
  }
});

// ─── POST /api/shared/upload ──────────────────────────────────────────────────

publicRoutes.post(
  "/upload",
  rateLimiter("customer"),
  csrfMiddleware(),
  authMiddleware("user"),
  async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File | null;

      if (!file) return c.json({ error: "No file provided" }, 400);

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return c.json({ error: "File size exceeds 10MB limit" }, 400);
      }

      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedMimeTypes.includes(file.type)) {
        return c.json(
          { error: "File type not allowed. Only images are accepted." },
          400,
        );
      }

      const { storage } = await import("../services/storage");
      const { generateSecureFilename } =
        await import("../utils/validation/file-validation");
      const filename = generateSecureFilename(file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await storage.upload(filename, buffer, file.type);

      return c.json({ success: true, url, filename });
    } catch (error) {
      console.error("Failed to upload file:", error);
      return c.json({ error: "Failed to upload file" }, 500);
    }
  },
);

export default publicRoutes;
