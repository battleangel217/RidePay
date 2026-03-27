import { create } from "zustand";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface UIState {
  toasts: Toast[];
  addToast: (type: Toast["type"], message: string) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
