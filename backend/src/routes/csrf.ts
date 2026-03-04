import { Hono } from "hono";

const app = new Hono();

// CSRF routes placeholder
app.get("/", (c) => c.json({ message: "CSRF API" }));

export default app;
