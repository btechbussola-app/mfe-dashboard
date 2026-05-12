import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

const NAV = [
  { to: "/app", label: "BFarol", icon: "🧭" },
  { to: "/app/blab", label: "BLab", icon: "💡" },
  { to: "/app/perfil", label: "Perfil", icon: "👤" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-cockpit-bg">
      {/* Header */}
      <header className="border-b border-cockpit-border bg-cockpit-surface px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 font-bold text-lg tracking-tight">BTech</span>
          {user?.is_seed && (
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-2 py-0.5 font-mono">
              SEED
            </span>
          )}
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === n.to
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-cockpit-muted"
              }`}
            >
              {n.icon} {n.label}
            </Link>
          ))}
          {user?.is_super_admin && (
            <Link
              to="/app/admin"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname.startsWith("/app/admin")
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-cockpit-muted"
              }`}
            >
              ⚙️ Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden md:block">{user?.username}</span>
          <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-400 transition-colors">
            Sair
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <nav className="md:hidden border-b border-cockpit-border bg-cockpit-surface px-3 py-2 flex gap-1 overflow-x-auto">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              pathname === n.to
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {n.icon} {n.label}
          </Link>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
