import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ParticlesBackground } from "../../components/ui/ParticlesBackground";

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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center font-sans relative overflow-hidden">
      
      {/* Background Particles layer */}
      <ParticlesBackground />

      <Link to="/" className="fixed top-8 left-8 z-50 p-2.5 text-slate-500 hover:text-white transition-all rounded-full hover:bg-white/5 flex items-center gap-2 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="p-10 rounded-3xl bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col items-center">
            {/* Minimal Logo */}
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.05] mb-6">
              <img src="/logo.png" alt="PasarSim" className="w-8 h-8 object-contain" />
            </div>
            
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              PasarSim
            </h1>
            
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Hubungkan wallet Solana Anda untuk masuk ke dashboard.
            </p>
            
            <div className="w-full relative">
              <div className="w-full [&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!h-12 [&_.wallet-adapter-button]:!bg-white [&_.wallet-adapter-button]:!text-black [&_.wallet-adapter-button]:!rounded-xl [&_.wallet-adapter-button]:!font-semibold [&_.wallet-adapter-button]:!text-sm [&_.wallet-adapter-button]:hover:!bg-slate-200 [&_.wallet-adapter-button]:!transition-colors [&_.wallet-adapter-button-start-icon]:!hidden flex justify-center">
                <WalletMultiButton>Hubungkan Wallet</WalletMultiButton>
              </div>
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
}


