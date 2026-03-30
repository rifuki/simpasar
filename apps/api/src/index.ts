import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { simulation } from "./routes/simulation";
import { citiesRoute } from "./routes/cities";
import { adminPersonas } from "./routes/admin/personas";
import { adminCities } from "./routes/admin/cities";
import { adminSimulations } from "./routes/admin/simulations";
import { adminSettings } from "./routes/admin/settings";
import { adminStats } from "./routes/admin/stats";
import { seedIfEmpty } from "./db/seed";

seedIfEmpty();

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "X-Admin-Key"],
  })
);

app.route("/api/simulation", simulation);
app.route("/api/cities", citiesRoute);
app.route("/api/admin/personas", adminPersonas);
app.route("/api/admin/cities", adminCities);
app.route("/api/admin/simulations", adminSimulations);
app.route("/api/admin/settings", adminSettings);
app.route("/api/admin/stats", adminStats);

app.get("/api/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

app.notFound((c) =>
  c.json({ error: "NOT_FOUND", message: "Route tidak ditemukan" }, 404)
);

app.onError((err, c) => {
  console.error("[app error]", err);
  return c.json({ error: "INTERNAL_ERROR", message: err.message }, 500);
});

export default {
  port: Number(process.env.PORT) || 3001,
  fetch: app.fetch,
};
