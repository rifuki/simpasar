import { Hono } from "hono";
import { db } from "../db/database";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import { encodeURL, findReference, validateTransfer } from "@solana/pay";
import BigNumber from "bignumber.js";

export const paymentRoute = new Hono();

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const MERCHANT_WALLET = new PublicKey(
  process.env.MERCHANT_WALLET_ADDRESS || "DhmwD7sVpL9m2QyEdb3d1ZRP1wRkM7qW48eBqR4ZJdb5"
);
// IDRX Token Mint (dummy devnet or provided by env)
const IDRX_SPL_TOKEN = new PublicKey(
  process.env.IDRX_TOKEN_MINT || "HnBXnUjXgqM4R8sQwzC1qT4qQyQ7yvL6xK7uJ3y7vQ6a"
);
// Harga 1 credit = 15000 IDRX
const PRICE_IDRX = new BigNumber(15000);

paymentRoute.get("/checkout", async (c) => {
  const buyerWalletStr = c.req.query("wallet");
  if (!buyerWalletStr) return c.json({ error: "Missing wallet parameter" }, 400);

  const reference = Keypair.generate().publicKey;
  const status = "pending";
  const now = new Date().toISOString();

  // Reusing amount_sol column to store the numeric price
  db.run(
    "INSERT INTO payments (reference, wallet_address, amount_sol, status, created_at) VALUES (?, ?, ?, ?, ?)",
    [reference.toBase58(), buyerWalletStr, PRICE_IDRX.toNumber(), status, now]
  );

  const recipient = MERCHANT_WALLET;
  const amount = PRICE_IDRX;
  const splToken = IDRX_SPL_TOKEN;
  const label = "SimPasar";
  const message = "Top Up 1 Credit Market Simulasi";
  const memo = "simpasar_credit";

  const url = encodeURL({ recipient, amount, splToken, reference, label, message, memo });

  return c.json({
    url: url.toString(),
    reference: reference.toBase58(),
    amount: PRICE_IDRX.toNumber()
  });
});

paymentRoute.get("/verify", async (c) => {
  const refStr = c.req.query("reference");
  if (!refStr) return c.json({ error: "Missing reference parameter" }, 400);

  const reference = new PublicKey(refStr);
  const payment = db.query("SELECT * FROM payments WHERE reference = ?").get(refStr) as any;

  if (!payment) return c.json({ error: "Payment request not found" }, 404);
  if (payment.status === "confirmed") {
    return c.json({ status: "confirmed", creditsAdded: 0 });
  }

  try {
    const signatureInfo = await findReference(connection, reference, { finality: "confirmed" });
    
    await validateTransfer(
      connection,
      signatureInfo.signature,
      { recipient: MERCHANT_WALLET, amount: PRICE_IDRX, splToken: IDRX_SPL_TOKEN, reference },
      { commitment: "confirmed" }
    );
    
    db.run("UPDATE payments SET status = 'confirmed' WHERE reference = ?", [refStr]);
    
    const dbUser = db.query("SELECT credits FROM users WHERE wallet_address = ?").get(payment.wallet_address) as any;
    if (dbUser) {
      db.run("UPDATE users SET credits = credits + 1 WHERE wallet_address = ?", [payment.wallet_address]);
    } else {
      db.run(
        "INSERT INTO users (wallet_address, credits, created_at) VALUES (?, ?, ?)",
        [payment.wallet_address, 1, new Date().toISOString()]
      );
    }

    return c.json({ status: "confirmed", creditsAdded: 1 });
  } catch (error: any) {
    if (error.name === "FindReferenceError") {
      return c.json({ status: "pending" });
    }
    return c.json({ status: "failed", error: error.message }, 400);
  }
});
