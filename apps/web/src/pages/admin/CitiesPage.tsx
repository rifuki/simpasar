import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { adminApi, type AdminCity } from "../../lib/adminApi";

const citySchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9_-]+$/, "Huruf kecil, angka, dash saja"),
  name: z.string().min(1, "Wajib diisi"),
  province: z.string().min(1, "Wajib diisi"),
  tier: z.enum(["1", "2", "3"]),
  population: z.coerce.number().int().positive("Harus positif"),
  economicProfile: z.string().min(10, "Minimal 10 karakter"),
  avgMonthlyExpenditure: z.coerce.number().int().positive(),
  topIndustriesRaw: z.string().min(1, "Minimal 1 industri"),
});

type CityForm = z.infer<typeof citySchema>;

function CityModal({
  city,
  onClose,
}: {
  city: AdminCity | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!city;

  const { register, handleSubmit, formState: { errors } } = useForm<CityForm>({
    resolver: zodResolver(citySchema),
    defaultValues: city
      ? { ...city, topIndustriesRaw: city.topIndustries.join(", ") }
      : { tier: "2" },
  });

  const createMut = useMutation({
    mutationFn: (data: Omit<AdminCity, "personaCount">) => adminApi.cities.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-cities"] }); onClose(); },
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<AdminCity, "id" | "personaCount"> }) =>
      adminApi.cities.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-cities"] }); onClose(); },
  });

  const isPending = createMut.isPending || updateMut.isPending;
  const mutError = createMut.error?.message || updateMut.error?.message;

  const onSubmit = (values: CityForm) => {
    const { topIndustriesRaw, ...rest } = values;
    const topIndustries = topIndustriesRaw.split(",").map((s) => s.trim()).filter(Boolean);
    if (isEdit) {
      updateMut.mutate({ id: city.id, data: { ...rest, topIndustries } });
    } else {
      createMut.mutate({ ...rest, topIndustries });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">{isEdit ? "Edit Kota" : "Tambah Kota"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {mutError && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{mutError}</div>}

          <div className="grid grid-cols-2 gap-4">
            <Field label="ID Kota" error={errors.id?.message}>
              <input {...register("id")} disabled={isEdit} placeholder="jakarta" className={inputCls} />
            </Field>
            <Field label="Nama" error={errors.name?.message}>
              <input {...register("name")} placeholder="Jakarta" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Provinsi" error={errors.province?.message}>
              <input {...register("province")} placeholder="DKI Jakarta" className={inputCls} />
            </Field>
            <Field label="Tier" error={errors.tier?.message}>
              <select {...register("tier")} className={inputCls}>
                <option value="1">Tier 1</option>
                <option value="2">Tier 2</option>
                <option value="3">Tier 3</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Populasi" error={errors.population?.message}>
              <input {...register("population")} type="number" className={inputCls} />
            </Field>
            <Field label="Rata-rata Pengeluaran/bln (IDR)" error={errors.avgMonthlyExpenditure?.message}>
              <input {...register("avgMonthlyExpenditure")} type="number" className={inputCls} />
            </Field>
          </div>
          <Field label="Profil Ekonomi" error={errors.economicProfile?.message}>
            <textarea {...register("economicProfile")} rows={3} className={inputCls + " resize-none"} />
          </Field>
          <Field label="Industri Utama (pisah koma)" error={errors.topIndustriesRaw?.message}>
            <input {...register("topIndustriesRaw")} placeholder="F&B, fashion, teknologi" className={inputCls} />
          </Field>

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

export function CitiesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"add" | AdminCity | null>(null);

  const { data: cities, isLoading } = useQuery({
    queryKey: ["admin-cities"],
    queryFn: () => adminApi.cities.list(),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.cities.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-cities"] }),
    onError: (e) => alert(e.message),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">Kota</h1>
          <p className="text-slate-400 text-sm mt-0.5">{cities?.length ?? 0} kota terdaftar</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-4 py-2 rounded-xl text-sm transition"
        >
          + Tambah Kota
        </button>
      </div>

      {isLoading ? (
        <div className="text-slate-500 text-sm">Memuat...</div>
      ) : (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {["ID", "Nama", "Provinsi", "Tier", "Populasi", "Personas", ""].map((h) => (
                  <th key={h} className="text-left text-slate-400 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cities?.map((city) => (
                <tr key={city.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{city.id}</td>
                  <td className="px-4 py-3 text-white font-medium">{city.name}</td>
                  <td className="px-4 py-3 text-slate-400">{city.province}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-700/50 text-slate-300 text-xs px-2 py-0.5 rounded-full">Tier {city.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{city.population.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-medium">{city.personaCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setModal(city)} className="text-xs text-slate-400 hover:text-emerald-400 transition px-2 py-1 rounded-lg hover:bg-emerald-500/10">Edit</button>
                      <button
                        onClick={() => { if (confirm(`Hapus ${city.name}?`)) deleteMut.mutate(city.id); }}
                        disabled={city.personaCount > 0}
                        className="text-xs text-slate-500 hover:text-red-400 transition px-2 py-1 rounded-lg hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={city.personaCount > 0 ? "Hapus semua personas dulu" : ""}
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
        <CityModal
          city={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
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
