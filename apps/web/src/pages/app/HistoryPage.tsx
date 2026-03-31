import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import {
  History,
  Calendar,
  MapPin,
  ArrowRight,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { useNavigate } from "react-router-dom";

interface HistoryItem {
  id: string;
  createdAt: string;
  cityId: string;
  cityName: string;
  productName: string;
  marketPenetration: number;
}

export function HistoryPage() {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();

  const { data: history, isLoading } = useQuery({
    queryKey: ["history", walletStr],
    queryFn: async () => {
      if (!walletStr) return [];
      const res = await api.get(`/api/history/${walletStr}`);
      return res as HistoryItem[];
    },
    enabled: !!walletStr,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#0a0a0f] border border-white/5 shadow-2xl flex items-center justify-center mx-auto mb-6">
            <History className="w-8 h-8 text-slate-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-white tracking-tight mb-3">
            Belum Ada Riwayat
          </h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
            Data hasil analisis intelijen pasar Anda akan muncul di sini setelah simulasi dijalankan.
          </p>

          <Link
            to="/app/simulate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-transform active:scale-95"
          >
            Mulai Simulasi Pertama
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto py-6">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white tracking-tight mb-1"
            >
              Riwayat Analisis
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-sm"
            >
              Menampilkan {history.length} simulasi yang pernah Anda jalankan.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/app/simulate"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-all"
            >
              Simulasi Baru
            </Link>
          </motion.div>
        </div>

        {/* History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/app/result/${item.id}`)}
              className="group relative bg-[#0c0c0a] border border-white/[0.08] hover:border-emerald-500/30 rounded-2xl p-6 transition-all cursor-pointer overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent pointer-events-none" />
              <div className="flex items-start justify-between mb-5 relative z-10">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-white font-bold text-lg mb-1.5 group-hover:text-emerald-400 transition-colors truncate">
                    {item.productName}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {item.cityName}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-black text-emerald-400">
                    {item.marketPenetration}%
                  </div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mt-0.5 tracking-wider">Penetrasi</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-white/[0.05] relative z-10">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(item.createdAt), "dd MMM yy, HH:mm", { locale: id })}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold transition-all border border-emerald-500/20 group-hover:bg-emerald-500/20">
                  Lihat Detail
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
