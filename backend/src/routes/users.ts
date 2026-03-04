import { Hono } from "hono";

const app = new Hono();

// Users routes placeholder
app.get("/", (c) => c.json({ message: "Users API" }));

export default app;
