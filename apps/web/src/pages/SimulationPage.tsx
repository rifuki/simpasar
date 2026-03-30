import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SimulationForm } from "../components/simulation/SimulationForm";
import { LoadingAnimation } from "../components/simulation/LoadingAnimation";
import { SummaryCard } from "../components/results/SummaryCard";
import { SegmentChart } from "../components/results/SegmentChart";
import { PersonaTable } from "../components/results/PersonaTable";
import { ArrowLeft } from "lucide-react";
import { useRunSimulation } from "../hooks/useSimulation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "../hooks/useUser";
import { TopUpModal } from "../components/payment/TopUpModal";
import { useToast } from "../components/ui/Toast";
import type { SimulationRequest, SimulationResult } from "@shared/types";

export function SimulationPage() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const { mutate, isPending, error } = useRunSimulation();
  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const { data: user, refetch: refetchUser } = useUser(walletStr || null);
  const { showToast } = useToast();

  const handleSubmit = (req: SimulationRequest) => {
    if (user && user.credits < 1) {
      showToast("Saldo credit tidak cukup. Silakan top up terlebih dahulu.", "error");
      setShowTopUp(true);
      return;
    }

    setResult(null);
    if (publicKey) {
      req.walletAddress = publicKey.toBase58();
    }
    mutate(req, {
      onSuccess: (data) => {
        setResult(data);
        refetchUser(); // Refresh credits after deduction
        showToast("Simulasi berhasil! 1 credit telah digunakan.", "success");
      },
      onError: (err) => {
        if (err.message?.includes("INSUFFICIENT_CREDITS")) {
          showToast("Saldo credit tidak cukup. Silakan top up terlebih dahulu.", "error");
          setShowTopUp(true);
        } else {
          showToast(err.message || "Gagal menjalankan simulasi", "error");
        }
      },
    });
  };

  const handleReset = () => setResult(null);

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
          {!isPending && !result && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8"
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
          {isPending && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-slate-800/30 border border-slate-700/50 rounded-2xl"
            >
              <LoadingAnimation />
            </motion.div>
          )}

          {/* Results */}
          {result && !isPending && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-white font-semibold">Hasil Simulasi</h2>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition border border-slate-700 hover:border-emerald-500/50 rounded-lg px-3 py-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Simulasi Baru
                </button>
              </div>
              <SummaryCard result={result} />
              <SegmentChart segments={result.segmentBreakdown} />
              <PersonaTable personas={result.personaDetails} />
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
