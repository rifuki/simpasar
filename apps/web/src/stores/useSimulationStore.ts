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
  formStep: "info" | "form"; // step di dalam ClusterForm modal
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
  // Core state
  phase: SimPhase;
  selectedCluster: Cluster | null;
  formDraft: FormDraft;

  // Simulation progress
  simStep: string;
  simLabel: string;

  // Result
  simulationResult: SimulationResult | null;
  errorMessage: string | null;

  // UI toggles
  showChat: boolean;
  showTopUp: boolean;

  // Cluster list cache (avoid re-fetching)
  clusters: Cluster[];

  // ── Actions ──────────────────────────────────────────────

  // Cluster list
  setClusters: (clusters: Cluster[]) => void;

  // Select cluster → open form (back to "info" tab)
  selectCluster: (cluster: Cluster) => void;

  // Close form → back to cluster list (preserve draft untuk kalau buka lagi)
  closeForm: () => void;

  // Update form draft fields as user types
  updateDraft: (patch: Partial<FormDraft>) => void;

  // Run simulation (SSE) — needs wallet & toast injected
  startSimulation: (
    request: ClusterSimulationRequest,
    ctx: {
      walletStr: string;
      onToast: (msg: string, type: "success" | "error") => void;
      onRefetchUser: () => void;
      onInvalidateQueries: (keys: string[][]) => void;
    }
  ) => Promise<void>;

  // Reset back to cluster list (clear result)
  resetSimulation: () => void;

  // Chat & TopUp
  openChat: () => void;
  closeChat: () => void;
  openTopUp: () => void;
  closeTopUp: () => void;
}

// ─────────────────────────────────────────────────────────────
// Store Implementation
// ─────────────────────────────────────────────────────────────

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  phase: "idle",
  selectedCluster: null,
  formDraft: { ...DEFAULT_FORM_DRAFT },
  simStep: SIMULATION_STEPS[0].key,
  simLabel: SIMULATION_STEPS[0].label,
  simulationResult: null,
  errorMessage: null,
  showChat: false,
  showTopUp: false,
  clusters: [],

  // ── Cluster list ─────────────────────────────────────────
  setClusters: (clusters) => set({ clusters }),

  // ── Select cluster ────────────────────────────────────────
  // Mempertahankan formDraft yang sudah ada jika cluster sama
  selectCluster: (cluster) => {
    const prev = get();
    const sameCLuster = prev.selectedCluster?.id === cluster.id;
    set({
      phase: "form",
      selectedCluster: cluster,
      // Kalau pilih cluster yang sama, pertahankan draft. Kalau beda, reset
      formDraft: sameCLuster ? prev.formDraft : {
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

  // ── Close form ────────────────────────────────────────────
  // TIDAK reset draft — user bisa balik dan lanjut isi form
  closeForm: () => set({ phase: "idle" }),

  // ── Update draft ──────────────────────────────────────────
  updateDraft: (patch) =>
    set((s) => ({ formDraft: { ...s.formDraft, ...patch } })),

  // ── Start Simulation (SSE) ────────────────────────────────
  startSimulation: async (request, { walletStr, onToast, onRefetchUser, onInvalidateQueries }) => {
    const { clusters, selectedCluster } = get();

    // Resolve cluster info
    const cluster = clusters.find((c) => c.id === request.clusterId) ?? selectedCluster;
    const cityId = cluster?.cityId ?? request.clusterId;
    const category = cluster?.category ?? "fnb_beverage";

    // Enter loading phase (form closes, loading shown)
    set({
      phase: "loading",
      simStep: SIMULATION_STEPS[0].key,
      simLabel: SIMULATION_STEPS[0].label,
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
      const res = await fetch("/api/simulation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      // ── HTTP error (400, 402, 500, etc.) ─────────────────
      if (!res.ok || !res.body) {
        const errJson = await res.json().catch(() => ({})) as any;

        if (errJson?.error === "INSUFFICIENT_CREDITS") {
          onToast("Saldo credit tidak cukup. Silakan top up.", "error");
          // Balik ke form — form masih berisi data yang sudah diisi
          set({ phase: "form", showTopUp: true, errorMessage: "Insufficient credits" });
        } else {
          const msg = errJson?.message || "Gagal menjalankan simulasi";
          onToast(msg, "error");
          // Balik ke form dengan pesan error — draft terjaga
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
            set({ simStep: data.step, simLabel: data.label });
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
              // Bersihkan draft setelah berhasil
              formDraft: { ...DEFAULT_FORM_DRAFT },
            });
          } else if (event === "error") {
            const msg = data.message || "Gagal menjalankan simulasi";
            onToast(msg, "error");
            // Kembali ke form, draft masih ada, user tinggal klik submit lagi
            set({ phase: "form", errorMessage: msg });
          }
        }
      }
    } catch (err: any) {
      const msg = err?.message || "Koneksi gagal. Coba lagi.";
      console.error("[useSimulationStore]", err);
      onToast(msg, "error");
      // Network error → balik ke form, draft masih ada
      set({ phase: "form", errorMessage: msg });
    }
  },

  // ── Reset ke cluster list ─────────────────────────────────
  resetSimulation: () =>
    set({
      phase: "idle",
      simulationResult: null,
      errorMessage: null,
      formDraft: { ...DEFAULT_FORM_DRAFT },
      showChat: false,
    }),

  // ── Chat ──────────────────────────────────────────────────
  openChat: () => set({ showChat: true }),
  closeChat: () => set({ showChat: false }),

  // ── TopUp ─────────────────────────────────────────────────
  openTopUp: () => set({ showTopUp: true }),
  closeTopUp: () => set({ showTopUp: false }),
}));
