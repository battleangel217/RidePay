import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`bg-background-secondary rounded-3xl shadow-sm border border-border ${className}`}
    >
      {children}
    </div>
  );
}
