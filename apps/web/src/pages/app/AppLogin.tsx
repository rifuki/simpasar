import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ArrowLeft, Activity, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

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
      className="min-h-screen bg-[#020204] flex items-center justify-center p-6 text-center font-sans relative overflow-hidden selection:bg-emerald-500/30"
      onMouseMove={handleMouseMove}
    >
      {/* 3D Moving Perspective Grid */}
      <div className="cyber-grid" />
      
      {/* Animated Scanline */}
      <div className="scanline" />

      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        className="pointer-events-none absolute inset-0 z-10 transition duration-300 opacity-20"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(16, 185, 129, 0.2),
              transparent 80%
            )
          `,
        }}
      />

      <Link to="/" className="fixed top-8 left-8 z-50 p-3 text-slate-500 hover:text-white transition-all rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 group flex items-center gap-2 font-bold text-xs uppercase tracking-widest backdrop-blur-sm">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Nexus
      </Link>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1, 
            transition: {
              staggerChildren: 0.15,
            }
          }
        }}
        className="relative z-20 w-full max-w-xl"
      >
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          className="flex flex-col items-center"
        >
          {/* Minimalist Tech Branding */}
          <div className="mb-12 relative">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20 rounded-full"
            />
            <div className="relative flex flex-col items-center group">
              <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-2xl bg-[#050505] border border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.1)] group-hover:border-emerald-500/50 transition-all duration-500">
                <Activity className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter mb-2 italic">
                PASARSIM
              </h1>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                  B2B Security Protocol
                </span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-center mb-16"
          >
            <h2 className="text-xl font-bold text-slate-200 mb-4 uppercase tracking-widest leading-none">
              Initialize Data Connection
            </h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
              Unlock hyperlocal market intelligence by authenticating your Solana identity.
            </p>
          </motion.div>
          
          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
            className="w-full max-w-xs space-y-6"
          >
            <div className="wallet-button-wrapper relative group">
              {/* Button Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse" />
              
              <div className="relative [&_.wallet-adapter-button]:!w-full [&_.wallet-adapter-button]:!h-16 [&_.wallet-adapter-button]:!bg-white [&_.wallet-adapter-button]:!text-black [&_.wallet-adapter-button]:!rounded-full [&_.wallet-adapter-button]:!font-black [&_.wallet-adapter-button]:!text-sm [&_.wallet-adapter-button]:!uppercase [&_.wallet-adapter-button]:!tracking-[0.2em] [&_.wallet-adapter-button]:hover:!bg-emerald-400 [&_.wallet-adapter-button]:!transition-all [&_.wallet-adapter-button-start-icon]:!hidden flex justify-center">
                <WalletMultiButton>Auth Identity</WalletMultiButton>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 opacity-30 group">
              <div className="h-px w-8 bg-white/20" />
              <div className="text-[9px] font-bold uppercase tracking-[0.4em] text-white whitespace-nowrap">
                Encrypted Connection
              </div>
              <div className="h-px w-8 bg-white/20" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
