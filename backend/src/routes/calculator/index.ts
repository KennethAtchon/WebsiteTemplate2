import { Hono } from "hono";
import { authMiddleware, rateLimiter } from "../../middleware/protection";

const calculatorRoutes = new Hono();

// TODO: Move specific calculator route implementations here from parent calculator.ts file
// This helps organize large route files by feature

export default calculatorRoutes;
