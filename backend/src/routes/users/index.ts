import { Hono } from "hono";
import { authMiddleware, rateLimiter } from "../../middleware/protection";

const userRoutes = new Hono();

// TODO: Move specific user route implementations here from parent users.ts file
// This helps organize large route files by feature

export default userRoutes;
