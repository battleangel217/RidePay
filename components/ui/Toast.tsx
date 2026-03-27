"use client";
import { useUIStore } from "@/lib/store/uiStore";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-2xl shadow-lg text-sm font-medium backdrop-blur ${
            t.type === "success"
              ? "bg-success/20 text-success border border-success/30"
              : t.type === "error"
                ? "bg-error/20 text-error border border-error/30"
                : "bg-primary/20 text-white border border-primary/30"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : t.type === "error" ? (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
