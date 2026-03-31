import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, TrendingUp, Handshake, Footprints, AlertOctagon, Zap } from "lucide-react";
import { formatRupiah } from "../../lib/utils";
import type { SimulationResult } from "@shared/types";

interface Props {
  result: SimulationResult;
}

// ── Animated ring gauge ──────────────────────────────────────
function PenetrationGauge({ value }: { value: number }) {
  const R = 52;
  const circ = 2 * Math.PI * R;
  const color = value >= 60 ? "#10b981" : value >= 30 ? "#f59e0b" : "#ef4444";
  const glow = value >= 60 ? "#10b981" : value >= 30 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-36 h-36 mx-auto">
      {/* Glow behind */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20"
        style={{ background: glow }}
      />
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#0f172a" strokeWidth="12" />
        <circle
          cx="60" cy="60" r={R} fill="none"
          stroke="#1e293b" strokeWidth="12"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeLinecap="round"
        />
        <motion.circle
          cx="60" cy="60" r={R}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - value / 100) }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-black text-white tabular-nums"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {value}%
        </motion.span>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">penetrasi</span>
      </div>
    </div>
  );
}

// ── Metric stat block ────────────────────────────────────────
function StatBlock({
  label, value, sub, accent = false, delay = 0,
}: {
  label: string; value: string; sub?: string; accent?: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`relative rounded-2xl p-4 border overflow-hidden ${
        accent
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-white/[0.03] border-white/[0.06]"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-1.5">{label}</p>
      <p className={`text-xl font-black leading-none ${accent ? "text-emerald-400" : "text-white"}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-slate-600 mt-1">{sub}</p>}
    </motion.div>
  );
}

// ── Confidence bar ───────────────────────────────────────────
function ConfidenceBar({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Tinggi" : score >= 50 ? "Sedang" : "Rendah";
  return (
    <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.06]">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Confidence</p>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color, background: `${color}15` }}>
          {label}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-xl font-black text-white tabular-nums">{score}</span>
        <span className="text-slate-600 text-sm mb-0.5">/100</span>
      </div>
      <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export function SummaryCard({ result }: Props) {
  const { summary, cityContext, request } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* ── Hero card ─────────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 overflow-hidden p-6">
        {/* Ambient glow top-right */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Product header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400/80 font-semibold uppercase tracking-widest mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Simulasi selesai · {cityContext.cityName}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">{request.product.name}</h2>
            <p className="text-slate-500 text-sm">
              Rp {request.product.price.toLocaleString("id-ID")} / {request.product.priceUnit.replace("per_", "")}
            </p>
          </div>
          <div className="hidden md:block shrink-0">
            <PenetrationGauge value={summary.marketPenetration} />
          </div>
        </div>

        {/* Mobile gauge */}
        <div className="md:hidden mb-6">
          <PenetrationGauge value={summary.marketPenetration} />
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatBlock
            label="Est. Revenue / Bulan"
            value={formatRupiah(summary.estimatedMonthlyRevenue.low)}
            sub={`s/d ${formatRupiah(summary.estimatedMonthlyRevenue.high)}`}
            delay={0.15}
          />
          <StatBlock
            label="Harga Optimal"
            value={formatRupiah(summary.optimalPriceRange.recommended)}
            sub={`${formatRupiah(summary.optimalPriceRange.min)} – ${formatRupiah(summary.optimalPriceRange.max)}`}
            accent
            delay={0.2}
          />
          <div className="col-span-2 md:col-span-1">
            <ConfidenceBar score={summary.confidenceScore} />
          </div>
        </div>
      </div>

      {/* ── Recommendation ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 overflow-hidden"
      >
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">
          <Lightbulb className="w-4 h-4" />
          Rekomendasi
        </div>
        <p className="text-slate-200 text-sm leading-relaxed">{summary.overallRecommendation}</p>
      </motion.div>

      {/* ── Risks & Opportunities ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risk */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-red-500/15 bg-red-500/5 p-5"
        >
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest mb-4">
            <AlertTriangle className="w-4 h-4" />
            Risiko Utama
          </div>
          <ul className="space-y-2.5">
            {summary.keyRisks.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <span className="mt-1.5 w-1 h-1 bg-red-500/60 rounded-full shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Opportunity */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-5"
        >
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
            <TrendingUp className="w-4 h-4" />
            Peluang
          </div>
          <ul className="space-y-2.5">
            {summary.keyOpportunities.map((o, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <span className="mt-1.5 w-1 h-1 bg-emerald-500/60 rounded-full shrink-0" />
                {o}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── Strategic Intelligence ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Strategic Intelligence
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
            <Zap className="w-2.5 h-2.5" /> AI Analysis
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Sentiment */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-3">
              <Handshake className="w-3 h-3 text-cyan-400" />
              Sentimen
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                style={{ width: `${Math.min(100, (summary.sentimentAnalysis?.positive.length || 1) * 33)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-2">
              {summary.sentimentAnalysis?.positive[0] || "Respons positif"}
            </p>
          </div>

          {/* Foot Traffic */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-3">
              <Footprints className="w-3 h-3 text-orange-400" />
              Foot Traffic
            </div>
            <p className="text-base font-black text-white tracking-tight">
              {summary.footTrafficImpact || "Medium"}
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5 uppercase font-bold">Estimasi Impak</p>
          </div>

          {/* Backfire */}
          <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-3">
            <div className="flex items-center gap-1.5 text-[9px] text-red-400 font-bold uppercase tracking-wider mb-3">
              <AlertOctagon className="w-3 h-3" />
              Backfire
            </div>
            <p className="text-base font-black text-red-400 tracking-tight">
              {summary.backfireWarnings?.length || 0}
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5 uppercase font-bold">Potensi Risiko</p>
          </div>
        </div>

        {/* Backfire warning detail */}
        {summary.backfireWarnings && summary.backfireWarnings.length > 0 && (
          <div className="mt-3 rounded-xl bg-red-500/5 border border-red-500/10 p-3 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-red-500/10 blur-xl rounded-full" />
            <p className="text-[9px] text-red-400/80 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <AlertOctagon className="w-3 h-3" /> Warning Utama
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">{summary.backfireWarnings[0]}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
