interface HairlineProps {
  className?: string;
  vertical?: boolean;
}

export function Hairline({ className = "", vertical = false }: HairlineProps) {
  if (vertical) {
    return <div className={`w-[1px] bg-hair ${className}`} />;
  }
  return <div className={`h-[1px] w-full bg-hair ${className}`} />;
}
