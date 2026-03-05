import { Hono } from "hono";
import { authMiddleware, rateLimiter } from "../../middleware/protection";

const analyticsRoutes = new Hono();

// TODO: Move specific analytics route implementations here from parent analytics.ts file
// This helps organize large route files by feature

export default analyticsRoutes;
