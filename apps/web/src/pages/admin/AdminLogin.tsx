import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { setAdminKey, adminApi } from "../../lib/adminApi";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";

export function AdminLogin() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;
    setError("");
    setLoading(true);
    setAdminKey(key);
    try {
      await adminApi.cities.list();
      navigate("/admin", { replace: true });
    } catch {
      setError("Passkey yang dimasukkan salah atau ditolak server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center font-sans relative selection:bg-white/30 selection:text-black">
      
      {/* Background Mesh */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-zinc-900/40 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-white/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-8 rounded-[2rem] border border-white/10 bg-[#0a0a0a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 text-left"
      >
        <Link to="/" className="absolute top-6 left-6 p-2 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="w-16 h-16 mx-auto bg-gradient-to-b from-white/10 to-transparent rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-xl">
          <ShieldAlert className="w-8 h-8 text-white drop-shadow-md" />
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Restricted Area</h2>
          <p className="text-zinc-400 text-sm">
            Administrator login required. Please enter your secure passkey to access the control panel.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-widest">
              Passkey Authorization
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter secure key..."
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-zinc-700 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 text-sm transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!key || loading}
            className="w-full h-14 bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-black/70" /> Verifying...
              </>
            ) : (
              "Authorize"
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <div className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest mt-2 flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            SimPasar Internal Operations
          </div>
        </div>
      </motion.div>
    </div>
  );
}
