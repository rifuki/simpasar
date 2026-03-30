import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "../../hooks/useUser";
import { motion } from "framer-motion";
import { Beaker, MapPin, Zap, ArrowRight, Wallet } from "lucide-react";
import { useState } from "react";
import { TopUpModal } from "../../components/payment/TopUpModal";
import { Link } from "react-router-dom";
import { useToast } from "../../components/ui/Toast";

const FEATURES = [
  {
    icon: MapPin,
    title: "Multi-Kota",
    desc: "Bandung, Malang, Surabaya, Semarang, Yogyakarta",
    color: "blue",
  },
  {
    icon: Beaker,
    title: "AI Persona",
    desc: "50+ profil konsumen realistis per kota",
    color: "purple",
  },
  {
    icon: Zap,
    title: "Instan",
    desc: "Hasil analisis dalam 30-60 detik",
    color: "amber",
  },
];

export function AppDashboard() {
  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const { data: user, isLoading, refetch } = useUser(walletStr || null);
  const [showTopUp, setShowTopUp] = useState(false);
  const { showToast } = useToast();

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white tracking-tight mb-1"
          >
            Overview
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-sm"
          >
            Manage your hyperlocal market intelligence simulations.
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setShowTopUp(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-slate-200 font-semibold text-sm transition-all"
        >
          Top Up Saldo
        </motion.button>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Credit Card - Large */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-[#0a0a0f] border border-white/[0.08] shadow-2xl rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Wallet className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10">
            <div className="text-slate-400 text-sm font-medium mb-4 flex items-center gap-2 border border-white/10 bg-white/5 w-fit px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              Saldo Aktif
            </div>

            {isLoading ? (
              <div className="h-16 w-32 bg-white/5 animate-pulse rounded-lg" />
            ) : (
              <div className="text-6xl font-bold text-white tracking-tight">
                {user?.credits || 0}
              </div>
            )}

            <div className="text-slate-500 text-sm mt-2">
              credit tersisa
            </div>

            <div className="mt-8 pt-5 border-t border-white/5">
              <div className="text-xs text-slate-400 mb-1">
                1 Simulasi = 1 Credit
              </div>
              <div className="text-xs text-slate-500">1 Kota = 1 Simulasi</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-[#0a0a0f] border border-white/[0.08] shadow-2xl rounded-2xl p-6 flex flex-col justify-center"
        >
          <h3 className="text-white text-lg font-semibold mb-6">Mulai Simulasi</h3>

          <Link
            to="/app/simulate"
            className="group flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-all mb-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                <Beaker className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <div className="text-white font-medium group-hover:text-slate-200 transition-colors">
                  Simulasi Baru
                </div>
                <div className="text-slate-400 text-sm">
                  Analisis pasar untuk produk Anda
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white mt-4 md:mt-0 transition-all group-hover:translate-x-1" />
          </Link>

          <Link
            to="/app/history"
            className="group flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                <Zap className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <div className="text-white font-medium group-hover:text-slate-200 transition-colors">
                  Riwayat Simulasi
                </div>
                <div className="text-slate-400 text-sm">
                  Lihat hasil analisis sebelumnya
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white mt-4 md:mt-0 transition-all group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-[#0a0a0f] border border-white/[0.08] shadow-lg rounded-xl p-5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
              <feature.icon className="w-5 h-5 text-slate-300" />
            </div>
            <h4 className="text-white font-medium mb-1.5">{feature.title}</h4>
            <p className="text-slate-400 text-xs leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* TopUp Modal */}
      {showTopUp && walletStr && (
        <TopUpModal
          walletAddress={walletStr}
          onSuccess={() => {
            setShowTopUp(false);
            refetch();
            showToast("Credit berhasil ditambahkan!", "success");
          }}
          onClose={() => setShowTopUp(false)}
        />
      )}
    </div>
  );
}
