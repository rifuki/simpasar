import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";

const IDRX_LOGO = "https://s2.coinmarketcap.com/static/img/coins/200x200/26732.png";

export function FaucetPage() {
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; signature?: string; error?: string } | null>(null);

  const handleAirdrop = async () => {
    if (!publicKey) return;
    setIsLoading(true);
    setResult(null);

    try {
      const res = await api.post("/api/faucet/idrx", { walletAddress: publicKey.toBase58() });
      setResult({ success: true, signature: (res as any).signature });
    } catch (err: any) {
      setResult({ success: false, error: err.message || "Gagal melakukan claim IDRX" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6 relative selection:bg-white/30 selection:text-black">
      
      {/* Vercel-style subtle grid & glow */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-[0.10] blur-[100px] pointer-events-none"></div>

      {/* Top Navigation / Wallet */}
      <div className="absolute top-0 w-full p-6 flex justify-end z-50">
        <div className="[&_.wallet-adapter-button]:!bg-transparent [&_.wallet-adapter-button]:!border [&_.wallet-adapter-button]:!border-white/10 [&_.wallet-adapter-button]:!h-10 [&_.wallet-adapter-button]:!px-4 [&_.wallet-adapter-button]:!rounded-full [&_.wallet-adapter-button]:!font-sans [&_.wallet-adapter-button]:!font-medium [&_.wallet-adapter-button]:!text-sm [&_.wallet-adapter-button-start-icon]:!hidden hover:[&_.wallet-adapter-button]:!bg-white/5 transition-all">
          <WalletMultiButton />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-xl text-center relative z-10 flex flex-col items-center"
      >
        <div className="mb-8 p-[1px] rounded-[1.2rem] bg-gradient-to-br from-white/20 to-white/0 shadow-2xl">
          <div className="bg-black/50 p-2 rounded-[1.2rem] backdrop-blur-sm">
            <img 
              src={IDRX_LOGO} 
              alt="IDRX" 
              className="w-20 h-20 rounded-xl" 
            />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6">
          1,000,000 IDRX
        </h1>
        
        <p className="text-lg text-zinc-400 font-light max-w-md mx-auto mb-12">
          Platform Faucet Eksklusif Developer. Dapatkan saldo uji coba untuk lingkungan pengembangan Devnet Anda.
        </p>

        <div className="w-full max-w-xs flex flex-col items-center gap-4">
          
          {!publicKey && (
            <div className="w-full [&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!h-12 [&_.wallet-adapter-button]:!bg-white [&_.wallet-adapter-button]:!text-black [&_.wallet-adapter-button]:!rounded-xl [&_.wallet-adapter-button]:!font-sans [&_.wallet-adapter-button]:!font-medium [&_.wallet-adapter-button]:!text-base [&_.wallet-adapter-button]:hover:!bg-zinc-200 [&_.wallet-adapter-button]:!transition-colors [&_.wallet-adapter-button-start-icon]:!hidden flex justify-center">
              <WalletMultiButton>Hubungkan Dompet</WalletMultiButton>
            </div>
          )}

          <AnimatePresence mode="wait">
            {publicKey && !result?.success && (
              <motion.button
                key="airdrop-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAirdrop}
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-white text-black font-medium text-base hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-black/70" />
                    Memproses...
                  </>
                ) : (
                  "Klaim Airdrop"
                )}
              </motion.button>
            )}
            
            {result?.success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-6 rounded-2xl bg-[#111] border border-white/10 text-center shadow-xl mb-4"
              >
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-white font-medium text-xl mb-2">Airdrop Berhasil</div>
                <p className="text-zinc-400 text-sm mb-6">
                  Token telah ditambahkan ke dompet Anda.
                </p>
                <a 
                  href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white font-medium text-sm transition-colors"
                >
                  Lihat Transaksi
                </a>
              </motion.div>
            )}

            {result?.error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {result.error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-16">
          <a href="/app" className="group flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors">
            Kembali ke Aplikasi Utama <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
