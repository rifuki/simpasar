import { Hono } from "hono";
import { db } from "../db/database";

export const userRoute = new Hono();

userRoute.get("/me", async (c) => {
  const wallet = c.req.query("wallet");
  if (!wallet) return c.json({ error: "Missing wallet query parameter" }, 400);

  const user = db.query("SELECT * FROM users WHERE wallet_address = ?").get(wallet) as { wallet_address: string, credits: number, created_at: string } | undefined;

  if (!user) {
    // User baru belum punya credit
    return c.json({ wallet_address: wallet, credits: 0 });
  }

  return c.json(user);
});
