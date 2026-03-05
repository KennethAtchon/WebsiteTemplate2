import { Hono } from "hono";
import { authMiddleware, rateLimiter } from "../../middleware/protection";

const customerRoutes = new Hono();

// TODO: Move specific customer route implementations here from parent customer.ts file
// This helps organize large route files by feature

export default customerRoutes;
