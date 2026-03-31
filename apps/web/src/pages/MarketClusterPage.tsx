import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Grid3X3, LayoutList } from "lucide-react";
import { ClusterCard, IndustryFilter } from "../components/cluster/ClusterCard";
import { ClusterForm } from "../components/cluster/ClusterForm";
import { LoadingAnimation } from "../components/simulation/LoadingAnimation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "../hooks/useUser";
import { TopUpModal } from "../components/payment/TopUpModal";
import { useToast } from "../components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useSimulationStore } from "../stores/useSimulationStore";
import { useNavigate } from "react-router-dom";
import type { Cluster } from "@shared/types";

export function MarketClusterPage() {
  // ── UI-only local state (filter/search/view — tidak perlu persist) ──
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ── Global simulation state dari Zustand ──────────────────
  const {
    phase,
    clusters,
    setClusters,
    selectedCluster,
    selectCluster,
    closeForm,
    startSimulation,
    resetSimulation,
    simulationResult,
    simStep,
    simLabel,
    showTopUp,
    openTopUp,
    closeTopUp,
    simThought,
  } = useSimulationStore();

  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const { data: user, refetch: refetchUser } = useUser(walletStr ?? null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // ── Fetch clusters — hanya jika belum ada di store ────────
  useEffect(() => {
    if (clusters.length > 0) return; // Sudah di-cache di store
    const fetchClusters = async () => {
      try {
        const response = await api.get("/clusters");
        if (response.success) setClusters(response.data);
      } catch {
        showToast("Gagal memuat data cluster", "error");
      }
    };
    fetchClusters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Redirect to result page when simulation finishes ────────
  useEffect(() => {
    if (phase === "result" && simulationResult) {
      navigate(`/app/result/${simulationResult.id}`);
      // Wait a tick before resetting store so we don't flash content
      setTimeout(() => resetSimulation(), 0);
    }
  }, [phase, simulationResult, navigate, resetSimulation]);

  // ── Filter clusters (derived from store's clusters list) ──
  const filteredClusters = useMemo(() => {
    let list = clusters;
    if (activeFilter) list = list.filter((c) => c.industry === activeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.industryLabel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [clusters, activeFilter, searchQuery]);

  // ── Derive industries from cluster data ───────────────────
  const INDUSTRIES = useMemo(() => {
    const seen = new Map<string, { id: string; label: string; color: string }>();
    for (const c of clusters) {
      if (!seen.has(c.industry)) {
        seen.set(c.industry, { id: c.industry, label: c.industryLabel, color: c.color || "orange" });
      }
    }
    return Array.from(seen.values());
  }, [clusters]);

  // ── Handle cluster click ──────────────────────────────────
  const handleClusterClick = (cluster: Cluster) => {
    if (!walletStr) {
      showToast("Silakan connect wallet terlebih dahulu", "error");
      return;
    }
    selectCluster(cluster);
  };

  // ── Handle simulation submit ──────────────────────────────
  const handleSimulationSubmit = (request: any) => {
    if (!walletStr) {
      showToast("Silakan connect wallet terlebih dahulu", "error");
      return;
    }
    if (user && user.credits < 1) {
      showToast("Saldo credit tidak cukup. Silakan top up.", "error");
      openTopUp();
      return;
    }
    startSimulation(request, {
      walletStr,
      onToast: showToast,
      onRefetchUser: refetchUser,
      onInvalidateQueries: (keys) => {
        for (const key of keys) queryClient.invalidateQueries({ queryKey: key });
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto py-4">
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Market Cluster</h1>
          <p className="text-slate-400 max-w-xl">
            Pilih cluster market spesifik berdasarkan industri dan kota. Setiap cluster memiliki{" "}
            personas aktif untuk simulasi yang akurat.
          </p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Loading ───────────────────────────────────────── */}
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-[#0c0c0a] border border-white/[0.07] rounded-2xl flex flex-col pt-4 overflow-hidden"
          >
            <div className="px-6 pb-3 border-b border-white/[0.06] flex justify-between items-center">
              <h3 className="text-emerald-400 font-semibold tracking-wide text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                ANALYZING CLUSTER
              </h3>
              <p className="text-slate-500 text-xs">
                Anda bisa navigasi ke halaman lain — simulasi tetap berjalan di background
              </p>
            </div>
            <LoadingAnimation currentStep={simStep} label={simLabel} thought={simThought} />
          </motion.div>
        )}

        {/* ── Cluster list (idle / form / error) ───────────── */}
        {(phase === "idle" || phase === "form" || phase === "error") && (
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
                    className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
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
                  onClick={() => handleClusterClick(cluster)}
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
                <p className="text-slate-400 text-sm">Coba ubah filter atau kata kunci pencarian Anda</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "form" && selectedCluster && (
          <ClusterForm
            cluster={selectedCluster}
            onSubmit={handleSimulationSubmit}
            onClose={closeForm}
          />
        )}
      </AnimatePresence>

      {/* ── TopUp modal ───────────────────────────────────────── */}
      {showTopUp && walletStr && (
        <TopUpModal
          walletAddress={walletStr}
          onSuccess={() => { closeTopUp(); refetchUser(); }}
          onClose={closeTopUp}
        />
      )}
    </div>
  );
}
