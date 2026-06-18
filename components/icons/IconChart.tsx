export function IconChart({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* 3 barras crecientes */}
      <rect x="3" y="14" width="4" height="8" rx="0.5" />
      <rect x="10" y="9" width="4" height="13" rx="0.5" />
      <rect x="17" y="4" width="4" height="18" rx="0.5" />
      {/* línea de tendencia */}
      <path d="M4 12 L12 6 L19 3" />
      <circle cx="19" cy="3" r="1.5" fill="currentColor" />
    </svg>
  );
}
