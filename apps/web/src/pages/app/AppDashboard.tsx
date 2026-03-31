import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "../../hooks/useUser";
import { useCities } from "../../hooks/useSimulation";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { MapPin, Zap, ArrowRight, Wallet, History, Plus, TrendingUp, Clock, Package } from "lucide-react";
import { useState } from "react";
import { TopUpModal } from "../../components/payment/TopUpModal";
import { Link } from "react-router-dom";
import { useToast } from "../../components/ui/Toast";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface HistoryItem {
  id: string;
  createdAt: string;
  cityId: string;
  cityName: string;
  productName: string;
  marketPenetration: number;
}

export function AppDashboard() {
  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const { data: user, isLoading, refetch } = useUser(walletStr || null);
  const { data: cities } = useCities();
  const { data: history } = useQuery({
    queryKey: ["history", walletStr],
    queryFn: async () => {
      if (!walletStr) return [];
      const res = await api.get(`/api/history/${walletStr}`);
      return res as HistoryItem[];
    },
    enabled: !!walletStr,
  });
  const [showTopUp, setShowTopUp] = useState(false);
  const { showToast } = useToast();

  const totalSimulasi = history?.length || 0;
  const lastSim = history && history.length > 0 ? history[0] : null;

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* Welcome Section */}
      <div className="mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white tracking-tight mb-1"
        >
          Tinjauan
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-sm"
        >
          Kelola simulasi intelijen pasar hiperlokal Anda.
        </motion.p>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Credit Card - Large */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-[#111008] border border-amber-500/[0.1] shadow-2xl rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Wallet className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10">
            <div className="text-amber-400/70 text-sm font-medium mb-4 flex items-center gap-2 border border-amber-500/20 bg-amber-500/[0.06] w-fit px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Saldo Aktif
            </div>

            {isLoading ? (
              <div className="h-16 w-32 bg-white/5 animate-pulse rounded-lg mt-4" />
            ) : (
              <div className="flex items-end gap-3 mt-4">
                <div className="text-6xl font-bold text-amber-300 tracking-tight leading-none">
                  {user?.credits || 0}
                </div>
                <div className="text-amber-400/50 text-sm mb-1 font-medium">
                  credit tersisa
                </div>
              </div>
            )}

            <button
              onClick={() => setShowTopUp(true)}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 text-amber-300 hover:text-amber-200 font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Top Up Saldo
            </button>

            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="text-xs text-slate-400 mb-1 leading-relaxed">
                * Satu simulasi memotong satu credit per klaster.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-[#0f0f0d] border border-white/[0.06] shadow-2xl rounded-2xl p-6 flex flex-col justify-center"
        >
          <h3 className="text-white text-lg font-semibold mb-6">Mulai Simulasi</h3>

          <Link
            to="/app/simulate"
            className="group flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-emerald-500/[0.04] hover:border-emerald-500/[0.1] transition-all mb-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/[0.06] flex items-center justify-center transition-all">
                <Zap className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
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
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/[0.06] flex items-center justify-center transition-all">
                <History className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
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

      {/* Dynamic Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Simulasi Terakhir */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0f0f0d] border border-white/[0.06] shadow-lg rounded-xl p-5"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Clock className="w-3.5 h-3.5" />
            Simulasi Terakhir
          </div>
          {lastSim ? (
            <Link to="/app/history" className="group block">
              <div className="text-white font-medium mb-1 group-hover:text-slate-200 transition-colors truncate">
                {lastSim.productName}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                <MapPin className="w-3 h-3" />
                {lastSim.cityName}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-sm">{lastSim.marketPenetration}%</span>
                  <span className="text-slate-500 text-xs">penetrasi</span>
                </div>
                <span className="text-slate-600 text-[10px]">
                  {format(new Date(lastSim.createdAt), "dd MMM yy", { locale: idLocale })}
                </span>
              </div>
            </Link>
          ) : (
            <div className="text-center py-4">
              <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-xs">Belum ada simulasi.</p>
              <Link to="/app/simulate" className="text-white text-xs font-medium mt-2 inline-block hover:text-slate-200 transition-colors">
                Mulai sekarang →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Klaster Tersedia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0f0f0d] border border-white/[0.06] shadow-lg rounded-xl p-5"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <MapPin className="w-3.5 h-3.5" />
            Klaster Tersedia
          </div>
          {cities && cities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <Link
                  key={city.id}
                  to="/app/simulate"
                  className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400 text-xs font-medium hover:bg-emerald-500/[0.08] hover:text-emerald-300 hover:border-emerald-500/20 transition-all"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-xs">Memuat klaster...</p>
            </div>
          )}
        </motion.div>

        {/* Statistik Ringkas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#0f0f0d] border border-white/[0.06] shadow-lg rounded-xl p-5"
        >
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            Statistik
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">Total Simulasi</span>
              <span className="text-emerald-400 font-bold text-lg">{totalSimulasi}</span>
            </div>
            <div className="h-px bg-white/[0.04]" />
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">Credit Terpakai</span>
              <span className="text-amber-300 font-bold text-lg">{totalSimulasi}</span>
            </div>
            <div className="h-px bg-white/[0.04]" />
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">Klaster Aktif</span>
              <span className="text-emerald-400 font-bold text-lg">{cities?.length || 0}</span>
            </div>
          </div>
        </motion.div>
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
