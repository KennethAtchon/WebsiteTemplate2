import { Hono } from "hono";

const app = new Hono();

// Analytics routes placeholder
app.get("/", (c) => c.json({ message: "Analytics API" }));

export default app;
