import { motion } from "framer-motion";
import { User, HelpCircle, XCircle, CheckCircle2, MinusCircle } from "lucide-react";
import type { PersonaSimResult } from "@shared/types";

interface PersonaGridProps {
  personas: PersonaSimResult[];
}

const getDecisionIcon = (decision: string) => {
  switch (decision) {
    case "buy":
      return <CheckCircle2 className="w-4 h-4" />;
    case "consider":
      return <MinusCircle className="w-4 h-4" />;
    case "pass":
      return <XCircle className="w-4 h-4" />;
    default:
      return <HelpCircle className="w-4 h-4" />;
  }
};

const getDecisionStyle = (decision: string) => {
  switch (decision) {
    case "buy":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "consider":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "pass":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

const getDecisionLabel = (decision: string) => {
  switch (decision) {
    case "buy":
      return "Beli";
    case "consider":
      return "Pertimbangkan";
    case "pass":
      return "Lewati";
    default:
      return decision;
  }
};

const getPersonaIcon = (persona: PersonaSimResult) => {
  // Simple heuristic based on occupation and age group
  if (persona.occupation?.toLowerCase().includes("pelajar") || persona.occupation?.toLowerCase().includes("mahasiswa")) {
    return "🎓";
  }
  if (persona.occupation?.toLowerCase().includes("ibu") || persona.occupation?.toLowerCase().includes("rumah tangga")) {
    return "👩‍👧";
  }
  if (persona.ageGroup?.toLowerCase().includes("muda") || persona.ageGroup?.toLowerCase().includes("remaja")) {
    return "🧑‍💻";
  }
  if (persona.ageGroup?.toLowerCase().includes("tua") || persona.ageGroup?.toLowerCase().includes("lansia")) {
    return "👴";
  }
  return "👤";
};

export function PersonaGrid({ personas }: PersonaGridProps) {
  const buyCount = personas.filter(p => p.decision === "buy").length;
  const considerCount = personas.filter(p => p.decision === "consider").length;
  const passCount = personas.filter(p => p.decision === "pass").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Reaksi Persona</h3>
          <p className="text-xs text-slate-500 mt-0.5">{personas.length} persona dari cluster ini disimulasikan</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-semibold">{buyCount} Beli</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-400 font-semibold">{considerCount} Pertimbang</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-red-400 font-semibold">{passCount} Lewati</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {personas.map((persona, index) => (
          <motion.div
            key={persona.personaId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.04, duration: 0.35 }}
            className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl border border-white/10">
                  {getPersonaIcon(persona)}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{persona.personaName}</h4>
                  <p className="text-slate-500 text-xs">{persona.ageGroup} • {persona.occupation}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${getDecisionStyle(persona.decision)}`}>
                {getDecisionIcon(persona.decision)}
                {getDecisionLabel(persona.decision)}
              </div>
            </div>

            {/* Income Level */}
            <div className="flex items-center gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <User className="w-3.5 h-3.5" />
                <span>{persona.incomeLevel}</span>
              </div>
            </div>

            {/* Reasoning */}
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/50 via-amber-500/50 to-red-500/50 rounded-full" />
              <p className="pl-3 text-slate-300 text-sm leading-relaxed italic">
                "{persona.reasoning}"
              </p>
            </div>

            {/* Willingness to Pay */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Kemampuan beli</span>
                <span className={`font-medium ${
                  persona.decision === "buy" ? "text-emerald-400" :
                  persona.decision === "consider" ? "text-amber-400" : "text-red-400"
                }`}>
                  Rp {persona.willingnessToPay?.toLocaleString("id-ID") || "0"}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    persona.decision === "buy" ? "bg-emerald-500 w-full" :
                    persona.decision === "consider" ? "bg-amber-500 w-2/3" : "bg-red-500 w-1/3"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
