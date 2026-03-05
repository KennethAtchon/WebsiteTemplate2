import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "./middleware/security-headers";
import { getAllowedCorsOrigins } from "./utils/config/envUtil";

// Route imports
import healthRoutes from "./routes/health";
import customerRoutes from "./routes/customer/index";
import adminRoutes from "./routes/admin/index";
import calculatorRoutes from "./routes/calculator/index";
import subscriptionRoutes from "./routes/subscriptions/index";
import publicRoutes from "./routes/public/index";
import analyticsRoutes from "./routes/analytics/index";
import userRoutes from "./routes/users/index";
import csrfRoutes from "./routes/csrf";

const app = new Hono();

// ─── Global Middleware ─────────────────────────────────────────────────────────

// Request logging
app.use("*", logger());

// CORS — dynamic origin validation
app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      const allowed = getAllowedCorsOrigins();
      return allowed.includes(origin) ? origin : "";
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "X-Requested-With",
      "Accept",
      "Accept-Language",
      "X-Timezone",
    ],
    exposeHeaders: [
      "X-Rate-Limit-Limit",
      "X-Rate-Limit-Remaining",
      "X-Rate-Limit-Reset",
    ],
    credentials: true,
    maxAge: 86400,
  })
);

// Security headers for all responses
app.use("*", secureHeaders());

// ─── API Routes ────────────────────────────────────────────────────────────────

app.route("/api/health", healthRoutes);
app.route("/api/customer", customerRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/calculator", calculatorRoutes);
app.route("/api/subscriptions", subscriptionRoutes);
app.route("/api/shared", publicRoutes);
app.route("/api/analytics", analyticsRoutes);
app.route("/api/users", userRoutes);
app.route("/api/csrf", csrfRoutes);

// Standalone routes
app.get("/api/live", (c) => c.json({ status: "ok" }));
app.get("/api/ready", (c) => c.json({ status: "ready" }));

// ─── Start Server ──────────────────────────────────────────────────────────────

const port = parseInt(process.env.PORT || "3001", 10);

console.log(`🚀 Hono backend starting on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
