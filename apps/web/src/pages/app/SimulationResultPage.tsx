import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Loader2, ArrowLeft, BarChart3, PanelRightClose, PanelRightOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Hook to track window width
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}
import { SummaryCard } from "../../components/results/SummaryCard";
import { SegmentChart } from "../../components/results/SegmentChart";
import { PersonaGrid } from "../../components/results/PersonaGrid";
import { ChatInterface } from "../../components/cluster/ChatInterface";
import type { SimulationResult } from "@shared/types";

export function SimulationResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const windowWidth = useWindowWidth();
  const isLargeScreen = windowWidth >= 1024;

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (isChatOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isChatOpen]);

  const { data: result, isLoading, isError } = useQuery<SimulationResult>({
    queryKey: ["sim_detail", id],
    queryFn: async () => {
      const res = await api.get(`/api/history/detail/${id}`);
      return res as SimulationResult;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-emerald-400 w-full">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium animate-pulse">Memuat hasil analisis intelijen pasar...</p>
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-red-400 w-full">
        <BarChart3 className="w-12 h-12 opacity-50 mb-2" />
        <h2 className="text-xl font-bold text-white">Data Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 text-center max-w-sm">
          Simulasi tidak ada atau Anda tidak memiliki akses ke data ini.
        </p>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-medium">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full mx-auto py-2 px-2 lg:px-4 h-[calc(100vh-100px)] overflow-hidden flex flex-col">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-4 shrink-0 px-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium hover:bg-white/5 py-1.5 px-3 rounded-lg -ml-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <div className="flex items-center gap-3">
           <button
             onClick={() => setIsChatOpen(!isChatOpen)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
               isChatOpen 
                 ? 'bg-violet-500/20 border-violet-500/30 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                 : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.08]'
             }`}
           >
             {isChatOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
             {isChatOpen ? "Tutup AI" : "Konsultasi AI"}
           </button>
           <div className="hidden sm:flex px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider items-center gap-2">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
             Sesi AI Aktif
           </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex relative">
        {/* Left Column: Data Analysis (Scrollable) */}
        <div className={`flex-1 overflow-y-auto pr-2 pb-20 space-y-6 transition-all duration-300 custom-scrollbar [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 ${!isChatOpen ? 'max-w-5xl mx-auto' : ''}`}>
            <SummaryCard result={result} />
            <SegmentChart segments={result.segmentBreakdown} />
            <PersonaGrid personas={result.personaDetails} />
        </div>

        {/* Mobile Backdrop */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* Right Column: AI Consultant Chat (Fixed Height / Drawer) */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: 20 }}
              animate={{ width: "auto", opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "anticipate" }}
              className={`shrink-0 h-full flex flex-col border border-white/[0.08] bg-[#0c0c0a] rounded-2xl overflow-hidden shadow-2xl z-50
                fixed lg:static top-20 right-4 bottom-4 w-[calc(100vw-32px)] sm:w-[400px] lg:w-[420px] xl:w-[480px] lg:ml-6
              `}
              style={{ height: isLargeScreen ? '100%' : 'calc(100vh - 100px)' }}
            >
                <div className="min-w-[300px] w-full h-full">
                  <ChatInterface simulationResult={result} mode="embedded" onClose={() => setIsChatOpen(false)} />
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
