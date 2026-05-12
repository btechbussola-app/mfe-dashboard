import { create } from "zustand";
import { authApi, UserOut } from "../api/client";

interface AuthState {
  token: string | null;
  user: UserOut | null;
  loading: boolean;
  setToken: (token: string) => void;
  loadUser: () => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem("btech_token"),
  user: null,
  loading: false,

  setToken: (token) => {
    localStorage.setItem("btech_token", token);
    set({ token });
  },

  loadUser: async () => {
    set({ loading: true });
    try {
      const user = await authApi.me();
      set({ user, loading: false });
    } catch {
      localStorage.removeItem("btech_token");
      set({ token: null, user: null, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("btech_token");
    set({ token: null, user: null });
  },
}));
