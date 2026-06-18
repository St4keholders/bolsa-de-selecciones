export function LogoBolsa({ size = 100, className = "" }: { size?: number, className?: string }) {
  const width = size;
  
  return (
    <svg 
      viewBox="0 0 60 60" 
      width={width} 
      height={size} 
      className={`text-ink ${className}`}
      fill="currentColor"
    >
      <g transform="translate(10, 10)">
        {/* Simple B Logo or Balón */}
        <path d="M10,0 C25,0 35,5 35,15 C35,22 30,26 23,28 C33,30 38,36 38,45 C38,55 25,60 10,60 L0,60 L0,0 Z M10,12 L10,25 C18,25 22,22 22,18 C22,14 18,12 10,12 Z M10,35 L10,48 C20,48 25,45 25,41 C25,37 20,35 10,35 Z" fill="var(--color-mundial-lime)" />
      </g>
    </svg>
  );
}
