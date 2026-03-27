import { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  children: ReactNode;
}

export function Button({ variant = "primary", loading, children, className = "", ...props }: Props) {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold text-sm px-6 py-3.5 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800 active:scale-95",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95",
    ghost: "text-gray-700 hover:bg-gray-100 active:scale-95",
    danger: "bg-red-600 text-white hover:bg-red-700 active:scale-95",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
