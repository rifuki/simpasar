import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, TrendingUp, Handshake, Footprints, AlertOctagon } from "lucide-react";
import { formatRupiah } from "../../lib/utils";
import type { SimulationResult } from "@shared/types";

interface Props {
  result: SimulationResult;
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {value}{suffix}
    </motion.span>
  );
}

function PenetrationGauge({ value }: { value: number }) {
  const color = value >= 60 ? "#10b981" : value >= 30 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
        <motion.circle
          cx="50" cy="50" r="40"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 40}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - value / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">
          <AnimatedNumber value={value} suffix="%" />
        </span>
        <span className="text-xs text-slate-400">penetrasi</span>
      </div>
    </div>
  );
}

export function SummaryCard({ result }: Props) {
  const { summary, cityContext, request } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 space-y-6"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Simulasi selesai • {cityContext.cityName}
        </div>
        <h2 className="text-xl font-semibold text-white">
          {request.product.name}
        </h2>
        <p className="text-slate-400 text-sm">
          Rp {request.product.price.toLocaleString("id-ID")} / {request.product.priceUnit.replace("per_", "")}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <PenetrationGauge value={summary.marketPenetration} />
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-3">
          <div className="bg-slate-900/60 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Est. Revenue/Bulan</p>
            <p className="text-lg font-bold text-white">
              {formatRupiah(summary.estimatedMonthlyRevenue.low)}
            </p>
            <p className="text-xs text-slate-500">
              s/d {formatRupiah(summary.estimatedMonthlyRevenue.high)}
            </p>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Harga Optimal</p>
            <p className="text-lg font-bold text-emerald-400">
              {formatRupiah(summary.optimalPriceRange.recommended)}
            </p>
            <p className="text-xs text-slate-500">
              {formatRupiah(summary.optimalPriceRange.min)} –{" "}
              {formatRupiah(summary.optimalPriceRange.max)}
            </p>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Confidence Score</p>
            <p className="text-lg font-bold text-white">
              {summary.confidenceScore}
              <span className="text-sm text-slate-400">/100</span>
            </p>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Kota</p>
            <p className="text-lg font-bold text-white">{cityContext.cityName}</p>
            <p className="text-xs text-slate-500 truncate">{cityContext.marketSize}</p>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
        <p className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-2">
          <Lightbulb className="w-4 h-4" /> Rekomendasi
        </p>
        <p className="text-slate-300 text-sm leading-relaxed">
          {summary.overallRecommendation}
        </p>
      </div>

      {/* Risks & Opportunities */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/40 rounded-xl p-4 border border-red-500/10">
          <p className="flex items-center gap-2 text-xs font-medium text-red-400 mb-3">
            <AlertTriangle className="w-4 h-4" /> Risiko Utama
          </p>
          <ul className="space-y-1.5">
            {summary.keyRisks.map((r, i) => (
              <li key={i} className="text-xs text-slate-400 flex gap-2">
                <span className="text-slate-600 shrink-0">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-slate-900/40 rounded-xl p-4 border border-emerald-500/10">
          <p className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-3">
            <TrendingUp className="w-4 h-4" /> Peluang
          </p>
          <ul className="space-y-1.5">
            {summary.keyOpportunities.map((o, i) => (
              <li key={i} className="text-xs text-slate-400 flex gap-2">
                <span className="text-slate-600 shrink-0">•</span>
                {o}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strategic Intelligence (NEW) */}
      <div className="pt-4 border-t border-slate-700/50 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Strategic Intelligence</h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/60 rounded-xl p-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
              <Handshake className="w-3.5 h-3.5 text-blue-400" /> SENTIMEN
            </div>
            <div className="flex gap-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${(summary.sentimentAnalysis?.positive.length || 1) * 33}%` }} />
              <div className="bg-slate-500 h-full" style={{ width: `${(summary.sentimentAnalysis?.neutral.length || 1) * 33}%` }} />
              <div className="bg-red-500 h-full" style={{ width: `${(summary.sentimentAnalysis?.negative.length || 1) * 33}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic line-clamp-1">
              "{summary.overallRecommendation.split('.')[0]}"
            </p>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
              <Footprints className="w-3.5 h-3.5 text-orange-400" /> FOOT TRAFFIC
            </div>
            <div className="text-sm font-bold text-white capitalize">
              {summary.footTrafficImpact || "Medium"}
            </div>
            <div className="text-[9px] text-slate-500 mt-1 uppercase">Impact Level</div>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-3 border border-red-500/20">
            <div className="flex items-center gap-2 text-[10px] text-red-400 mb-2">
              <AlertOctagon className="w-3.5 h-3.5" /> BACKFIRE ALERTS
            </div>
            <div className="text-sm font-bold text-red-500">
              {summary.backfireWarnings?.length || 0}
            </div>
            <div className="text-[9px] text-slate-500 mt-1 uppercase">Potential Blunders</div>
          </div>
        </div>

        {summary.backfireWarnings && summary.backfireWarnings.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
            <p className="text-[10px] text-red-400 font-bold mb-1 uppercase tracking-tighter">⚠️ Backfire Warning</p>
            <p className="text-[11px] text-slate-400 leading-tight">
              {summary.backfireWarnings[0]}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
