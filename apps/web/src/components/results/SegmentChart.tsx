import { motion } from "framer-motion";
import type { SegmentResult } from "@shared/types";

interface Props {
  segments: SegmentResult[];
}

function getColor(pct: number) {
  if (pct >= 60) return { bar: "#10b981", glow: "rgba(16,185,129,0.15)", text: "text-emerald-400", badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" };
  if (pct >= 30) return { bar: "#f59e0b", glow: "rgba(245,158,11,0.15)", text: "text-amber-400", badge: "bg-amber-500/10 border-amber-500/20 text-amber-400" };
  return { bar: "#ef4444", glow: "rgba(239,68,68,0.15)", text: "text-red-400", badge: "bg-red-500/10 border-red-500/20 text-red-400" };
}

function getLabel(pct: number) {
  if (pct >= 60) return "Tinggi";
  if (pct >= 30) return "Sedang";
  return "Rendah";
}

export function SegmentChart({ segments }: Props) {
  const sorted = [...segments].sort((a, b) => b.willBuyPercentage - a.willBuyPercentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
    >
      <div className="mb-5">
        <h3 className="text-base font-bold text-white">Breakdown per Segmen</h3>
        <p className="text-xs text-slate-500 mt-0.5">Persentase konsumen yang akan membeli produk Anda</p>
      </div>

      <div className="space-y-3">
        {sorted.map((seg, i) => {
          const colors = getColor(seg.willBuyPercentage);
          return (
            <motion.div
              key={seg.segmentName}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }}
              className="group"
            >
              {/* Row header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-slate-300 truncate">{seg.segmentName}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs font-black text-white tabular-nums">{seg.willBuyPercentage}%</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${colors.badge}`}>
                    {getLabel(seg.willBuyPercentage)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-slate-800/80 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: colors.bar, boxShadow: `0 0 8px ${colors.bar}60` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${seg.willBuyPercentage}%` }}
                  transition={{ duration: 0.8, delay: 0.35 + i * 0.07, ease: "easeOut" }}
                />
              </div>

              {/* Reason (shown on hover via opacity) */}
              <p className="mt-1 text-[11px] text-slate-600 group-hover:text-slate-400 transition-colors duration-200 truncate">
                {seg.mainReason}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-5 pt-4 border-t border-white/[0.06] justify-center">
        {[
          { color: "#10b981", label: "≥ 60% Tinggi" },
          { color: "#f59e0b", label: "30–59% Sedang" },
          { color: "#ef4444", label: "< 30% Rendah" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
