import { Hono } from "hono";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import bs58 from "bs58";
import fs from "fs";
import path from "path";

export const faucetRoute = new Hono();

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

faucetRoute.post("/idrx", async (c) => {
  try {
    const { walletAddress } = await c.req.json();
    if (!walletAddress) return c.json({ error: "Missing walletAddress" }, 400);

    // Bypass process.env caching issue by reading the latest .env manually
    const envPath = path.join(process.cwd(), ".env");
    let secretKeyStr = process.env.IDRX_AUTHORITY_SECRET;
    let mintStr = process.env.IDRX_TOKEN_MINT;

    if (fs.existsSync(envPath)) {
      const rawEnv = fs.readFileSync(envPath, "utf-8");
      const secretMatch = rawEnv.match(/IDRX_AUTHORITY_SECRET=(.+)/);
      const mintMatch = rawEnv.match(/IDRX_TOKEN_MINT=(.+)/);
      if (secretMatch) secretKeyStr = secretMatch[1].trim();
      if (mintMatch) mintStr = mintMatch[1].trim();
    }

    if (!secretKeyStr || !mintStr) {
      return c.json({ error: "Faucet not configured (Missing ENVs)" }, 500);
    }

    const authorityKp = Keypair.fromSecretKey(bs58.decode(secretKeyStr));
    const targetWallet = new PublicKey(walletAddress);
    const mintPubkey = new PublicKey(mintStr);

    // Bikin atau dapetin Associated Token Account (ATA) untuk wallet juri
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKp,       // payer
      mintPubkey,        // mint
      targetWallet       // owner
    );

    // Mint 1.000.000 IDRX
    // Ingat bahwa di script deploy kita pasang decimals = 6. 
    // Jadi 1.000.000 token = 1_000_000 * 10^6 satuan terkecil.
    const amount = 1_000_000 * Math.pow(10, 6);

    const sig = await mintTo(
      connection,
      authorityKp,       // payer
      mintPubkey,        // mint
      ata.address,       // destination
      authorityKp,       // authority
      amount
    );

    return c.json({
      success: true,
      signature: sig,
      amountAirdropped: 1000000
    });
  } catch (err: any) {
    console.error("Faucet error:", err);
    return c.json({ error: err.message }, 500);
  }
});
