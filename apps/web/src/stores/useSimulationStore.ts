import { create } from "zustand";
import { SIMULATION_STEPS } from "../components/simulation/LoadingAnimation";
import type { Cluster, ClusterSimulationRequest, SimulationResult } from "@shared/types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type SimPhase =
  | "idle"      // tampil cluster list
  | "form"      // form modal terbuka, cluster sudah dipilih
  | "loading"   // simulasi berjalan (SSE streaming)
  | "result"    // simulasi selesai
  | "error";    // simulasi gagal, form masih terbuka dengan data yang sama

// Form values yang perlu dipertahankan antar navigasi
export interface FormDraft {
  productName: string;
  description: string;
  price: number | undefined;
  priceUnit: string;
  additionalContext: string;
  formStep: "info" | "form";
}

const DEFAULT_FORM_DRAFT: FormDraft = {
  productName: "",
  description: "",
  price: undefined,
  priceUnit: "per_cup",
  additionalContext: "",
  formStep: "info",
};

// ─────────────────────────────────────────────────────────────
// Store State
// ─────────────────────────────────────────────────────────────

interface SimulationStore {
  phase: SimPhase;
  selectedCluster: Cluster | null;
  formDraft: FormDraft;

  // Simulation progress
  simStep: string;
  simLabel: string;
  simThought: string;   // real-time AI token stream

  // Result
  simulationResult: SimulationResult | null;
  errorMessage: string | null;

  // UI toggles
  showChat: boolean;
  showTopUp: boolean;

  // Cluster list cache
  clusters: Cluster[];

  // ── Actions ──────────────────────────────────────────────
  setClusters: (clusters: Cluster[]) => void;
  selectCluster: (cluster: Cluster) => void;
  closeForm: () => void;
  updateDraft: (patch: Partial<FormDraft>) => void;
  startSimulation: (
    request: ClusterSimulationRequest,
    ctx: {
      walletStr: string;
      onToast: (msg: string, type: "success" | "error") => void;
      onRefetchUser: () => void;
      onInvalidateQueries: (keys: string[][]) => void;
    }
  ) => Promise<void>;
  resetSimulation: () => void;
  openChat: () => void;
  closeChat: () => void;
  openTopUp: () => void;
  closeTopUp: () => void;
}

// ─────────────────────────────────────────────────────────────
// Store Implementation
// ─────────────────────────────────────────────────────────────

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  phase: "idle",
  selectedCluster: null,
  formDraft: { ...DEFAULT_FORM_DRAFT },
  simStep: SIMULATION_STEPS[0].key,
  simLabel: SIMULATION_STEPS[0].label,
  simThought: "",
  simulationResult: null,
  errorMessage: null,
  showChat: false,
  showTopUp: false,
  clusters: [],

  setClusters: (clusters) => set({ clusters }),

  selectCluster: (cluster) => {
    const prev = get();
    const sameCluster = prev.selectedCluster?.id === cluster.id;
    set({
      phase: "form",
      selectedCluster: cluster,
      formDraft: sameCluster ? prev.formDraft : {
        ...DEFAULT_FORM_DRAFT,
        priceUnit: cluster.industry === "services"
          ? "per_session"
          : cluster.industry === "fnb"
          ? "per_cup"
          : "per_piece",
        formStep: "info",
      },
    });
  },

  closeForm: () => set({ phase: "idle" }),

  updateDraft: (patch) =>
    set((s) => ({ formDraft: { ...s.formDraft, ...patch } })),

  // ── Start Simulation (SSE) ────────────────────────────────
  startSimulation: async (request, { walletStr, onToast, onRefetchUser, onInvalidateQueries }) => {
    const { clusters, selectedCluster } = get();

    const cluster = clusters.find((c) => c.id === request.clusterId) ?? selectedCluster;
    const cityId = cluster?.cityId ?? request.clusterId;
    const category = cluster?.category ?? "fnb_beverage";

    set({
      phase: "loading",
      simStep: SIMULATION_STEPS[0].key,
      simLabel: SIMULATION_STEPS[0].label,
      simThought: "",
      simulationResult: null,
      errorMessage: null,
      showChat: false,
    });

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
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ""}/api/simulation/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok || !res.body) {
        const errJson = await res.json().catch(() => ({})) as any;
        if (errJson?.error === "INSUFFICIENT_CREDITS") {
          onToast("Saldo credit tidak cukup. Silakan top up.", "error");
          set({ phase: "form", showTopUp: true, errorMessage: "Insufficient credits" });
        } else {
          const msg = errJson?.message || "Gagal menjalankan simulasi";
          onToast(msg, "error");
          set({ phase: "form", errorMessage: msg });
        }
        return;
      }

      // ── SSE Streaming ─────────────────────────────────────
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
            console.log(`[SIM] ${data.step}: ${data.label}`);
            set({ simStep: data.step, simLabel: data.label });
          } else if (event === "thought") {
            set((s) => ({ simThought: s.simThought + data.token }));
          } else if (event === "result") {
            const result: SimulationResult = data.data;
            onRefetchUser();
            onInvalidateQueries([
              ["history", walletStr],
              ["user_me", walletStr],
            ]);
            onToast("Simulasi berhasil! 1 credit telah digunakan.", "success");
            set({
              phase: "result",
              simulationResult: result,
              formDraft: { ...DEFAULT_FORM_DRAFT },
            });
          } else if (event === "error") {
            const msg = data.message || "Gagal menjalankan simulasi";
            onToast(msg, "error");
            set({ phase: "form", errorMessage: msg });
          }
        }
      }
    } catch (err: any) {
      const msg = err?.message || "Koneksi gagal. Coba lagi.";
      console.error("[useSimulationStore]", err);
      onToast(msg, "error");
      set({ phase: "form", errorMessage: msg });
    }
  },

  resetSimulation: () =>
    set({
      phase: "idle",
      simulationResult: null,
      errorMessage: null,
      formDraft: { ...DEFAULT_FORM_DRAFT },
      showChat: false,
    }),

  openChat: () => set({ showChat: true }),
  closeChat: () => set({ showChat: false }),
  openTopUp: () => set({ showTopUp: true }),
  closeTopUp: () => set({ showTopUp: false }),
}));
