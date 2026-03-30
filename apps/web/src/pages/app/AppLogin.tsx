import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function AppLogin() {
  const { connected } = useWallet();
  const navigate = useNavigate();

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (connected) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [connected, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center font-sans relative selection:bg-emerald-500/30">
      
      {/* Background Mesh */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-900/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-8 rounded-[2rem] border border-white/5 bg-[#050505] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10"
      >
        <Link to="/" className="absolute top-6 left-6 p-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500/20 to-emerald-900/10 rounded-[1.2rem] flex items-center justify-center mb-8 border border-emerald-500/20 shadow-xl">
          <ShieldAlert className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Access Portal</h2>
        <p className="text-slate-400 mb-10 leading-relaxed text-sm w-4/5 mx-auto">
          Hubungkan wallet Solana Anda untuk masuk ke dashboard simulasi bisnis. Identitas ter-enkripsi otomatis.
        </p>
        
        <div className="flex justify-center flex-col gap-4 w-full">
          <div className="w-full [&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!h-14 [&_.wallet-adapter-button]:!bg-white [&_.wallet-adapter-button]:!text-black [&_.wallet-adapter-button]:!rounded-xl [&_.wallet-adapter-button]:!font-sans [&_.wallet-adapter-button]:!font-semibold [&_.wallet-adapter-button]:!text-base [&_.wallet-adapter-button]:hover:!bg-slate-200 [&_.wallet-adapter-button]:!transition-colors [&_.wallet-adapter-button-start-icon]:!hidden flex justify-center shadow-lg">
            <WalletMultiButton>Connect Wallet</WalletMultiButton>
          </div>
          <div className="text-xs text-slate-500 font-medium">B2B Platform Exclusive</div>
        </div>
      </motion.div>
    </div>
  );
}
