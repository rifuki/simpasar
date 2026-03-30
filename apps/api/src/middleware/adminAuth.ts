import type { MiddlewareHandler } from "hono";

export const adminAuth: MiddlewareHandler = async (c, next) => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return c.json({ error: "ADMIN_DISABLED", message: "ADMIN_KEY not configured" }, 503);
  }

  const key = c.req.header("X-Admin-Key");
  if (key !== adminKey) {
    return c.json({ error: "UNAUTHORIZED", message: "Invalid admin key" }, 401);
  }

  await next();
};
