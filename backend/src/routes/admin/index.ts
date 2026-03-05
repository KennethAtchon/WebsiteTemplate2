import { Hono } from "hono";
import { authMiddleware, rateLimiter } from "../../middleware/protection";

const adminRoutes = new Hono();

// TODO: Move specific admin route implementations here from parent admin.ts file
// This helps organize large route files by feature

export default adminRoutes;
