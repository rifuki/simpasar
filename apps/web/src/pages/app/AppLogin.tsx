import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { ParticlesBackground } from "../../components/ui/ParticlesBackground";

export function AppLogin() {
  const { connected } = useWallet();
  const navigate = useNavigate();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (connected) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [connected, navigate]);

  return (
    <div 
      className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center font-sans relative overflow-hidden selection:bg-emerald-500/30"
      onMouseMove={handleMouseMove}
    >
      <ParticlesBackground />
      
      {/* Background Spotlight Glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 transition duration-300 opacity-30"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(16, 185, 129, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2
            }
          }
        }}
        className="max-w-md w-full p-10 rounded-[2.5rem] border border-white/5 bg-[#0a0a0f]/60 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] relative z-10"
      >
        <Link to="/" className="absolute top-8 left-8 p-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-white/5 group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
        
        <motion.div 
          variants={{ hidden: { scale: 0.8, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
          className="relative w-24 h-24 mx-auto mb-10 group"
        >
          {/* Animated glow ring */}
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-3xl group-hover:bg-emerald-500/40 transition-all duration-700 animate-pulse" />
          
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-500/10 to-emerald-900/5 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-emerald-500/30 shadow-2xl overflow-hidden">
            <img src="/logo.png" alt="PasarSim Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
          </div>
        </motion.div>
        
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Access Portal</h2>
          <p className="text-slate-400 mb-12 leading-relaxed text-sm w-11/12 mx-auto">
            Hubungkan wallet Solana Anda untuk masuk ke sistem intelijen pasar hiperlokal eksklusif.
          </p>
        </motion.div>
        
        <motion.div 
          variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
          className="flex justify-center flex-col gap-5 w-full"
        >
          <div className="w-full [&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!h-14 [&_.wallet-adapter-button]:!bg-white [&_.wallet-adapter-button]:!text-[#050505] [&_.wallet-adapter-button]:!rounded-2xl [&_.wallet-adapter-button]:!font-sans [&_.wallet-adapter-button]:!font-black [&_.wallet-adapter-button]:!text-sm [&_.wallet-adapter-button]:!uppercase [&_.wallet-adapter-button]:!tracking-widest [&_.wallet-adapter-button]:hover:!bg-emerald-400 [&_.wallet-adapter-button]:!transition-all [&_.wallet-adapter-button-start-icon]:!hidden flex justify-center shadow-2xl">
            <WalletMultiButton>Connect Portal</WalletMultiButton>
          </div>
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em]"
          >
            B2B Identity Verified
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
