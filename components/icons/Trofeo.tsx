import Image from "next/image";

interface Props {
  size?: number;
  className?: string;
}

export function Trofeo({ size = 24, className = "" }: Props) {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/trofeo2026.svg"
        alt="Trofeo Mundial 2026"
        fill
        className="object-contain drop-shadow-sm"
      />
    </div>
  );
}
