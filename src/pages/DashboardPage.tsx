import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bffApi, BfarolData, HomeData } from "../api/client";
import { useAuth } from "../store/auth";
import Layout from "../components/Layout";

function SemaforoIcon({ s }: { s: string }) {
  const map: Record<string, string> = { verde: "🟢", ambar: "🟡", vermelho: "🔴" };
  return <span>{map[s] ?? "⚪"}</span>;
}

function IFFGauge({ score, semaforo }: { score: number; semaforo: string }) {
  const color = semaforo === "verde" ? "#34d399" : semaforo === "ambar" ? "#f59e0b" : "#f87171";
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path d="M10 65 A 50 50 0 0 1 110 65" stroke="#1e2d45" strokeWidth="10" fill="none" />
        <path
          d="M10 65 A 50 50 0 0 1 110 65"
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={`${(pct / 100) * 157} 157`}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-3xl font-bold" style={{ color }}>
        {score.toFixed(1)}
      </div>
      <div className="text-xs text-slate-400 uppercase tracking-widest">IFF Score</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [home, setHome] = useState<HomeData | null>(null);
  const [bfarol, setBfarol] = useState<BfarolData | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([bffApi.home(), bffApi.bfarol()])
      .then(([h, b]) => { setHome(h); setBfarol(b); })
      .catch(() => setErr("Não foi possível carregar o painel."));
  }, []);

  return (
    <Layout>
      <div className="space-y-5">
        {/* Boas-vindas */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">
              Olá, {user?.username ?? "…"} {user?.is_seed && "🌱"}
            </h1>
            <p className="text-sm text-slate-400">Plano {user?.plano_id?.toUpperCase() ?? "—"}</p>
          </div>
          <span className="text-xs text-slate-500 hidden md:block">
            D-26 para o pré-lançamento
          </span>
        </div>

        {err && <p className="text-red-400 text-sm">{err}</p>}

        {/* IFF Score + Módulos */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card flex flex-col items-center justify-center py-6">
            {bfarol ? (
              <>
                <IFFGauge score={bfarol.iff_score} semaforo={bfarol.semaforo} />
                <div className="mt-2 flex items-center gap-2">
                  <SemaforoIcon s={bfarol.semaforo} />
                  <span className="text-sm text-slate-300 capitalize">{bfarol.semaforo}</span>
                </div>
              </>
            ) : (
              <div className="text-slate-500 animate-pulse text-sm">Carregando IFF…</div>
            )}
          </div>

          {/* Módulos */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Módulos BFarol</h3>
            {bfarol ? (
              <div className="space-y-2">
                {bfarol.modulos.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <SemaforoIcon s={m.status} />
                    <span className="text-xs text-slate-400 flex-1 capitalize">{m.id}</span>
                    <span className="text-xs font-mono text-white">{m.score}</span>
                    <div className="w-16 h-1.5 bg-cockpit-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${m.score}%`,
                          backgroundColor:
                            m.status === "verde" ? "#34d399" : m.status === "ambar" ? "#f59e0b" : "#f87171",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 animate-pulse text-sm">Carregando…</div>
            )}
          </div>
        </div>

        {/* Metas + Top BLab */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">🎯 Metas</h3>
            {home ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pré-lançamento</span>
                  <span className="text-amber-400 font-mono">{home.metas.pre_lancamento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MRR alvo (Jul/26)</span>
                  <span className="text-white font-mono">R$ {home.metas.mrr_alvo.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MRR atual</span>
                  <span className="font-mono text-red-400">R$ {home.metas.mrr_atual.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Usuários ativos</span>
                  <span className="font-mono text-white">{home.stats.usuarios_ativos}</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 animate-pulse text-sm">Carregando…</div>
            )}
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">💡 Top BLab</h3>
            {home?.top_ideas_blab.length ? (
              <div className="space-y-2">
                {home.top_ideas_blab.map((i) => (
                  <div key={i.id} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-400 font-mono text-xs mt-0.5">▲ {i.votos}</span>
                    <Link to="/app/blab" className="text-slate-300 hover:text-white line-clamp-2 flex-1">
                      {i.titulo}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Nenhuma ideia ainda.{" "}
                <Link to="/app/blab" className="text-amber-400">Submeter ideia →</Link>
              </p>
            )}
          </div>
        </div>

        {/* Histórico IFF */}
        {bfarol?.historico && (
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">📈 Evolução IFF</h3>
            <div className="flex items-end gap-2 h-16">
              {bfarol.historico.map((h, i) => {
                const pct = Math.round((h.iff / 100) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500 font-mono">{h.iff.toFixed(1)}</span>
                    <div
                      className="w-full bg-amber-500 rounded-sm opacity-70"
                      style={{ height: `${pct}%`, minHeight: 4 }}
                    />
                    <span className="text-[10px] text-slate-600">{h.data.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
