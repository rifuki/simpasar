import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Grid3X3, LayoutList } from "lucide-react";
import { ClusterCard, IndustryFilter } from "../components/cluster/ClusterCard";
import { ClusterForm } from "../components/cluster/ClusterForm";
import { ChatInterface } from "../components/cluster/ChatInterface";
import { SummaryCard } from "../components/results/SummaryCard";
import { SegmentChart } from "../components/results/SegmentChart";
import { PersonaGrid } from "../components/results/PersonaGrid";
import { LoadingAnimation } from "../components/simulation/LoadingAnimation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "../hooks/useUser";
import { TopUpModal } from "../components/payment/TopUpModal";
import { useToast } from "../components/ui/Toast";
import { api } from "../lib/api";
import { useSimulation } from "../contexts/SimulationContext";
import type { Cluster } from "@shared/types";

export function MarketClusterPage() {
  // ── Cluster list state (local — only needed here) ──────────
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [filteredClusters, setFilteredClusters] = useState<Cluster[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ── Global simulation state (persists across route changes) ──
  const sim = useSimulation();

  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const { data: user, refetch: refetchUser } = useUser(walletStr || null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // ── Fetch clusters on mount ────────────────────────────────
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await api.get("/clusters");
        if (response.success) {
          setClusters(response.data);
          setFilteredClusters(response.data);
          // Share with SimulationContext so it can resolve cityId
          (sim as any)._setClusters(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch clusters:", error);
        showToast("Gagal memuat data cluster", "error");
      }
    };
    fetchClusters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter clusters ────────────────────────────────────────
  useEffect(() => {
    let filtered = clusters;
    if (activeFilter) {
      filtered = filtered.filter((c) => c.industry === activeFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.city.toLowerCase().includes(query) ||
          c.industryLabel.toLowerCase().includes(query)
      );
    }
    setFilteredClusters(filtered);
  }, [clusters, activeFilter, searchQuery]);

  // ── Derive industries from API data (no hardcode) ──────────
  const INDUSTRIES = useMemo(() => {
    const seen = new Map<string, { id: string; label: string; color: string }>();
    for (const c of clusters) {
      if (!seen.has(c.industry)) {
        seen.set(c.industry, {
          id: c.industry,
          label: c.industryLabel,
          color: c.color || "orange",
        });
      }
    }
    return Array.from(seen.values());
  }, [clusters]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto py-4">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Market Cluster
          </h1>
          <p className="text-slate-400 max-w-xl">
            Pilih cluster market spesifik berdasarkan industri dan kota. Setiap cluster memiliki{" "}
            50+ personas aktif untuk simulasi yang akurat.
          </p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Loading ────────────────────────────────────────── */}
        {sim.phase === "loading" && (
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
                ANALYZING CLUSTER
              </h3>
              <p className="text-slate-500 text-xs">
                Jangan tutup halaman ini — Anda bisa navigasi dan kembali lagi
              </p>
            </div>
            <LoadingAnimation currentStep={sim.simStep} label={sim.simLabel} />
          </motion.div>
        )}

        {/* ── Result ────────────────────────────────────────── */}
        {sim.phase === "result" && sim.simulationResult && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between sticky top-0 bg-[#0B1121] py-4 z-10 border-b border-slate-800">
              <div>
                <h2 className="text-white font-semibold text-xl">Hasil Simulasi</h2>
                <p className="text-slate-400 text-sm">{sim.selectedCluster?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={sim.openChat}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-400 text-sm font-medium transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Konsultasi AI
                </button>
                <button
                  onClick={sim.resetSimulation}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition border border-slate-700 hover:border-emerald-500/50 rounded-lg px-3 py-2"
                >
                  Simulasi Baru
                </button>
              </div>
            </div>

            <SummaryCard result={sim.simulationResult} />
            <SegmentChart segments={sim.simulationResult.segmentBreakdown} />
            <PersonaGrid personas={sim.simulationResult.personaDetails} />
          </motion.div>
        )}

        {/* ── Cluster list (idle or form opened) ───────────── */}
        {(sim.phase === "idle" || sim.phase === "form" || sim.phase === "error") && (
          <motion.div
            key="clusters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-6 space-y-4">
              <IndustryFilter
                industries={INDUSTRIES}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari cluster..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-slate-500 hover:border-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white/10 text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-white/10 text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-4 text-sm text-slate-400">
              Menampilkan {filteredClusters.length} cluster
            </div>

            <div className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}>
              {filteredClusters.map((cluster, index) => (
                <ClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  onClick={() => sim.selectCluster(cluster)}
                  index={index}
                />
              ))}
            </div>

            {filteredClusters.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-white font-medium mb-2">Tidak ada cluster ditemukan</h3>
                <p className="text-slate-400 text-sm">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form modal (overlay) ──────────────────────────────── */}
      <AnimatePresence>
        {sim.phase === "form" && sim.selectedCluster && (
          <ClusterForm
            cluster={sim.selectedCluster}
            onSubmit={sim.startSimulation}
            onClose={sim.closeForm}
            isLoading={false}
          />
        )}
      </AnimatePresence>

      {/* ── Chat modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {sim.showChat && sim.simulationResult && (
          <ChatInterface
            simulationResult={sim.simulationResult}
            onClose={sim.closeChat}
          />
        )}
      </AnimatePresence>

      {/* ── TopUp modal ───────────────────────────────────────── */}
      {sim.showTopUp && walletStr && (
        <TopUpModal
          walletAddress={walletStr}
          onSuccess={() => {
            sim.closeTopUp();
            refetchUser();
          }}
          onClose={sim.closeTopUp}
        />
      )}
    </div>
  );
}
