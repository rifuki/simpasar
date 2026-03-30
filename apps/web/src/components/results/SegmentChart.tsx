import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { SegmentResult } from "@shared/types";

interface Props {
  segments: SegmentResult[];
}

function getBarColor(pct: number): string {
  if (pct >= 60) return "#10b981";
  if (pct >= 30) return "#f59e0b";
  return "#ef4444";
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: SegmentResult = payload[0].payload;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs shadow-xl max-w-xs">
      <p className="font-semibold text-white mb-1">{d.segmentName}</p>
      <p className="text-emerald-400">{d.willBuyPercentage}% akan membeli</p>
      <p className="text-slate-400 mt-1">{d.mainReason}</p>
      <p className="text-slate-500 mt-1">
        Persepsi harga: <span className="text-slate-300">{d.pricePerception.replace("_", " ")}</span>
      </p>
    </div>
  );
};

export function SegmentChart({ segments }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6"
    >
      <h3 className="text-base font-semibold text-white mb-1">Breakdown per Segmen</h3>
      <p className="text-xs text-slate-500 mb-5">Persentase konsumen yang akan membeli</p>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={segments}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="segmentName"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={160}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="willBuyPercentage" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {segments.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.willBuyPercentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-4 justify-center">
        {[
          { color: "#10b981", label: "≥ 60% (Tinggi)" },
          { color: "#f59e0b", label: "30–59% (Sedang)" },
          { color: "#ef4444", label: "< 30% (Rendah)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
