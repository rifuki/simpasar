import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SimulationForm } from "../components/simulation/SimulationForm";
import { LoadingAnimation } from "../components/simulation/LoadingAnimation";
import { SummaryCard } from "../components/results/SummaryCard";
import { SegmentChart } from "../components/results/SegmentChart";
import { PersonaGrid } from "../components/results/PersonaGrid";
import { ArrowLeft } from "lucide-react";
import { useRunSimulation } from "../hooks/useSimulation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "../hooks/useUser";
import { TopUpModal } from "../components/payment/TopUpModal";
import { useToast } from "../components/ui/Toast";
import type { SimulationRequest, SimulationResult } from "@shared/types";

export function SimulationPage() {
  const [results, setResults] = useState<SimulationResult[] | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [simulatingCount, setSimulatingCount] = useState<{current: number, total: number} | null>(null);
  
  const { mutateAsync, isPending, error } = useRunSimulation();
  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const { data: user, refetch: refetchUser } = useUser(walletStr || null);
  const { showToast } = useToast();

  const handleSubmit = async (reqs: SimulationRequest[]) => {
    if (!walletStr) {
      showToast("Silakan connect wallet terlebih dahulu.", "error");
      return;
    }

    if (user && user.credits < reqs.length) {
      showToast(`Saldo credit tidak cukup. Butuh ${reqs.length} credit, saldo Anda ${user.credits}.`, "error");
      setShowTopUp(true);
      return;
    }

    setResults(null);
    setSimulatingCount({ current: 1, total: reqs.length });
    
    const accumulatedResults: SimulationResult[] = [];
    
    try {
      for (let i = 0; i < reqs.length; i++) {
        setSimulatingCount({ current: i + 1, total: reqs.length });
        const req = { ...reqs[i], walletAddress: walletStr };
        const data = await mutateAsync(req);
        accumulatedResults.push(data);
      }
      setResults(accumulatedResults);
      setActiveTab(0);
      refetchUser(); // Refresh credits
      showToast(`Simulasi berhasil! ${reqs.length} credit telah digunakan.`, "success");
    } catch (err: any) {
      if (err.message?.includes("INSUFFICIENT_CREDITS")) {
        showToast("Saldo credit tidak cukup. Silakan top up terlebih dahulu.", "error");
        setShowTopUp(true);
      } else {
        showToast(err.message || "Gagal menjalankan simulasi", "error");
      }
    } finally {
      setSimulatingCount(null);
    }
  };

  const handleReset = () => {
    setResults(null);
    setSimulatingCount(null);
  };

  // Safe checks if results array handles properly
  const isCurrentlySimulating = isPending || simulatingCount !== null;
  const currentResult = results ? results[activeTab] : null;

  return (
    <div className="max-w-4xl mx-auto py-4 relative">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-medium mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Powered by AI + Data Lapangan Indonesia
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-2"
          >
            Market Simulation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400"
          >
            Uji produkmu di pasar lokal sebelum invest. Hasil dalam 60 detik.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {/* Form */}
          {!isCurrentlySimulating && !results && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                  {error.message}
                </div>
              )}
              <SimulationForm onSubmit={handleSubmit} isLoading={false} />
            </motion.div>
          )}

          {/* Loading */}
          {isCurrentlySimulating && simulatingCount && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-800/30 border border-slate-700/50 rounded-2xl flex flex-col pt-4 overflow-hidden"
            >
              <div className="px-6 pb-2 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/40">
                <h3 className="text-emerald-400 font-semibold tracking-wide text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  SIMULATING MARKETS
                </h3>
                <span className="bg-slate-900 px-3 py-1 rounded text-xs font-medium text-slate-300">
                  {simulatingCount.current} / {simulatingCount.total} Kota
                </span>
              </div>
              <LoadingAnimation />
            </motion.div>
          )}

          {/* Results */}
          {results && currentResult && !isCurrentlySimulating && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center sticky top-0 bg-[#0B1121] py-4 z-10 border-b border-slate-800">
                <h2 className="text-white font-semibold text-xl">Hasil Simulasi</h2>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition border border-slate-700 hover:border-emerald-500/50 rounded-lg px-3 py-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Simulasi Baru
                </button>
              </div>

              {results.length > 1 && (
                <div className="flex overflow-x-auto gap-2 pb-2">
                  {results.map((res, idx) => (
                    <button
                      key={res.id}
                      onClick={() => setActiveTab(idx)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
                        activeTab === idx 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                          : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {res.cityContext.cityName}
                    </button>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentResult.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <SummaryCard result={currentResult} />
                  <SegmentChart segments={currentResult.segmentBreakdown} />
                  <PersonaGrid personas={currentResult.personaDetails} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showTopUp && walletStr && (
        <TopUpModal 
          walletAddress={walletStr} 
          onSuccess={() => {
            setShowTopUp(false);
            refetchUser(); // update credit view automatically
          }} 
          onClose={() => setShowTopUp(false)}
        />
      )}
    </div>
  );
}
