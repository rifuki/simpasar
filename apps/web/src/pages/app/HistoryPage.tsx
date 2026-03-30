import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { motion } from "framer-motion";
import { History, Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";

interface HistoryItem {
  id: string;
  createdAt: string;
  cityId: string;
  cityName: string;
  productName: string;
  marketPenetration: number;
}

export function HistoryPage() {
  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const [_selectedSim, setSelectedSim] = useState<HistoryItem | null>(null);

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
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-medium mb-4"
          >
            <History className="w-3.5 h-3.5" />
            Riwayat Simulasi
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Belum Ada Riwayat
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400"
          >
            Kamu belum pernah menjalankan simulasi. Mulai sekarang!
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-medium mb-4"
        >
          <History className="w-3.5 h-3.5" />
          Riwayat Simulasi
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Riwayat Analisis
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400"
        >
          {history.length} simulasi telah dijalankan
        </motion.p>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedSim(item)}
            className="group bg-[#111] border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 hover:bg-[#16161e] transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-emerald-400 transition-colors">
                  {item.productName}
                </h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  {item.cityName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400">
                  {item.marketPenetration}%
                </div>
                <div className="text-xs text-slate-500">Penetrasi</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(item.createdAt), "dd MMMM yyyy, HH:mm", { locale: id })}
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium group-hover:gap-2 transition-all">
                Lihat Detail
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
