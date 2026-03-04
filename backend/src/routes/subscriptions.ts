import { Hono } from "hono";

const app = new Hono();

// Subscriptions routes placeholder
app.get("/", (c) => c.json({ message: "Subscriptions API" }));

export default app;
