import { Hono } from "hono";
import { db } from "../db/database";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import { encodeURL, findReference } from "@solana/pay";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import BigNumber from "bignumber.js";

export const paymentRoute = new Hono();

const connection = new Connection(
  process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
  "confirmed"
);
const MERCHANT_WALLET = new PublicKey(
  process.env.MERCHANT_WALLET_ADDRESS || "DhmwD7sVpL9m2QyEdb3d1ZRP1wRkM7qW48eBqR4ZJdb5"
);
// IDRX Token Mint (dummy devnet or provided by env)
const IDRX_SPL_TOKEN = new PublicKey(
  process.env.IDRX_TOKEN_MINT || "HnBXnUjXgqM4R8sQwzC1qT4qQyQ7yvL6xK7uJ3y7vQ6a"
);
// Harga 1 credit = 300000 IDRX
const PRICE_IDRX = new BigNumber(300000);

paymentRoute.get("/checkout", async (c) => {
  const buyerWalletStr = c.req.query("wallet");
  if (!buyerWalletStr) return c.json({ error: "Missing wallet parameter" }, 400);

  const creditsRequested = Math.max(1, Math.min(100, parseInt(c.req.query("credits") || "1", 10)));
  const totalAmount = PRICE_IDRX.multipliedBy(creditsRequested);

  const reference = Keypair.generate().publicKey;
  const status = "pending";
  const now = new Date().toISOString();

  db.run(
    "INSERT INTO payments (reference, wallet_address, amount_sol, credits_requested, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [reference.toBase58(), buyerWalletStr, totalAmount.toNumber(), creditsRequested, status, now]
  );

  const recipient = MERCHANT_WALLET;
  const amount = totalAmount;
  const splToken = IDRX_SPL_TOKEN;
  const label = "SimPasar";
  const message = "Buying credits on SimPasar";
  const memo = "simpasar_credit";

  const url = encodeURL({ recipient, amount, splToken, reference, label, message, memo });

  console.log(`[payment/checkout] Created payment: ref=${reference.toBase58()}, wallet=${buyerWalletStr}, credits=${creditsRequested}`);

  return c.json({
    url: url.toString(),
    reference: reference.toBase58(),
    amount: totalAmount.toNumber(),
    credits: creditsRequested,
    recipient: recipient.toBase58(),
    splToken: splToken.toBase58()
  });
});

paymentRoute.get("/verify", async (c) => {
  const refStr = c.req.query("reference");
  if (!refStr) return c.json({ error: "Missing reference parameter" }, 400);

  const reference = new PublicKey(refStr);
  const payment = db.query("SELECT * FROM payments WHERE reference = ?").get(refStr) as any;

  if (!payment) return c.json({ error: "Payment request not found" }, 404);

  // If already confirmed, return current user credits
  if (payment.status === "confirmed") {
    const user = db.query("SELECT credits FROM users WHERE wallet_address = ?").get(payment.wallet_address) as any;
    const currentCredits = user?.credits || 0;
    console.log(`[payment/verify] Payment already confirmed: ref=${refStr}, currentCredits=${currentCredits}`);
    return c.json({ status: "confirmed", creditsAdded: payment.credits_requested || 1, currentCredits });
  }

  try {
    console.log(`[payment/verify] Looking for transaction: ref=${refStr}`);

    // Wrap findReference with timeout to avoid hanging on slow devnet
    const signatureInfo = await Promise.race([
      findReference(connection, reference, { finality: "confirmed" }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(Object.assign(new Error("timeout"), { name: "FindReferenceError" })), 8000)
      ),
    ]);

    console.log(`[payment/verify] Found signature: ${signatureInfo.signature}`);

    // Manual verification — parse the tx and confirm SPL transfer to merchant ATA
    const expectedAmount = PRICE_IDRX.multipliedBy(payment.credits_requested);
    const expectedRawAmount = expectedAmount.multipliedBy(1e6).toNumber(); // IDRX has 6 decimals
    const merchantATA = getAssociatedTokenAddressSync(IDRX_SPL_TOKEN, MERCHANT_WALLET, true);

    try {
      const tx = await connection.getParsedTransaction(signatureInfo.signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) throw new Error("Transaction not found");

      const instructions = tx.transaction.message.instructions;
      let transferOk = false;

      for (const ix of instructions) {
        if ("parsed" in ix && ix.program === "spl-token") {
          const { type, info } = ix.parsed;
          if (type === "transferChecked" || type === "transfer") {
            const dest: string = info.destination;
            const amount: number = type === "transferChecked" ? info.tokenAmount?.uiAmount * 1e6 : Number(info.amount);
            if (
              dest === merchantATA.toBase58() &&
              amount >= expectedRawAmount * 0.99 // 1% tolerance for rounding
            ) {
              transferOk = true;
              break;
            }
          }
        }
      }

      if (!transferOk) {
        console.error(`[payment/verify] Manual validation failed: no matching transfer to ${merchantATA.toBase58()} for amount ${expectedRawAmount}`);
        return c.json({ status: "validation_failed", error: "Transfer not found or amount mismatch" }, 400);
      }

      console.log(`[payment/verify] Manual validation passed for signature: ${signatureInfo.signature}`);
    } catch (validateError: any) {
      console.error(`[payment/verify] Validation error:`, validateError?.message || validateError);
      return c.json({ status: "validation_failed", error: validateError?.message || "Validation failed" }, 400);
    }

    // Start transaction
    db.run("UPDATE payments SET status = 'confirmed' WHERE reference = ?", [refStr]);

    const creditsToAdd = payment.credits_requested || 1;
    const dbUser = db.query("SELECT credits FROM users WHERE wallet_address = ?").get(payment.wallet_address) as any;

    let currentCredits: number;
    if (dbUser) {
      db.run("UPDATE users SET credits = credits + ? WHERE wallet_address = ?", [creditsToAdd, payment.wallet_address]);
      currentCredits = dbUser.credits + creditsToAdd;
      console.log(`[payment/verify] Updated existing user: wallet=${payment.wallet_address}, added=${creditsToAdd}, total=${currentCredits}`);
    } else {
      db.run(
        "INSERT INTO users (wallet_address, credits, created_at) VALUES (?, ?, ?)",
        [payment.wallet_address, creditsToAdd, new Date().toISOString()]
      );
      currentCredits = creditsToAdd;
      console.log(`[payment/verify] Created new user: wallet=${payment.wallet_address}, credits=${creditsToAdd}`);
    }

    return c.json({ status: "confirmed", creditsAdded: creditsToAdd, currentCredits });
  } catch (error: any) {
    if (error.name === "FindReferenceError") {
      console.log(`[payment/verify] Transaction not found yet: ref=${refStr}`);
      return c.json({ status: "pending", message: "Transaction not found on chain yet" });
    }
    // RPC error or network issue — treat as pending, don't fail the whole flow
    console.error(`[payment/verify] RPC error (treating as pending):`, error.message);
    return c.json({ status: "pending", message: "RPC error, retrying..." });
  }
});

// Debug endpoint to check payment details
paymentRoute.get("/debug/:reference", async (c) => {
  const refStr = c.req.param("reference");
  const payment = db.query("SELECT * FROM payments WHERE reference = ?").get(refStr) as any;

  if (!payment) return c.json({ error: "Payment not found" }, 404);

  const user = db.query("SELECT * FROM users WHERE wallet_address = ?").get(payment.wallet_address) as any;

  return c.json({
    payment: {
      reference: payment.reference,
      wallet_address: payment.wallet_address,
      amount: payment.amount_sol,
      credits_requested: payment.credits_requested,
      status: payment.status,
      created_at: payment.created_at,
    },
    user: user || null,
  });
});

// Manual verify endpoint for admin (to fix stuck payments)
paymentRoute.post("/admin/verify-manual", async (c) => {
  // Simple auth check - in production use proper admin auth
  const adminKey = c.req.header("x-admin-key");
  if (adminKey !== process.env.ADMIN_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { reference: refStr } = body;

  if (!refStr) return c.json({ error: "Missing reference" }, 400);

  const payment = db.query("SELECT * FROM payments WHERE reference = ?").get(refStr) as any;
  if (!payment) return c.json({ error: "Payment not found" }, 404);

  if (payment.status === "confirmed") {
    const user = db.query("SELECT credits FROM users WHERE wallet_address = ?").get(payment.wallet_address) as any;
    return c.json({ status: "already_confirmed", credits: user?.credits || 0 });
  }

  // Manual confirm without blockchain check
  db.run("UPDATE payments SET status = 'confirmed' WHERE reference = ?", [refStr]);

  const creditsToAdd = payment.credits_requested || 1;
  const dbUser = db.query("SELECT credits FROM users WHERE wallet_address = ?").get(payment.wallet_address) as any;

  let currentCredits: number;
  if (dbUser) {
    db.run("UPDATE users SET credits = credits + ? WHERE wallet_address = ?", [creditsToAdd, payment.wallet_address]);
    currentCredits = dbUser.credits + creditsToAdd;
  } else {
    db.run(
      "INSERT INTO users (wallet_address, credits, created_at) VALUES (?, ?, ?)",
      [payment.wallet_address, creditsToAdd, new Date().toISOString()]
    );
    currentCredits = creditsToAdd;
  }

  console.log(`[payment/admin/verify-manual] Manually confirmed: ref=${refStr}, wallet=${payment.wallet_address}, credits=${creditsToAdd}`);

  return c.json({
    status: "confirmed_manually",
    creditsAdded: creditsToAdd,
    currentCredits,
  });
});
