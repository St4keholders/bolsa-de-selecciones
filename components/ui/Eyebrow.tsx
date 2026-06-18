import { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <span className={`font-mono uppercase tracking-widest text-[0.7rem] text-dim font-medium ${className}`}>
      {children}
    </span>
  );
}
