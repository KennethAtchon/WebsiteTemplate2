import { Hono } from "hono";
import { authMiddleware, rateLimiter } from "../../middleware/protection";

const subscriptionRoutes = new Hono();

// TODO: Move specific subscription route implementations here from parent subscriptions.ts file
// This helps organize large route files by feature

export default subscriptionRoutes;
