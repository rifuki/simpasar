import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAdminKey } from "../../lib/adminApi";

const navItems = [
  { to: "/admin/dashboard", label: "Overview", icon: "📈" },
  { to: "/admin/personas", label: "Personas", icon: "👥" },
  { to: "/admin/cities", label: "Kota", icon: "🏙️" },
  { to: "/admin/simulations", label: "History Simulasi", icon: "📊" },
  { to: "/admin/prompt", label: "System Prompt", icon: "🤖" },
];

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminKey();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-slate-800 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="text-white font-bold text-sm">SimPasar</div>
          <div className="text-emerald-400 text-xs mt-0.5">Admin Panel</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-800">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition mb-1"
          >
            <span className="text-base leading-none">←</span>
            Ke App
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition"
          >
            <span className="text-base leading-none">🚪</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
