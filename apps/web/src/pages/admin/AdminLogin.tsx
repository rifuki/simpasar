import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAdminKey, adminApi } from "../../lib/adminApi";

export function AdminLogin() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setAdminKey(key);
    try {
      await adminApi.cities.list();
      navigate("/admin");
    } catch {
      setError("API key salah atau server tidak bisa dijangkau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            SimPasar Admin
          </div>
          <h1 className="text-2xl font-bold text-white">Masuk ke Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Masukkan ADMIN_KEY dari file .env</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Admin Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="simpasar-admin-..."
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 text-sm"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!key || loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-semibold py-3 rounded-xl transition text-sm"
          >
            {loading ? "Verifikasi..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
