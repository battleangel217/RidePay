import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: Props) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
