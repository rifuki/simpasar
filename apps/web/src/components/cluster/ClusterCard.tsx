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

const colorMap = {
  orange: {
    bg: "from-orange-500/10 to-amber-500/5",
    border: "border-orange-500/20",
    borderHover: "hover:border-orange-500/40",
    text: "text-orange-400",
    icon: "text-orange-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(251,146,60,0.15)]",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  pink: {
    bg: "from-pink-500/10 to-rose-500/5",
    border: "border-pink-500/20",
    borderHover: "hover:border-pink-500/40",
    text: "text-pink-400",
    icon: "text-pink-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(244,114,182,0.15)]",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
  violet: {
    bg: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20",
    borderHover: "hover:border-violet-500/40",
    text: "text-violet-400",
    icon: "text-violet-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(167,139,250,0.15)]",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  },
  emerald: {
    bg: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
    borderHover: "hover:border-emerald-500/40",
    text: "text-emerald-400",
    icon: "text-emerald-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  blue: {
    bg: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-500/20",
    borderHover: "hover:border-blue-500/40",
    text: "text-blue-400",
    icon: "text-blue-400",
    glow: "group-hover:shadow-[0_0_30px_rgba(96,165,250,0.15)]",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
};

const competitionMap = {
  high: { label: "Kompetisi Tinggi", color: "text-red-400" },
  medium: { label: "Kompetisi Sedang", color: "text-yellow-400" },
  low: { label: "Kompetisi Rendah", color: "text-emerald-400" },
};

const marketSizeMap = {
  large: "Market Besar",
  medium: "Market Sedang",
  small: "Market Kecil",
};

function formatCurrency(num: number): string {
  if (num >= 1000000) {
    return `Rp ${(num / 1000000).toFixed(1)}jt`;
  } else if (num >= 1000) {
    return `Rp ${(num / 1000).toFixed(0)}rb`;
  }
  return `Rp ${num}`;
}

export function ClusterCard({ cluster, onClick, index = 0 }: ClusterCardProps) {
  const Icon = iconMap[cluster.icon as keyof typeof iconMap] || Utensils;
  const colors = colorMap[cluster.color as keyof typeof colorMap] || colorMap.orange;
  const competition = competitionMap[cluster.competitionLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`group relative bg-gradient-to-br ${colors.bg} border ${colors.border} ${colors.borderHover} rounded-2xl p-5 cursor-pointer transition-all duration-300 ${colors.glow} overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-all" />
      
      {/* Header with Icon */}
      <div className="relative flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-black/20 ${colors.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${colors.badge}`}>
          {cluster.activePersonas} Personas
        </div>
      </div>

      {/* Title & Industry */}
      <div className="relative mb-3">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-white/90 transition-colors">
          {cluster.name}
        </h3>
        <p className={`text-xs font-medium ${colors.text}`}>
          {cluster.industryLabel}
        </p>
      </div>

      {/* Location */}
      <div className="relative flex items-center gap-1.5 text-slate-400 text-xs mb-3">
        <MapPin className="w-3.5 h-3.5" />
        <span>{cluster.city}, {cluster.province}</span>
      </div>

      {/* Description - truncated */}
      <p className="relative text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
        {cluster.description}
      </p>

      {/* Stats Grid */}
      <div className="relative grid grid-cols-3 gap-2 mb-4">
        <div className="bg-black/20 rounded-lg p-2.5 text-center">
          <TrendingUp className={`w-4 h-4 ${colors.icon} mx-auto mb-1`} />
          <div className="text-white text-xs font-semibold">{marketSizeMap[cluster.marketSize]}</div>
        </div>
        <div className="bg-black/20 rounded-lg p-2.5 text-center">
          <Target className={`w-4 h-4 ${competition.color} mx-auto mb-1`} />
          <div className={`text-xs font-semibold ${competition.color}`}>
            {competition.label.split(" ")[1]}
          </div>
        </div>
        <div className="bg-black/20 rounded-lg p-2.5 text-center">
          <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
          <div className="text-white text-xs font-semibold">{formatCurrency(cluster.avgSpending)}</div>
        </div>
      </div>

      {/* CTA */}
      <div className={`relative flex items-center justify-between pt-3 border-t ${colors.border}`}>
        <span className="text-slate-400 text-xs">Simulasi sekarang</span>
        <div className={`flex items-center gap-1 ${colors.text} text-sm font-medium group-hover:gap-2 transition-all`}>
          <span>Mulai</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

// Filter Button Component for the page
interface IndustryFilterProps {
  industries: { id: string; label: string; color: string }[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export function IndustryFilter({ industries, activeFilter, onFilterChange }: IndustryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onFilterChange(null)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
          activeFilter === null
            ? "bg-white text-black border-white"
            : "bg-transparent text-slate-400 border-slate-700 hover:border-slate-500"
        }`}
      >
        Semua
      </button>
      {industries.map((ind) => (
        <button
          key={ind.id}
          onClick={() => onFilterChange(ind.id)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            activeFilter === ind.id
              ? `bg-${ind.color}-500/20 text-${ind.color}-400 border-${ind.color}-500/50`
              : "bg-transparent text-slate-400 border-slate-700 hover:border-slate-500"
          }`}
        >
          {ind.label}
        </button>
      ))}
    </div>
  );
}
