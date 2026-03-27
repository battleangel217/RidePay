import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  rehydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  setAuth: (user, access, refresh) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user, accessToken: access, refreshToken: refresh });
  },

  setUser: (user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
    set({ user: null, accessToken: null, refreshToken: null });
  },

  rehydrate: () => {
    if (typeof window !== "undefined") {
      const access = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");
      const userStr = localStorage.getItem("user");
      if (access && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, accessToken: access, refreshToken: refresh });
        } catch {
          // Corrupted data — clear it so the user isn't stuck
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
        }
      }
    }
  },
}));
