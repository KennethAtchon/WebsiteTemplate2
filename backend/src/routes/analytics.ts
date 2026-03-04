import { Hono } from "hono";
import { rateLimiter } from "../middleware/protection";

const analytics = new Hono();

// All analytics endpoints are fire-and-forget — they log metrics and return 200.

analytics.post("/form-completion", rateLimiter("public"), async (c) => {
  try {
    const data = await c.req.json();
    console.info("[analytics] form-completion:", JSON.stringify(data));
    return c.json({ success: true });
  } catch {
    return c.json({ success: false }, 500);
  }
});

analytics.options("/form-completion", (c) => c.body(null, 200));

analytics.post("/form-progress", rateLimiter("public"), async (c) => {
  try {
    const data = await c.req.json();
    console.info("[analytics] form-progress:", JSON.stringify(data));
    return c.json({ success: true });
  } catch {
    return c.json({ success: false }, 500);
  }
});

analytics.options("/form-progress", (c) => c.body(null, 200));

analytics.post("/search-performance", rateLimiter("public"), async (c) => {
  try {
    const data = await c.req.json();
    console.info("[analytics] search-performance:", JSON.stringify(data));
    return c.json({ success: true });
  } catch {
    return c.json({ success: false }, 500);
  }
});

analytics.options("/search-performance", (c) => c.body(null, 200));

analytics.post("/web-vitals", rateLimiter("public"), async (c) => {
  try {
    const data = await c.req.json();
    console.info("[analytics] web-vitals:", JSON.stringify({
      metric: data.name,
      value: data.value,
      rating: data.rating,
      url: data.url,
    }));
    return c.json({ success: true, message: "Web vital metric recorded" });
  } catch {
    return c.json({ success: false }, 500);
  }
});

analytics.options("/web-vitals", (c) => c.body(null, 200));

export default analytics;
