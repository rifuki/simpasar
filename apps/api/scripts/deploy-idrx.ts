import { createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import bs58 from "bs58";
import fs from "fs";
import path from "path";
import os from "os";

async function main() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  const envPath = path.join(process.cwd(), ".env");
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

  let secretKeyBase58 = process.env.IDRX_AUTHORITY_SECRET;
  let authorityKp: Keypair;
  
  const cliKeyPath = path.join(os.homedir(), ".config", "solana", "id.json");

  if (secretKeyBase58) {
    authorityKp = Keypair.fromSecretKey(bs58.decode(secretKeyBase58));
    console.log("Menggunakan IDRX_AUTHORITY_SECRET yang sudah ada di env.");
  } else {
    // Cari manual jika process.env belum termuat
    const match = envContent.match(/IDRX_AUTHORITY_SECRET=(.+)/);
    if (match) {
      authorityKp = Keypair.fromSecretKey(bs58.decode(match[1].trim()));
      console.log("Menggunakan IDRX_AUTHORITY_SECRET dari file .env lokal.");
    } else if (fs.existsSync(cliKeyPath)) {
      const keyData = JSON.parse(fs.readFileSync(cliKeyPath, "utf-8"));
      authorityKp = Keypair.fromSecretKey(Uint8Array.from(keyData));
      console.log("Menggunakan Keypair dari Solana CLI (id.json).");
      const newSecretBase58 = bs58.encode(authorityKp.secretKey);
      envContent += `\nIDRX_AUTHORITY_SECRET=${newSecretBase58}\n`;
      fs.writeFileSync(envPath, envContent);
    } else {
      authorityKp = Keypair.generate();
      const newSecretBase58 = bs58.encode(authorityKp.secretKey);
      console.log("Membuat IDRX_AUTHORITY_SECRET baru...");
      envContent += `\nIDRX_AUTHORITY_SECRET=${newSecretBase58}\n`;
      fs.writeFileSync(envPath, envContent);
    }
  }
  
  const pubKeyString = authorityKp.publicKey.toBase58();
  console.log("Authority Public Key:", pubKeyString);

  // Pastikan balance cukup
  const balance = await connection.getBalance(authorityKp.publicKey);
  console.log(`Balance saat ini: ${balance / LAMPORTS_PER_SOL} SOL`);
  
  if (balance < LAMPORTS_PER_SOL * 0.05) {
    console.log("\n⚠️ BALANCE TERLALU RENDAH ⚠️");
    console.log("Jaringan Devnet sering menolak request airdrop dari script (Error 429).");
    console.log("Agar aman, silakan copy alamat di atas:");
    console.log(`👉 ${pubKeyString}`);
    console.log("Lalu minta Airdrop secara manual menggunakan link ini:");
    console.log("https://faucet.solana.com/");
    console.log("\nSetelah balance masuk ke alamat tersebut, jalankan script ini lagi!");
    process.exit(1);
  }

  // 2. Buat Mint
  const decimals = 6;
  console.log("Membuat MINT IDRX...");
  const mintAddress = await createMint(
    connection,
    authorityKp,        // payer
    authorityKp.publicKey, // mintAuthority
    null,               // freezeAuthority
    decimals            // decimals
  );
  console.log("Mint Berhasil Dibuat:", mintAddress.toBase58());

  // Tunggu sejenak agar data mint terpropagate di devnet
  console.log("Menunggu propagasi block...");
  await new Promise(r => setTimeout(r, 5000));

  // Simpan Mint ke .env
  envContent = envContent.replace(/IDRX_TOKEN_MINT=.+\n?/g, "");
  envContent += `\nIDRX_TOKEN_MINT=${mintAddress.toBase58()}\n`;
  fs.writeFileSync(envPath, envContent);

  // 3. Tambahkan Metaplex Metadata
  console.log("Menambahkan Metaplex Metadata...");
  const umi = createUmi("https://api.devnet.solana.com");
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(authorityKp.secretKey);
  const umiSigner = createSignerFromKeypair(umi, umiKeypair);
  umi.use(signerIdentity(umiSigner));

  console.log("Menunggu UMI sinkronisasi cache RPC...");
  let isMintReady = false;
  for (let i = 0; i < 20; i++) {
    try {
      const acc = await umi.rpc.getAccount(publicKey(mintAddress.toBase58()));
      if (acc.exists) {
        isMintReady = true;
        break;
      }
    } catch(e) {}
    await new Promise(r => setTimeout(r, 2000));
  }

  if (!isMintReady) {
    console.log("RPC Devnet tidak sinkron... Tetap mencoba.");
  }

  const METADATA_JSON_URL = "https://idrx.co/json/idrx.json";
  
  const tx = createMetadataAccountV3(umi, {
    mint: publicKey(mintAddress.toBase58()),
    mintAuthority: umiSigner,
    payer: umiSigner,
    updateAuthority: umiKeypair.publicKey,
    data: {
      name: "IDRX",
      symbol: "IDRX",
      uri: METADATA_JSON_URL,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null
    },
    isMutable: true,
    collectionDetails: null,
  });

  await tx.sendAndConfirm(umi);
  console.log("Metaplex Metadata Berhasil Dibuat!");

  console.log("\n==============================================");
  console.log("✅ DEPLOYMENT SUKSES! TOKEN MINT TERSIMPAN DI .ENV");
  console.log("==============================================\n");
}

main().catch(console.error);
