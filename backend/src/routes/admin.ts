import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// Admin routes placeholder
app.get("/", (c) => c.json({ message: "Admin API" }));

export default app;
