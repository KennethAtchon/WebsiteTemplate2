import { Hono } from "hono";
import { authMiddleware, rateLimiter } from "../middleware/protection";

const app = new Hono();

/**
 * GET /api/csrf
 * Returns a CSRF token for the authenticated user.
 * Used by authenticated-fetch.ts before every mutating request.
 */
app.get("/", rateLimiter("public"), authMiddleware("user"), async (c) => {
  try {
    const auth = c.get("auth");
    const { generateCSRFToken } =
      await import("../services/csrf/csrf-protection");

    const token = generateCSRFToken(auth.firebaseUser.uid);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    return c.json({ csrfToken: token, expires });
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return c.json({ error: "Failed to generate CSRF token" }, 500);
  }
});

export default app;
