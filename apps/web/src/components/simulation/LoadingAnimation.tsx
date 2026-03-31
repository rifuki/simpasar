import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export const SIMULATION_STEPS = [
  { key: "validating",       label: "Validasi",   desc: "Memvalidasi data produk..."            },
  { key: "loading_personas", label: "Personas",   desc: "Memuat profil konsumen..."             },
  { key: "building_prompt",  label: "Analisis",   desc: "Menganalisis daya beli pasar..."       },
  { key: "running_ai",       label: "AI Running", desc: "Mensimulasikan keputusan pembelian..." },
  { key: "parsing",          label: "Parsing",    desc: "Menghitung penetrasi pasar..."         },
  { key: "saving",           label: "Selesai",    desc: "Menyusun rekomendasi..."               },
];

interface LoadingAnimationProps {
  currentStep: string;
  label: string;
  thought?: string;
}

export function LoadingAnimation({ currentStep, thought = "" }: LoadingAnimationProps) {
  const stepIndex = SIMULATION_STEPS.findIndex((s) => s.key === currentStep);
  const thoughtRef = useRef<HTMLDivElement>(null);

  // Auto-scroll thought panel to bottom as tokens arrive
  useEffect(() => {
    if (thoughtRef.current) {
      thoughtRef.current.scrollTop = thoughtRef.current.scrollHeight;
    }
  }, [thought]);

  return (
    <div className="py-10 px-8 flex flex-col gap-8">

      {/* Step tracker */}
      <div className="flex items-start gap-0">
        {SIMULATION_STEPS.map((step, i) => {
          const isDone = i < stepIndex;
          const isCurrent = i === stepIndex;
          const isPending = i > stepIndex;

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-0">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isDone
                    ? "bg-emerald-500/20 border border-emerald-500/40"
                    : isCurrent
                      ? "bg-emerald-500/10 border border-emerald-500/50"
                      : "bg-white/[0.03] border border-white/[0.08]"
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-emerald-400"
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/[0.12]" />
                  )}
                </div>
                <span className={`text-[9px] font-medium tracking-wide whitespace-nowrap ${
                  isDone ? "text-emerald-500/60" : isCurrent ? "text-emerald-400" : "text-zinc-700"
                }`}>
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < SIMULATION_STEPS.length - 1 && (
                <div className="flex-1 h-px mx-1.5 mb-4 overflow-hidden bg-white/[0.06] rounded-full">
                  <motion.div
                    className="h-full bg-emerald-500/40 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: isDone ? "100%" : isCurrent ? "50%" : "0%" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current step label */}
      <div className="flex items-center gap-3">
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="text-zinc-300 text-sm font-medium"
          >
            {SIMULATION_STEPS.find(s => s.key === currentStep)?.desc ?? "Memproses..."}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Live AI output — appears when thought tokens start arriving */}
      <AnimatePresence>
        {thought.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-1 rounded-full bg-emerald-400/60 animate-pulse" />
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">Live Output</span>
            </div>
            <div
              ref={thoughtRef}
              className="bg-black/50 border border-white/[0.05] rounded-xl p-4 h-36 overflow-y-auto font-mono text-[11px] text-zinc-400 leading-relaxed scroll-smooth whitespace-pre-wrap break-all"
            >
              {thought}
              <motion.span
                className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-0.5 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
