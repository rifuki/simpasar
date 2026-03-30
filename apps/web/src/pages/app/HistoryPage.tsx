import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Calendar,
  MapPin,
  ArrowRight,
  Loader2,
  X,
  TrendingUp,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import { SummaryCard } from "../../components/results/SummaryCard";
import { SegmentChart } from "../../components/results/SegmentChart";
import { PersonaGrid } from "../../components/results/PersonaGrid";
import type { SimulationResult } from "@shared/types";

interface HistoryItem {
  id: string;
  createdAt: string;
  cityId: string;
  cityName: string;
  productName: string;
  marketPenetration: number;
}

function SimulationDetailModal({
  simId,
  item,
  onClose,
}: {
  simId: string;
  item: HistoryItem;
  onClose: () => void;
}) {
  const { data: detail, isLoading, isError } = useQuery<SimulationResult>({
    queryKey: ["sim_detail", simId],
    queryFn: async () => {
      const res = await api.get(`/api/history/detail/${simId}`);
      return res as SimulationResult;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-4xl my-6 overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#111]">
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight">{item.productName}</h2>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {item.cityName}
              </span>
              <span className="text-white/20">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(item.createdAt), "dd MMMM yyyy, HH:mm", { locale: id })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-black text-emerald-400">{item.marketPenetration}%</div>
              <div className="text-xs text-slate-500">Penetrasi Pasar</div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-sm">Memuat detail simulasi...</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400">
              <BarChart3 className="w-10 h-10 opacity-50" />
              <p className="text-sm">Gagal memuat detail simulasi.</p>
            </div>
          )}

          {detail && !isLoading && (
            <div className="space-y-6">
              <SummaryCard result={detail} />
              <SegmentChart segments={detail.segmentBreakdown} />
              <PersonaGrid personas={detail.personaDetails} />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HistoryPage() {
  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const [selectedSim, setSelectedSim] = useState<HistoryItem | null>(null);

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
    <>
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
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-emerald-400 transition-colors truncate">
                    {item.productName}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {item.cityName}
                  </div>
                </div>
                <div className="text-right ml-4 shrink-0">
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
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium opacity-0 group-hover:opacity-100 group-hover:gap-2 transition-all">
                  Lihat Detail
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSim && (
          <SimulationDetailModal
            simId={selectedSim.id}
            item={selectedSim}
            onClose={() => setSelectedSim(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
