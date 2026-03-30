import { motion, AnimatePresence } from "framer-motion";

export const SIMULATION_STEPS = [
  { key: "validating",       label: "Memvalidasi data produk..."         },
  { key: "loading_personas", label: "Memuat profil konsumen..."          },
  { key: "building_prompt",  label: "Menganalisis daya beli pasar..."    },
  { key: "running_ai",       label: "Mensimulasikan keputusan pembelian..."},
  { key: "parsing",          label: "Menghitung penetrasi pasar..."      },
  { key: "saving",           label: "Menyusun rekomendasi..."            },
];

interface LoadingAnimationProps {
  currentStep: string;
  label: string;
}

export function LoadingAnimation({ currentStep, label }: LoadingAnimationProps) {
  const stepIndex = SIMULATION_STEPS.findIndex((s) => s.key === currentStep);
  const progress = stepIndex >= 0 ? ((stepIndex + 1) / SIMULATION_STEPS.length) * 100 : 5;

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      {/* Premium Animated Icon */}
      <div className="relative w-24 h-24">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-emerald-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        {/* Mid ring */}
        <motion.div
          className="absolute inset-2 rounded-full border border-emerald-400/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
        {/* Accent arc */}
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-t-emerald-400 border-r-emerald-400/60 border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-emerald-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Step label */}
      <div className="h-7 flex items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-slate-300 text-base font-medium"
          >
            {label}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-64 space-y-2">
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            initial={{ width: "3%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        {/* Step dots */}
        <div className="flex justify-between gap-1">
          {SIMULATION_STEPS.map((s, i) => (
            <motion.div
              key={s.key}
              className={`flex-1 h-1 rounded-full transition-colors duration-500 ${
                i <= stepIndex ? "bg-emerald-500" : "bg-white/10"
              }`}
              animate={i === stepIndex ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ))}
        </div>
      </div>

      <p className="text-slate-600 text-xs tracking-wide uppercase font-medium">
        Diproses oleh AI · Mohon tunggu
      </p>
    </div>
  );
}
