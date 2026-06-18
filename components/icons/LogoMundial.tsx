import Image from "next/image";

interface Props {
  size?: number;
  className?: string;
}

export function LogoMundial({ size = 32, className = "" }: Props) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/mundial-2026-world-cup.svg"
        alt="Mundial 2026 Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
