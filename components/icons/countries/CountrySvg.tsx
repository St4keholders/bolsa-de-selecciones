interface CountrySvgProps {
  countryCode: string;
  svgArtType: string;
  className?: string;
  color?: string;
}

export function CountrySvg({ countryCode, svgArtType, className = "w-16 h-16", color = "currentColor" }: CountrySvgProps) {
  // Un renderizado básico para los diferentes tipos de arte SVG definidos
  // En producción real, estos serían archivos SVG separados o paths más elaborados

  switch (svgArtType) {
    case 'Eagle':
      return (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="2" className={className}>
          <path d="M50 20 L20 40 L30 80 L50 70 L70 80 L80 40 Z" strokeLinejoin="round" />
          <circle cx="50" cy="30" r="5" />
        </svg>
      );
    case 'Ball':
      return (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="2" className={className}>
          <circle cx="50" cy="50" r="30" />
          <path d="M30 40 Q50 60 70 40" />
          <path d="M40 70 Q50 50 60 70" />
          <path d="M25 50 L40 50" />
          <path d="M75 50 L60 50" />
        </svg>
      );
    case 'Star':
      return (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="2" className={className}>
          <polygon points="50,15 61,35 82,35 65,50 71,71 50,58 29,71 35,50 18,35 39,35" strokeLinejoin="round" />
        </svg>
      );
    case 'Wave':
      return (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="2" className={className}>
          <path d="M10 80 Q 30 40 50 80 T 90 80" />
          <path d="M20 70 Q 40 30 60 70 T 100 70" />
          <circle cx="70" cy="30" r="10" fill={color} />
        </svg>
      );
    case 'Lion':
      return (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="2" className={className}>
          <path d="M30 80 L30 40 Q40 20 60 30 Q70 40 70 60 L70 80" strokeLinecap="round" />
          <circle cx="45" cy="45" r="3" />
          <circle cx="55" cy="45" r="3" />
          <path d="M45 60 Q50 70 55 60" />
        </svg>
      );
    case 'Sun':
      return (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="2" className={className}>
          <circle cx="50" cy="50" r="15" />
          <path d="M50 15 L50 25 M50 75 L50 85 M15 50 L25 50 M75 50 L85 50" />
          <path d="M25 25 L32 32 M68 68 L75 75 M25 75 L32 68 M68 25 L75 32" />
        </svg>
      );
    case 'Castle':
      return (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="2" className={className}>
          <path d="M20 80 L80 80 L80 50 L70 50 L70 30 L60 30 L60 50 L40 50 L40 30 L30 30 L30 50 L20 50 Z" strokeLinejoin="round" />
          <rect x="45" y="60" width="10" height="20" />
        </svg>
      );
    case 'Rooster':
    case 'Condor':
    case 'Shield':
      return (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="2" className={className}>
          <path d="M30 20 L70 20 L70 50 Q70 80 50 90 Q30 80 30 50 Z" strokeLinejoin="round" />
          <circle cx="50" cy="45" r="10" />
        </svg>
      );
    case 'Tulip':
      return (
        <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="2" className={className}>
          <path d="M50 90 L50 50" />
          <path d="M30 30 Q50 70 70 30" />
          <path d="M40 20 L50 40 L60 20" />
        </svg>
      );
    case 'Text':
    default:
      // Composición tipográfica fuerte para países sin ícono SVG explícito
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <text 
            x="50" y="58" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill={color} 
            fontFamily="var(--font-display)" 
            fontWeight="700" 
            fontSize="48"
            letterSpacing="-0.05em"
          >
            {countryCode}
          </text>
        </svg>
      );
  }
}
