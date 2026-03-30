import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Grid3X3, LayoutList } from "lucide-react";
import { ClusterCard, IndustryFilter } from "../components/cluster/ClusterCard";
import { ClusterForm } from "../components/cluster/ClusterForm";
import { ChatInterface } from "../components/cluster/ChatInterface";
import { SummaryCard } from "../components/results/SummaryCard";
import { SegmentChart } from "../components/results/SegmentChart";
import { PersonaGrid } from "../components/results/PersonaGrid";
import { LoadingAnimation, SIMULATION_STEPS } from "../components/simulation/LoadingAnimation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "../hooks/useUser";
import { TopUpModal } from "../components/payment/TopUpModal";
import { useToast } from "../components/ui/Toast";
import { api } from "../lib/api";
import type { Cluster, ClusterSimulationRequest, SimulationResult } from "@shared/types";

// Industry filter data
const INDUSTRIES = [
  { id: "fnb", label: "Food & Beverage", color: "orange" },
  { id: "beauty", label: "Beauty", color: "pink" },
  { id: "fashion", label: "Fashion", color: "violet" },
  { id: "retail", label: "Retail", color: "emerald" },
  { id: "services", label: "Services", color: "blue" },
];


export function MarketClusterPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [filteredClusters, setFilteredClusters] = useState<Cluster[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(SIMULATION_STEPS[0].key);
  const [simLabel, setSimLabel] = useState(SIMULATION_STEPS[0].label);
  const [showChat, setShowChat] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);

  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const { data: user, refetch: refetchUser } = useUser(walletStr || null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch clusters on mount
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const response = await api.get("/clusters");
        if (response.success) {
          setClusters(response.data);
          setFilteredClusters(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch clusters:", error);
        showToast("Gagal memuat data cluster", "error");
      }
    };

    fetchClusters();
  }, []);

  // Filter clusters
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

  const handleClusterClick = (cluster: Cluster) => {
    if (!walletStr) {
      showToast("Silakan connect wallet terlebih dahulu", "error");
      return;
    }
    setSelectedCluster(cluster);
  };

  const handleSimulationSubmit = async (request: ClusterSimulationRequest) => {
    if (!walletStr) {
      showToast("Silakan connect wallet terlebih dahulu", "error");
      return;
    }

    if (user && user.credits < 1) {
      showToast("Saldo credit tidak cukup. Silakan top up.", "error");
      setShowTopUp(true);
      return;
    }

    setIsSimulating(true);
    setSelectedCluster(null);
    // Reset to first step
    setSimStep(SIMULATION_STEPS[0].key);
    setSimLabel(SIMULATION_STEPS[0].label);

    try {
      const cityId = mapClusterToCity(request.clusterId);
      const body = JSON.stringify({
        product: {
          name: request.product.name,
          category: getCategoryFromCluster(request.clusterId),
          description: request.product.description,
          price: request.product.price,
          priceUnit: request.product.priceUnit,
        },
        targetCity: cityId,
        additionalContext: request.additionalContext,
        tier: "free",
        walletAddress: walletStr,
      });

      const res = await fetch("/api/simulation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok || !res.body) {
        const errJson = await res.json().catch(() => ({})) as any;
        if (errJson?.error === "INSUFFICIENT_CREDITS") {
          showToast("Saldo credit tidak cukup. Silakan top up terlebih dahulu.", "error");
          setShowTopUp(true);
        } else {
          showToast(errJson?.message || "Gagal menjalankan simulasi", "error");
        }
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE chunks can have multiple events separated by double newline
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const eventMatch = chunk.match(/^event:\s*(\S+)/m);
          const dataMatch = chunk.match(/^data:\s*(.+)/m);
          if (!eventMatch || !dataMatch) continue;

          const event = eventMatch[1];
          const data = JSON.parse(dataMatch[1]);

          if (event === "progress") {
            setSimStep(data.step);
            setSimLabel(data.label);
          } else if (event === "result") {
            const result: SimulationResult = data.data;
            setSimulationResult(result);
            refetchUser();
            // Invalidate history & user caches so Riwayat reflects new simulation
            queryClient.invalidateQueries({ queryKey: ["history", walletStr] });
            queryClient.invalidateQueries({ queryKey: ["user_me", walletStr] });
            showToast("Simulasi berhasil! 1 credit telah digunakan.", "success");
            // Chat NOT opened automatically — user opens manually via button
          } else if (event === "error") {
            showToast(data.message || "Gagal menjalankan simulasi", "error");
          }
        }
      }
    } catch (error: any) {
      console.error("Simulation error:", error);
      showToast(error.message || "Gagal menjalankan simulasi", "error");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setSimulationResult(null);
    setShowChat(false);
  };

  function mapClusterToCity(clusterId: string): string {
    const mappings: Record<string, string> = {
      "fnb-depok": "malang",
      "fnb-yogyakarta": "yogyakarta",
      "fnb-solo": "semarang",
      "fnb-bandung": "bandung",
      "beauty-solo": "semarang",
      "beauty-depok": "malang",
      "beauty-surabaya": "surabaya",
      "fashion-bandung": "bandung",
      "fashion-yogyakarta": "yogyakarta",
      "retail-malang": "malang",
      "services-surabaya": "surabaya",
      "services-semarang": "semarang",
    };
    return mappings[clusterId] || "malang";
  }

  function getCategoryFromCluster(clusterId: string): string {
    if (clusterId.includes("fnb")) return "fnb_beverage";
    if (clusterId.includes("beauty")) return "beauty";
    if (clusterId.includes("fashion")) return "fashion";
    if (clusterId.includes("retail")) return "other";
    return "services";
  }

  return (
    <div className="max-w-7xl mx-auto py-4">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-medium mb-4"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Powered by AI + Data Lapangan Indonesia
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Market Cluster
          </h1>
          <p className="text-slate-400 max-w-xl">
            Pilih cluster market spesifik berdasarkan industri dan kota. Setiap cluster memiliki 
            50+ personas aktif untuk simulasi yang akurat.
          </p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {isSimulating && (
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
            </div>
            <LoadingAnimation currentStep={simStep} label={simLabel} />
          </motion.div>
        )}

        {simulationResult && !isSimulating && (
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
                <p className="text-slate-400 text-sm">{selectedCluster?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChat(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-400 text-sm font-medium transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Konsultasi AI
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition border border-slate-700 hover:border-emerald-500/50 rounded-lg px-3 py-2"
                >
                  Simulasi Baru
                </button>
              </div>
            </div>

            <SummaryCard result={simulationResult} />
            <SegmentChart segments={simulationResult.segmentBreakdown} />
            <PersonaGrid personas={simulationResult.personaDetails} />
          </motion.div>
        )}

        {!isSimulating && !simulationResult && (
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
                <p className="text-slate-400 text-sm">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCluster && (
          <ClusterForm
            cluster={selectedCluster}
            onSubmit={handleSimulationSubmit}
            onClose={() => setSelectedCluster(null)}
            isLoading={isSimulating}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChat && simulationResult && (
          <ChatInterface
            simulationResult={simulationResult}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>

      {showTopUp && walletStr && (
        <TopUpModal
          walletAddress={walletStr}
          onSuccess={() => {
            setShowTopUp(false);
            refetchUser();
          }}
          onClose={() => setShowTopUp(false)}
        />
      )}
    </div>
  );
}
