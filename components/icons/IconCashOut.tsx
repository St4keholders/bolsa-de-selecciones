export function IconCashOut({ className = "w-6 h-6" }: { className?: string }) {
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
      {/* Círculo/estrella */}
      <circle cx="12" cy="12" r="9" />
      {/* Estrella interior */}
      <path d="M12 7l1.5 3 3.5.5-2.5 2.5.5 3.5L12 15l-3 1.5.5-3.5L7 10.5l3.5-.5z" />
      {/* Flecha saliendo arriba-derecha */}
      <path d="M16 3h5v5" />
      <path d="M14 10L21 3" />
    </svg>
  );
}
