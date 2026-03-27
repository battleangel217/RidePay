"use client";
import { useUIStore } from "@/lib/store/uiStore";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-2xl shadow-lg text-sm font-medium backdrop-blur ${
            t.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : t.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          {t.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : t.type === "error" ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <Info className="w-5 h-5 shrink-0 mt-0.5" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
