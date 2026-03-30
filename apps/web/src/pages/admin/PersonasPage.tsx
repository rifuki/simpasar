import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { adminApi, type AdminPersona, type AdminCity } from "../../lib/adminApi";

const INCOME_LABELS: Record<string, string> = {
  low: "Rendah", "lower-mid": "Menengah Bawah", mid: "Menengah", "upper-mid": "Menengah Atas", high: "Tinggi",
};
const ELASTICITY_LABELS: Record<string, string> = {
  very_sensitive: "Sangat Sensitif", sensitive: "Sensitif", moderate: "Moderat", insensitive: "Tidak Sensitif",
};

const personaSchema = z.object({
  id: z.string().min(1, "Wajib diisi"),
  cityId: z.string().min(1, "Wajib diisi"),
  name: z.string().min(1, "Wajib diisi"),
  age: z.coerce.number().int().min(16).max(80),
  ageGroup: z.enum(["18-24", "25-30", "31-40", "41-55", "55+"]),
  gender: z.enum(["male", "female"]),
  occupation: z.string().min(1),
  incomeLevel: z.enum(["low", "lower-mid", "mid", "upper-mid", "high"]),
  monthlyIncome: z.coerce.number().int().positive(),
  monthlyDisposable: z.coerce.number().int().positive(),
  location: z.string().min(1),
  lifestyleRaw: z.string().min(1),
  priceElasticity: z.enum(["very_sensitive", "sensitive", "moderate", "insensitive"]),
  decisionFactorRaw: z.string().min(1),
  preferredChannelRaw: z.string().min(1),
  weeklyFnBSpend: z.coerce.number().int().positive(),
  valuesRaw: z.string().min(1),
  mediaConsumptionRaw: z.string().min(1),
  peerInfluence: z.enum(["high", "medium", "low"]),
  culturalNote: z.string().min(1),
  competitorAwarenessRaw: z.string().min(1),
});

type PersonaForm = z.infer<typeof personaSchema>;

function fromPersona(p: AdminPersona): PersonaForm {
  return {
    id: p.id, cityId: p.cityId, name: p.name, age: p.age, ageGroup: p.ageGroup,
    gender: p.gender, occupation: p.occupation, incomeLevel: p.incomeLevel,
    monthlyIncome: p.monthlyIncome, monthlyDisposable: p.monthlyDisposable,
    location: p.location, lifestyleRaw: p.lifestyle.join(", "),
    priceElasticity: p.shoppingBehavior.priceElasticity,
    decisionFactorRaw: p.shoppingBehavior.decisionFactor.join(", "),
    preferredChannelRaw: p.shoppingBehavior.preferredChannel.join(", "),
    weeklyFnBSpend: p.shoppingBehavior.weeklyFnBSpend,
    valuesRaw: p.psychographic.values.join(", "),
    mediaConsumptionRaw: p.psychographic.mediaConsumption.join(", "),
    peerInfluence: p.psychographic.peerInfluence,
    culturalNote: p.cityContext.culturalNote,
    competitorAwarenessRaw: p.cityContext.competitorAwareness.join(", "),
  };
}

function toPersona(values: PersonaForm): AdminPersona {
  const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  return {
    id: values.id, cityId: values.cityId, name: values.name, age: values.age,
    ageGroup: values.ageGroup, gender: values.gender, occupation: values.occupation,
    incomeLevel: values.incomeLevel, monthlyIncome: values.monthlyIncome,
    monthlyDisposable: values.monthlyDisposable, location: values.location,
    lifestyle: csv(values.lifestyleRaw),
    shoppingBehavior: {
      priceElasticity: values.priceElasticity,
      decisionFactor: csv(values.decisionFactorRaw),
      preferredChannel: csv(values.preferredChannelRaw),
      weeklyFnBSpend: values.weeklyFnBSpend,
    },
    psychographic: {
      values: csv(values.valuesRaw),
      mediaConsumption: csv(values.mediaConsumptionRaw),
      peerInfluence: values.peerInfluence,
    },
    cityContext: {
      culturalNote: values.culturalNote,
      competitorAwareness: csv(values.competitorAwarenessRaw),
    },
  };
}

const inputCls = "w-full bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 text-sm";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-slate-300 text-xs font-medium mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function PersonaModal({
  persona, cities, onClose,
}: { persona: AdminPersona | null; cities: AdminCity[]; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!persona;

  const { register, handleSubmit, formState: { errors } } = useForm<PersonaForm>({
    resolver: zodResolver(personaSchema),
    defaultValues: persona ? fromPersona(persona) : undefined,
  });

  const createMut = useMutation({
    mutationFn: (data: AdminPersona) => adminApi.personas.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-personas"] }); onClose(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<AdminPersona, "id"> }) => adminApi.personas.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-personas"] }); onClose(); },
  });

  const isPending = createMut.isPending || updateMut.isPending;
  const mutError = createMut.error?.message || updateMut.error?.message;

  const onSubmit = (values: PersonaForm) => {
    const p = toPersona(values);
    if (isEdit) {
      const { id, ...rest } = p;
      updateMut.mutate({ id, data: rest });
    } else {
      createMut.mutate(p);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-white font-semibold">{isEdit ? `Edit — ${persona.name}` : "Tambah Persona"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {mutError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{mutError}</div>}

          <Section title="Identitas">
            <div className="grid grid-cols-2 gap-3">
              <Field label="ID" error={errors.id?.message}>
                <input {...register("id")} disabled={isEdit} placeholder="mlg_011" className={inputCls} />
              </Field>
              <Field label="Kota" error={errors.cityId?.message}>
                <select {...register("cityId")} className={inputCls}>
                  <option value="">Pilih kota</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Nama" error={errors.name?.message}>
                <input {...register("name")} className={inputCls} />
              </Field>
              <Field label="Lokasi" error={errors.location?.message}>
                <input {...register("location")} placeholder="Malang Kota" className={inputCls} />
              </Field>
              <Field label="Usia" error={errors.age?.message}>
                <input {...register("age")} type="number" className={inputCls} />
              </Field>
              <Field label="Kelompok Usia" error={errors.ageGroup?.message}>
                <select {...register("ageGroup")} className={inputCls}>
                  {(["18-24","25-30","31-40","41-55","55+"] as const).map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Gender" error={errors.gender?.message}>
                <select {...register("gender")} className={inputCls}>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </Field>
              <Field label="Pekerjaan" error={errors.occupation?.message}>
                <input {...register("occupation")} className={inputCls} />
              </Field>
            </div>
            <Field label="Lifestyle (pisah koma)" error={errors.lifestyleRaw?.message}>
              <input {...register("lifestyleRaw")} placeholder="kopi, media sosial, nongkrong" className={inputCls} />
            </Field>
          </Section>

          <Section title="Keuangan">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Level Income" error={errors.incomeLevel?.message}>
                <select {...register("incomeLevel")} className={inputCls}>
                  {Object.entries(INCOME_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Pendapatan/bln (IDR)" error={errors.monthlyIncome?.message}>
                <input {...register("monthlyIncome")} type="number" className={inputCls} />
              </Field>
              <Field label="Uang Jajan/bln (IDR)" error={errors.monthlyDisposable?.message}>
                <input {...register("monthlyDisposable")} type="number" className={inputCls} />
              </Field>
              <Field label="Spend F&B/minggu (IDR)" error={errors.weeklyFnBSpend?.message}>
                <input {...register("weeklyFnBSpend")} type="number" className={inputCls} />
              </Field>
            </div>
          </Section>

          <Section title="Perilaku Belanja">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Elastisitas Harga" error={errors.priceElasticity?.message}>
                <select {...register("priceElasticity")} className={inputCls}>
                  {Object.entries(ELASTICITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>
              <Field label="Pengaruh Teman" error={errors.peerInfluence?.message}>
                <select {...register("peerInfluence")} className={inputCls}>
                  <option value="high">Tinggi</option>
                  <option value="medium">Sedang</option>
                  <option value="low">Rendah</option>
                </select>
              </Field>
            </div>
            <Field label="Faktor Keputusan Beli (pisah koma)" error={errors.decisionFactorRaw?.message}>
              <input {...register("decisionFactorRaw")} placeholder="harga, rasa, brand" className={inputCls} />
            </Field>
            <Field label="Channel Belanja (pisah koma)" error={errors.preferredChannelRaw?.message}>
              <input {...register("preferredChannelRaw")} placeholder="offline, GoFood, TikTok Shop" className={inputCls} />
            </Field>
            <Field label="Values (pisah koma)" error={errors.valuesRaw?.message}>
              <input {...register("valuesRaw")} placeholder="hemat, sustainability, kualitas" className={inputCls} />
            </Field>
            <Field label="Konsumsi Media (pisah koma)" error={errors.mediaConsumptionRaw?.message}>
              <input {...register("mediaConsumptionRaw")} placeholder="TikTok, Instagram, YouTube" className={inputCls} />
            </Field>
          </Section>

          <Section title="Konteks Kota">
            <Field label="Catatan Budaya" error={errors.culturalNote?.message}>
              <textarea {...register("culturalNote")} rows={2} className={inputCls + " resize-none"} />
            </Field>
            <Field label="Kompetitor yang Dikenal (pisah koma)" error={errors.competitorAwarenessRaw?.message}>
              <input {...register("competitorAwarenessRaw")} placeholder="Starbucks, Kopi Kenangan, Janji Jiwa" className={inputCls} />
            </Field>
          </Section>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm transition">Batal</button>
            <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-900 font-semibold text-sm transition">
              {isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function PersonasPage() {
  const qc = useQueryClient();
  const [cityFilter, setCityFilter] = useState("");
  const [modal, setModal] = useState<"add" | AdminPersona | null>(null);

  const { data: cities = [] } = useQuery({ queryKey: ["admin-cities"], queryFn: () => adminApi.cities.list() });
  const { data: personas, isLoading } = useQuery({
    queryKey: ["admin-personas", cityFilter],
    queryFn: () => adminApi.personas.list(cityFilter || undefined),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.personas.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-personas"] }),
    onError: (e) => alert(e.message),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">Personas</h1>
          <p className="text-slate-400 text-sm mt-0.5">{personas?.length ?? 0} persona{cityFilter ? ` di ${cities.find(c=>c.id===cityFilter)?.name}` : " total"}</p>
        </div>
        <button onClick={() => setModal("add")} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-4 py-2 rounded-xl text-sm transition">
          + Tambah Persona
        </button>
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
      ) : (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {["Nama", "Kota", "Usia", "Pekerjaan", "Income", "Elastisitas", ""].map((h) => (
                  <th key={h} className="text-left text-slate-400 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personas?.map((p) => (
                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{p.name}</div>
                    <div className="text-slate-500 text-xs font-mono">{p.id}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{cities.find((c) => c.id === p.cityId)?.name ?? p.cityId}</td>
                  <td className="px-4 py-3 text-slate-400">{p.age} <span className="text-xs text-slate-600">({p.ageGroup})</span></td>
                  <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{p.occupation}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-700/50 text-slate-300 text-xs px-2 py-0.5 rounded-full">{INCOME_LABELS[p.incomeLevel]}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{ELASTICITY_LABELS[p.shoppingBehavior.priceElasticity]}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setModal(p)} className="text-xs text-slate-400 hover:text-emerald-400 transition px-2 py-1 rounded-lg hover:bg-emerald-500/10">Edit</button>
                      <button
                        onClick={() => { if (confirm(`Hapus ${p.name}?`)) deleteMut.mutate(p.id); }}
                        className="text-xs text-slate-500 hover:text-red-400 transition px-2 py-1 rounded-lg hover:bg-red-500/10"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <PersonaModal
          persona={modal === "add" ? null : modal}
          cities={cities}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
