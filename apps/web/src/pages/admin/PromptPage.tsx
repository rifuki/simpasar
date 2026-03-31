import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../lib/adminApi";

export function PromptPage() {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-prompt"],
    queryFn: () => adminApi.settings.getPrompt(),
  });

  useEffect(() => {
    if (data?.prompt) setText(data.prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.prompt]);

  const saveMut = useMutation({
    mutationFn: (prompt: string) => adminApi.settings.savePrompt(prompt),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-prompt"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const resetMut = useMutation({
    mutationFn: () => adminApi.settings.resetPrompt(),
    onSuccess: (data) => {
      setText(data.prompt);
      qc.invalidateQueries({ queryKey: ["admin-prompt"] });
    },
  });

  const isDirty = text !== (data?.prompt ?? "");

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">System Prompt</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Prompt yang dikirim ke AI sebelum setiap simulasi.{" "}
            {data?.isCustom ? (
              <span className="text-yellow-400">Menggunakan prompt custom</span>
            ) : (
              <span className="text-slate-500">Menggunakan prompt default</span>
            )}
          </p>
        </div>
        <button
          onClick={() => { if (confirm("Reset ke prompt default?")) resetMut.mutate(); }}
          disabled={resetMut.isPending}
          className="text-xs text-slate-500 hover:text-red-400 transition px-3 py-2 rounded-xl border border-slate-700 hover:border-red-500/30"
        >
          Reset Default
        </button>
      </div>

      {isLoading ? (
        <div className="text-slate-500 text-sm">Memuat...</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-700/50 flex items-center justify-between">
              <span className="text-slate-500 text-xs font-mono">system_prompt</span>
              <span className="text-slate-600 text-xs">{text.length} karakter</span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={20}
              className="w-full bg-transparent px-4 py-3 text-slate-300 text-sm font-mono focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => saveMut.mutate(text)}
              disabled={!isDirty || saveMut.isPending}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition"
            >
              {saveMut.isPending ? "Menyimpan..." : "Simpan Prompt"}
            </button>
            {saved && <span className="text-emerald-400 text-sm">Tersimpan!</span>}
            {saveMut.error && <span className="text-red-400 text-sm">{saveMut.error.message}</span>}
          </div>

          <div className="bg-slate-800/20 border border-slate-700/30 rounded-xl p-4">
            <p className="text-slate-500 text-xs leading-relaxed">
              <strong className="text-slate-400">Tips:</strong> Prompt ini dikirim sebagai <code className="text-emerald-400/70">system</code> message ke AI sebelum data produk dan personas. Perubahan berlaku langsung untuk simulasi berikutnya — tanpa perlu restart server.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
