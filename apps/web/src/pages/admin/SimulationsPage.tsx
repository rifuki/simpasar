import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi, type SimulationRow } from "../../lib/adminApi";
import type { SimulationResult } from "@shared/types";

function DetailDrawer({ simId, onClose }: { simId: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-sim-detail", simId],
    queryFn: () => adminApi.simulations.get(simId),
  });

  const result = data?.result as SimulationResult | undefined;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="text-white font-semibold">{data?.productName ?? "Memuat..."}</h2>
            {data && <p className="text-slate-400 text-xs mt-0.5">{data.cityId} · {new Date(data.createdAt).toLocaleString("id-ID")}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>

        {isLoading ? (
          <div className="p-6 text-slate-500 text-sm">Memuat detail...</div>
        ) : result ? (
          <div className="p-6 space-y-5">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Market Penetration" value={`${result.summary.marketPenetration}%`} accent />
              <StatCard label="Confidence" value={`${result.summary.confidenceScore}%`} />
              <StatCard label="Revenue Est." value={`Rp ${(result.summary.estimatedMonthlyRevenue.low / 1e6).toFixed(1)}–${(result.summary.estimatedMonthlyRevenue.high / 1e6).toFixed(1)}jt`} />
            </div>

            <div className="bg-slate-800/40 rounded-xl p-4">
              <p className="text-slate-300 text-sm">{result.summary.overallRecommendation}</p>
            </div>

            {/* Persona breakdown */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Persona Decisions</div>
              <div className="space-y-2">
                {result.personaDetails.map((p) => (
                  <div key={p.personaId} className="flex items-start gap-3 bg-slate-800/30 rounded-xl p-3">
                    <span className={`mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.decision === "buy" ? "bg-emerald-500/20 text-emerald-400"
                        : p.decision === "consider" ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>{p.decision === "buy" ? "Beli" : p.decision === "consider" ? "Pertimbang" : "Tidak"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">{p.personaName}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{p.reasoning}</div>
                    </div>
                    <div className="text-slate-500 text-xs shrink-0">WTP: Rp {p.willingnessToPay.toLocaleString("id-ID")}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risks & Opportunities */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-red-400/80 uppercase tracking-wider mb-2">Risiko</div>
                <ul className="space-y-1">
                  {result.summary.keyRisks.map((r, i) => (
                    <li key={i} className="text-slate-400 text-xs flex gap-2"><span className="text-red-400 mt-0.5">•</span>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider mb-2">Peluang</div>
                <ul className="space-y-1">
                  {result.summary.keyOpportunities.map((o, i) => (
                    <li key={i} className="text-slate-400 text-xs flex gap-2"><span className="text-emerald-400 mt-0.5">•</span>{o}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-slate-800/40 rounded-xl p-3">
      <div className="text-slate-500 text-xs">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${accent ? "text-emerald-400" : "text-white"}`}>{value}</div>
    </div>
  );
}

export function SimulationsPage() {
  const [cityFilter, setCityFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-simulations", cityFilter],
    queryFn: () => adminApi.simulations.list({ limit: 100, cityId: cityFilter || undefined }),
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["admin-cities"],
    queryFn: () => adminApi.cities.list(),
  });

  const rows = data?.data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">History Simulasi</h1>
          <p className="text-slate-400 text-sm mt-0.5">{data?.total ?? 0} total simulasi</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setCityFilter("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${!cityFilter ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "border-slate-700 text-slate-400 hover:text-white"}`}
        >
          Semua
        </button>
        {cities.map((c) => (
          <button
            key={c.id}
            onClick={() => setCityFilter(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition border ${cityFilter === c.id ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "border-slate-700 text-slate-400 hover:text-white"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-slate-500 text-sm">Memuat...</div>
      ) : rows.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">Belum ada simulasi. Jalankan simulasi dari app utama dulu.</p>
        </div>
      ) : (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {["Produk", "Kota", "Tanggal", "Penetrasi", ""].map((h) => (
                  <th key={h} className="text-left text-slate-400 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: SimulationRow) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/20 transition cursor-pointer"
                  onClick={() => setSelectedId(row.id)}
                >
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{row.product_name}</div>
                    <div className="text-slate-500 text-xs font-mono">{row.id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{cities.find((c) => c.id === row.city_id)?.name ?? row.city_id}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(row.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-emerald-400"
                          style={{ width: `${row.market_penetration}%` }}
                        />
                      </div>
                      <span className="text-emerald-400 font-medium text-xs">{row.market_penetration}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">Lihat →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedId && <DetailDrawer simId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
