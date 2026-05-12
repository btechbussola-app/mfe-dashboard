const BASE = "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("btech_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, err.detail ?? "Erro desconhecido");
  }
  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface TokenOut { access_token: string; token_type: string }
export interface UserOut {
  id: number; username: string; email: string;
  is_super_admin: boolean; plano_id: string; is_seed: boolean;
}
export interface RegisterOut extends TokenOut {
  username: string; plano_id: string; is_seed: boolean; seed_slot: number | null;
}

export const authApi = {
  login: (username: string, password: string) =>
    request<TokenOut>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  devLogin: (username: string) =>
    request<TokenOut>("/auth/dev-login", {
      method: "POST",
      body: JSON.stringify({ username, password: username }),
    }),

  register: (body: {
    email: string; senha: string; seed_code?: string; phone?: string;
  }) =>
    request<RegisterOut>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request<UserOut>("/auth/me"),

  validateSeedCode: (seed_code: string) =>
    request<{ valido: boolean; motivo: string }>("/auth/validate-seed", {
      method: "POST",
      body: JSON.stringify({ seed_code }),
    }).catch(() => ({ valido: false, motivo: "invalido" })),
};

// ── BFF Web ───────────────────────────────────────────────────────────────────

export interface HomeData {
  usuario: string; plano: string;
  iff: { score: number; semaforo: string; proximo_passo: string };
  metas: { pre_lancamento: string; mrr_alvo: number; mrr_atual: number };
  top_ideas_blab: Array<{ id: number; titulo: string; votos: number; status: string }>;
  stats: { usuarios_ativos: number };
}

export interface BfarolData {
  iff_score: number; semaforo: string;
  modulos: Array<{ id: string; score: number; status: string }>;
  historico: Array<{ data: string; iff: number }>;
}

export const bffApi = {
  home: () => request<HomeData>("/bff/web/home"),
  bfarol: () => request<BfarolData>("/bff/web/bfarol"),
  blab: (page = 1) => request<{ total: number; ideas: BlabIdea[] }>(`/bff/web/blab?page=${page}`),
  perfil: () => request<PerfilData>("/bff/mobile/perfil"),
};

// ── BLab ──────────────────────────────────────────────────────────────────────

export interface BlabIdea {
  id: number; titulo: string; descricao: string; categoria: string;
  votos: number; status: string; autor_id: number;
  analise_bussola: string | null; criado_em: string;
}

export interface BlabDetail extends BlabIdea { ja_votei: boolean }

export const blabApi = {
  listar: (params?: { status?: string; categoria?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.categoria) q.set("categoria", params.categoria);
    if (params?.page) q.set("page", String(params.page));
    return request<BlabIdea[]>(`/blab/ideas?${q}`);
  },
  criar: (body: { titulo: string; descricao: string; categoria: string }) =>
    request<BlabIdea>("/blab/ideas", { method: "POST", body: JSON.stringify(body) }),
  detalhe: (id: number) => request<BlabDetail>(`/blab/ideas/${id}`),
  votar: (id: number) => request<{ idea_id: number; votos: number }>(`/blab/ideas/${id}/vote`, { method: "POST" }),
};

// ── IFF ───────────────────────────────────────────────────────────────────────

export interface IFFData {
  iff_score: number; semaforo: string;
  modulos: Array<{ id: string; nome: string; peso: number; score: number; status: string }>;
  recomendacoes: string[];
  calculado_em: string;
}

export const iffApi = {
  score: () => request<IFFData>("/iff/score"),
};

// ── Perfil ────────────────────────────────────────────────────────────────────

export interface PerfilData {
  username: string; plano: string; is_seed: boolean;
  email: string | null; phone: string | null;
  consultas_mes_usado: number; consultas_mes_limite: number;
  proximo_vencimento: string | null;
}
