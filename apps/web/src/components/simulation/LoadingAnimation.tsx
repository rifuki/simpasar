import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  "Memuat profil konsumen...",
  "Menganalisis daya beli pasar...",
  "Mensimulasikan keputusan pembelian...",
  "Menghitung penetrasi pasar...",
  "Menyusun rekomendasi...",
];

export function LoadingAnimation() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= STEPS.length - 1) return;
    const t = setTimeout(() => setStepIndex((i) => i + 1), 4000);
    return () => clearTimeout(t);
  }, [stepIndex]);

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      {/* Spinner */}
      <div className="relative w-20 h-20">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-emerald-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-t-emerald-400 border-r-emerald-400 border-b-transparent border-l-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          🧠
        </div>
      </div>

      {/* Step text */}
      <div className="h-8 flex items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-slate-400 text-base"
          >
            {STEPS[stepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= stepIndex ? "w-6 bg-emerald-500" : "w-1.5 bg-slate-700"
            }`}
          />
        ))}
      </div>

      <p className="text-slate-600 text-sm">Simulasi memakan waktu 15-30 detik</p>
    </div>
  );
}
