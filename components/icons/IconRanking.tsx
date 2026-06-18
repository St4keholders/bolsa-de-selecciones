export function IconRanking({ className = "" }: { className?: string }) {
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
      <rect x="2" y="14" width="6" height="8" />
      <rect x="9" y="8" width="6" height="14" />
      <rect x="16" y="11" width="6" height="11" />
      <path d="M12 2l-1 4h2l-1-4z" fill="currentColor" />
    </svg>
  );
}
