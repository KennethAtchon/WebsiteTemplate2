import { Hono } from "hono";

const app = new Hono();

// Public/shared routes placeholder
app.get("/", (c) => c.json({ message: "Public API" }));

export default app;
