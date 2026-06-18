export function IconTrophy({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10" />
      <path d="M17 4v8c0 2.8-2.2 5-5 5s-5-2.2-5-5V4" />
      <path d="M3 4h4v6H3z" />
      <path d="M17 4h4v6h-4z" />
    </svg>
  );
}
