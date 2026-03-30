import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "../../hooks/useUser";
import { motion } from "framer-motion";
import { Coins, Activity, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { TopUpModal } from "../../components/payment/TopUpModal";
import { Link } from "react-router-dom";
import { useToast } from "../../components/ui/Toast";

export function AppDashboard() {
  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const { data: user, isLoading, refetch } = useUser(walletStr || null);
  const [showTopUp, setShowTopUp] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="max-w-5xl mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Platform Overview</h1>
          <p className="text-slate-400 text-sm">Monitor pemakaian simulasi dan atur modal wallet Anda.</p>
        </div>
        
        <button
          onClick={() => setShowTopUp(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#021A11] font-semibold text-sm transition-all shadow-lg hover:shadow-[0_0_15px_rgba(52,211,153,0.3)]"
        >
          <Coins className="w-4 h-4" /> Top Up Saldo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Credit Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 md:col-span-1 bg-[#111] border border-white/10 rounded-[1.5rem] p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Coins className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="text-slate-400 text-sm font-medium mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            Sisa Credit Simulasi
          </div>
          
          {isLoading ? (
            <div className="h-10 w-24 bg-white/5 animate-pulse rounded-lg mt-2"></div>
          ) : (
            <div className="text-5xl font-black text-white tracking-tighter mt-1 drop-shadow-sm">
              {user?.credits || 0}
            </div>
          )}
          
          <div className="text-xs text-slate-500 mt-4">1 Simulasi = 1 Credit</div>
        </motion.div>

        {/* Info Card 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 md:col-span-1 bg-[#111] border border-white/10 rounded-[1.5rem] p-6"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Status Sistem</div>
          <div className="text-xl font-bold text-white">Online & Akurat</div>
          <p className="text-xs text-slate-500 mt-4 line-clamp-2">Database AI tersinkronisasi dengan data sentimen pasar minggu ini.</p>
        </motion.div>

        {/* Info Card 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 md:col-span-1 bg-[#111] border border-white/10 rounded-[1.5rem] p-6"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-slate-400 text-sm font-medium mb-1">Data Indexing</div>
          <div className="text-xl font-bold text-white">2.5 Juta Entri</div>
          <p className="text-xs text-slate-500 mt-4 line-clamp-2">Cakupan wilayah yang memadai untuk target pulau Jawa dan Bali.</p>
        </motion.div>
      </div>

      {/* Action Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full bg-gradient-to-br from-emerald-900/30 to-black border border-emerald-500/20 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
      >
        <div className="absolute top-1/2 left-[80%] -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="z-10 text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-2">Siap mendominasi pasar?</h2>
          <p className="text-slate-400 text-sm max-w-md">
            Gunakan AI terbaru kami untuk membedah demografi konsumen dan hindari kesalahan fatal sebelum launching.
          </p>
        </div>
        <Link 
          to="/app/simulate" 
          className="z-10 whitespace-nowrap px-6 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors shadow-xl flex items-center gap-2"
        >
          <Zap className="w-5 h-5" /> Mulai Simulasi Baru
        </Link>
      </motion.div>

      {/* TopUp Modal controlled by Dashboard */}
      {showTopUp && walletStr && (
        <TopUpModal
          walletAddress={walletStr}
          onSuccess={() => {
            setShowTopUp(false);
            refetch(); // Force refresh credits
            showToast("Credit berhasil ditambahkan!", "success");
          }}
          onClose={() => setShowTopUp(false)}
        />
      )}
    </div>
  );
}
