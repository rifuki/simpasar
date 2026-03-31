import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { SIMULATION_STEPS } from "../components/simulation/LoadingAnimation";
import { useToast } from "../components/ui/Toast";
import { useUser } from "../hooks/useUser";
import type { Cluster, ClusterSimulationRequest, SimulationResult } from "@shared/types";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export type SimulationPhase =
  | "idle"       // belum ada apa-apa, tampil cluster list
  | "form"       // user klik cluster, form terbuka
  | "loading"    // simulasi sedang berjalan (SSE streaming)
  | "result"     // simulasi selesai, tampilkan hasil
  | "error";     // simulasi gagal

interface SimulationState {
  phase: SimulationPhase;
  selectedCluster: Cluster | null;
  simStep: string;
  simLabel: string;
  simulationResult: SimulationResult | null;
  errorMessage: string | null;
  showChat: boolean;
  showTopUp: boolean;
}

interface SimulationContextValue extends SimulationState {
  selectCluster: (cluster: Cluster) => void;
  closeForm: () => void;
  startSimulation: (request: ClusterSimulationRequest) => Promise<void>;
  resetSimulation: () => void;
  openChat: () => void;
  closeChat: () => void;
  openTopUp: () => void;
  closeTopUp: () => void;
}

// ────────────────────────────────────────────────────────────
// Context
// ────────────────────────────────────────────────────────────

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}

// ────────────────────────────────────────────────────────────
// Provider — Lives at App level — survives route navigation
// ────────────────────────────────────────────────────────────

const INITIAL_STATE: SimulationState = {
  phase: "idle",
  selectedCluster: null,
  simStep: SIMULATION_STEPS[0].key,
  simLabel: SIMULATION_STEPS[0].label,
  simulationResult: null,
  errorMessage: null,
  showChat: false,
  showTopUp: false,
};

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);

  // Keep clusters available in context for looking up cityId/category
  const clustersRef = useRef<Cluster[]>([]);
  const { publicKey } = useWallet();
  const walletStr = publicKey?.toBase58();
  const { data: user, refetch: refetchUser } = useUser(walletStr ?? null);
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // ── Actions ──────────────────────────────────────────────

  const selectCluster = useCallback((cluster: Cluster) => {
    if (!walletStr) {
      showToast("Silakan connect wallet terlebih dahulu", "error");
      return;
    }
    setState((s) => ({ ...s, phase: "form", selectedCluster: cluster }));
  }, [walletStr, showToast]);

  const closeForm = useCallback(() => {
    setState((s) => ({ ...s, phase: "idle", selectedCluster: null }));
  }, []);

  const openChat = useCallback(() => setState((s) => ({ ...s, showChat: true })), []);
  const closeChat = useCallback(() => setState((s) => ({ ...s, showChat: false })), []);
  const openTopUp = useCallback(() => setState((s) => ({ ...s, showTopUp: true })), []);
  const closeTopUp = useCallback(() => setState((s) => ({ ...s, showTopUp: false })), []);

  const resetSimulation = useCallback(() => {
    setState((s) => ({
      ...INITIAL_STATE,
      // preserve selected cluster so user can re-submit easily
      selectedCluster: s.selectedCluster,
      phase: s.selectedCluster ? "form" : "idle",
    }));
  }, []);

  const startSimulation = useCallback(async (request: ClusterSimulationRequest) => {
    if (!walletStr) {
      showToast("Silakan connect wallet terlebih dahulu", "error");
      return;
    }

    if (user && user.credits < 1) {
      showToast("Saldo credit tidak cukup. Silakan top up.", "error");
      setState((s) => ({ ...s, showTopUp: true }));
      return;
    }

    // Resolve cluster from ref (populated by MarketClusterPage)
    const cluster = clustersRef.current.find((c) => c.id === request.clusterId);
    const cityId = cluster?.cityId ?? request.clusterId;
    const category = cluster?.category ?? "fnb_beverage";

    // Enter loading phase — close form
    setState((s) => ({
      ...s,
      phase: "loading",
      selectedCluster: cluster ?? s.selectedCluster,
      simStep: SIMULATION_STEPS[0].key,
      simLabel: SIMULATION_STEPS[0].label,
      simulationResult: null,
      errorMessage: null,
      showChat: false,
    }));

    const body = JSON.stringify({
      product: {
        name: request.product.name,
        category,
        description: request.product.description,
        price: request.product.price,
        priceUnit: request.product.priceUnit,
      },
      targetCity: cityId,
      additionalContext: request.additionalContext,
      tier: "free",
      walletAddress: walletStr,
    });

    try {
      const res = await fetch("/api/simulation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      // ── Non-SSE error (400, 402, 500, etc) ──────────────
      if (!res.ok || !res.body) {
        const errJson = await res.json().catch(() => ({})) as any;

        if (errJson?.error === "INSUFFICIENT_CREDITS") {
          showToast("Saldo credit tidak cukup. Silakan top up terlebih dahulu.", "error");
          setState((s) => ({
            ...s,
            phase: "form", // kembali ke form, bukan stuck loading
            showTopUp: true,
            errorMessage: "Insufficient credits",
          }));
        } else {
          const msg = errJson?.message || "Gagal menjalankan simulasi";
          showToast(msg, "error");
          setState((s) => ({
            ...s,
            phase: "form", // kembali ke form
            errorMessage: msg,
          }));
        }
        return;
      }

      // ── SSE streaming ─────────────────────────────────────
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const eventMatch = chunk.match(/^event:\s*(\S+)/m);
          const dataMatch = chunk.match(/^data:\s*(.+)/m);
          if (!eventMatch || !dataMatch) continue;

          const event = eventMatch[1];
          const data = JSON.parse(dataMatch[1]);

          if (event === "progress") {
            setState((s) => ({
              ...s,
              simStep: data.step,
              simLabel: data.label,
            }));
          } else if (event === "result") {
            const result: SimulationResult = data.data;
            refetchUser();
            queryClient.invalidateQueries({ queryKey: ["history", walletStr] });
            queryClient.invalidateQueries({ queryKey: ["user_me", walletStr] });
            showToast("Simulasi berhasil! 1 credit telah digunakan.", "success");
            setState((s) => ({
              ...s,
              phase: "result",
              simulationResult: result,
            }));
          } else if (event === "error") {
            const msg = data.message || "Gagal menjalankan simulasi";
            showToast(msg, "error");
            setState((s) => ({
              ...s,
              phase: "form", // kembali ke form, bukan stuck di loading
              errorMessage: msg,
            }));
          }
        }
      }
    } catch (err: any) {
      // Network error / aborted
      const msg = err?.message || "Koneksi gagal. Coba lagi.";
      console.error("[SimulationContext]", err);
      showToast(msg, "error");
      setState((s) => ({
        ...s,
        phase: "form", // selalu balik ke form, tidak pernah stuck
        errorMessage: msg,
      }));
    }
  }, [walletStr, user, showToast, queryClient, refetchUser]);

  // Expose clustersRef setter so MarketClusterPage can populate it
  const value: SimulationContextValue = {
    ...state,
    selectCluster,
    closeForm,
    startSimulation,
    resetSimulation,
    openChat,
    closeChat,
    openTopUp,
    closeTopUp,
  };

  // Attach clustersRef to context value for MarketClusterPage to set
  (value as any)._setClusters = (clusters: Cluster[]) => {
    clustersRef.current = clusters;
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}
