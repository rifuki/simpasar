import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import bs58 from "bs58";
import fs from "fs";
import path from "path";

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  const envPath = path.join(process.cwd(), ".env");
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
  
  const mintMatch = envContent.match(/IDRX_TOKEN_MINT=(.+)/);
  const secretMatch = envContent.match(/IDRX_AUTHORITY_SECRET=(.+)/);
  
  if (!mintMatch || !secretMatch) {
    console.error("Missing IDRX_TOKEN_MINT or IDRX_AUTHORITY_SECRET in .env");
    return;
  }
  
  const mintKey = new PublicKey(mintMatch[1].trim());
  const authorityKeypair = Keypair.fromSecretKey(bs58.decode(secretMatch[1].trim()));
  
  const merchantMatch = envContent.match(/MERCHANT_WALLET_ADDRESS=(.+)/);
  const merchantAddress = merchantMatch ? merchantMatch[1].trim() : "DhmwD7sVpL9m2QyEdb3d1ZRP1wRkM7qW48eBqR4ZJdb5";
  const merchantPubkey = new PublicKey(merchantAddress);

  console.log(`Menyiapkan ATA IDRX untuk merchant wallet: ${merchantAddress}`);
  console.log("Membayar biaya rent fee (~0.002 SOL)...");

  try {
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair, // Admin wallet pays for it
      mintKey,          // IDRX mint
      merchantPubkey,   // Merchant wallet owns the account
      true              // allowOwnerOffCurve
    );

    console.log("Sukses! Merchant ATA dibuat/ditemukan pada alamat:");
    console.log(ata.address.toBase58());
  } catch (error) {
    console.error("Gagal menginisiasi ATA:", error);
  }
}

main().catch(console.error);
