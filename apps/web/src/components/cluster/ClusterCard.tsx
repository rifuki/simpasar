import { motion } from "framer-motion";
import {
  Utensils, Sparkles, Shirt, Store, Briefcase,
  Users, TrendingUp, Target, ArrowRight, MapPin
} from "lucide-react";
import type { Cluster } from "@shared/types";

interface ClusterCardProps {
  cluster: Cluster;
  onClick: () => void;
  index?: number;
}

const iconMap = {
  Utensils: Utensils,
  Sparkles: Sparkles,
  Shirt: Shirt,
  Store: Store,
  Briefcase: Briefcase,
};

// Industry accent — subtle tint on icon + glow on hover
const industryAccent: Record<string, { icon: string; iconBg: string; glow: string; dot: string }> = {
  fnb:      { icon: "text-amber-400",   iconBg: "bg-amber-500/8 border-amber-500/15",   glow: "hover:shadow-amber-950/40",   dot: "bg-amber-400" },
  fashion:  { icon: "text-pink-400",    iconBg: "bg-pink-500/8 border-pink-500/15",     glow: "hover:shadow-pink-950/40",    dot: "bg-pink-400" },
  services: { icon: "text-blue-400",    iconBg: "bg-blue-500/8 border-blue-500/15",     glow: "hover:shadow-blue-950/40",    dot: "bg-blue-400" },
  retail:   { icon: "text-violet-400",  iconBg: "bg-violet-500/8 border-violet-500/15", glow: "hover:shadow-violet-950/40",  dot: "bg-violet-400" },
  tech:     { icon: "text-emerald-400", iconBg: "bg-emerald-500/8 border-emerald-500/15", glow: "hover:shadow-emerald-950/40", dot: "bg-emerald-400" },
};
const defaultAccent = { icon: "text-slate-300", iconBg: "bg-white/[0.03] border-white/5", glow: "hover:shadow-white/5", dot: "bg-slate-400" };

const competitionMap = {
  high:   { label: "Tinggi",  color: "text-red-400",     bg: "bg-red-500/8 border-red-500/15" },
  medium: { label: "Sedang",  color: "text-amber-400",   bg: "bg-amber-500/8 border-amber-500/15" },
  low:    { label: "Rendah",  color: "text-emerald-400", bg: "bg-emerald-500/8 border-emerald-500/15" },
};

const marketSizeMap = {
  large:  { label: "Besar",  color: "text-emerald-400" },
  medium: { label: "Sedang", color: "text-amber-400" },
  small:  { label: "Kecil",  color: "text-zinc-400" },
};

function formatCurrency(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}jt`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(0)}rb`;
  return `${num}`;
}

export function ClusterCard({ cluster, onClick, index = 0 }: ClusterCardProps) {
  const Icon = iconMap[cluster.icon as keyof typeof iconMap] || Utensils;
  const accent = industryAccent[cluster.industry] ?? defaultAccent;
  const competition = competitionMap[cluster.competitionLevel];
  const market = marketSizeMap[cluster.marketSize];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className={`group relative bg-[#0c0c0a] border border-white/[0.07] hover:border-white/[0.16] rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl ${accent.glow} overflow-hidden`}
    >
      {/* Subtle background radial glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute top-0 right-0 w-40 h-40 -translate-y-1/2 translate-x-1/2 blur-3xl rounded-full bg-white/[0.03]" />
      </div>

      {/* Header: icon + personas badge */}
      <div className="relative flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl border ${accent.iconBg}`}>
          <Icon className={`w-5 h-5 ${accent.icon}`} />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
          <Users className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 text-[11px] font-semibold">{cluster.activePersonas}</span>
        </div>
      </div>

      {/* Title & Industry */}
      <div className="relative mb-2">
        <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-white/90 transition-colors leading-snug">
          {cluster.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
          <p className="text-[11px] text-zinc-500 font-medium">{cluster.industryLabel}</p>
        </div>
      </div>

      {/* Location */}
      <div className="relative flex items-center gap-1.5 text-zinc-600 text-xs mb-3">
        <MapPin className="w-3 h-3" />
        <span>{cluster.city}, {cluster.province}</span>
      </div>

      {/* Description */}
      <p className="relative text-zinc-500 text-xs mb-4 line-clamp-2 leading-relaxed">
        {cluster.description}
      </p>

      {/* Stats Grid — market size | competition | avg spending */}
      <div className="relative grid grid-cols-3 gap-1.5 mb-4">
        {/* Market size */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-2.5 flex flex-col items-center gap-1">
          <TrendingUp className={`w-3.5 h-3.5 ${market.color}`} />
          <span className={`text-[10px] font-semibold ${market.color}`}>{market.label}</span>
        </div>
        {/* Competition */}
        <div className={`border rounded-xl p-2.5 flex flex-col items-center gap-1 ${competition.bg}`}>
          <Target className={`w-3.5 h-3.5 ${competition.color}`} />
          <span className={`text-[10px] font-semibold ${competition.color}`}>{competition.label}</span>
        </div>
        {/* Avg spending — amber (economic metric) */}
        <div className="bg-amber-500/[0.04] border border-amber-500/[0.1] rounded-xl p-2.5 flex flex-col items-center gap-1">
          <span className="text-[9px] text-amber-600/70 font-medium uppercase tracking-wide">Avg</span>
          <span className="text-amber-400 text-[11px] font-bold">Rp {formatCurrency(cluster.avgSpending)}</span>
        </div>
      </div>

      {/* CTA row */}
      <div className="relative flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <span className="text-zinc-600 text-[11px]">Simulasi sekarang</span>
        <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold group-hover:gap-2 transition-all">
          <span>Mulai</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}

// ── Industry Filter ───────────────────────────────────────────────────────────

interface IndustryFilterProps {
  industries: { id: string; label: string; color: string }[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function IndustryFilter({ industries, activeFilter, onFilterChange }: IndustryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onFilterChange(null)}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
          activeFilter === null
            ? "bg-white/10 text-white border-white/20"
            : "bg-transparent text-zinc-500 border-white/[0.07] hover:border-white/[0.15] hover:text-zinc-300"
        }`}
      >
        Semua
      </button>
      {industries.map((ind) => {
        const acc = industryAccent[ind.id] ?? defaultAccent;
        return (
          <button
            key={ind.id}
            onClick={() => onFilterChange(ind.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              activeFilter === ind.id
                ? `${acc.iconBg} ${acc.icon}`
                : "bg-transparent text-zinc-500 border-white/[0.07] hover:border-white/[0.15] hover:text-zinc-300"
            }`}
          >
            {activeFilter === ind.id && <div className={`w-1.5 h-1.5 rounded-full ${acc.dot}`} />}
            {ind.label}
          </button>
        );
      })}
    </div>
  );
}
