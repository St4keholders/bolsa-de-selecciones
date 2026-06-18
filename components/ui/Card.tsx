import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-canvas border border-hair2 ${className}`}>
      {children}
    </div>
  );
}
