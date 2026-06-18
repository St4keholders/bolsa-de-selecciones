export function IconBall({ className = "" }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 12l3-2.5 1.5-5.5" />
      <path d="M12 12l-3-2.5-1.5-5.5" />
      <path d="M12 12v5.5" />
      <path d="M12 17.5l-4 2" />
      <path d="M12 17.5l4 2" />
      <path d="M7.5 4A9.9 9.9 0 0 0 2 12c0 1.5.3 2.9.9 4.1" />
      <path d="M16.5 4A9.9 9.9 0 0 1 22 12c0 1.5-.3 2.9-.9 4.1" />
    </svg>
  );
}
