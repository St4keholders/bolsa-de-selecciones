export type CardTier = 'bronce' | 'plata' | 'oro';

export function getTier(valorTotal: number): CardTier {
  if (valorTotal >= 900) return 'oro';
  if (valorTotal >= 500) return 'plata';
  return 'bronce';
}

export const tierConfig = {
  bronce: {
    label: 'COMÚN',
    borderColor: 'border-ink',
    borderWidth: 'border-[3px]',
    glow: false,
    trophyColor: 'currentColor',
    badgeBg: 'bg-raise',
    badgeText: 'text-ink',
    shimmer: false,
    colorScheme: 'warm' as const
  },
  plata: {
    label: 'PLATA',
    borderColor: 'border-[#E0E0E0]', // Plata solido
    borderWidth: 'border-[4px]',
    glow: false, // Flat design no usa glow difuso, usamos shadow-hard-silver
    trophyColor: '#E0E0E0',
    badgeBg: 'bg-[#E0E0E0]',
    badgeText: 'text-ink2',
    shimmer: true,
    colorScheme: 'cool' as const
  },
  oro: {
    label: 'ORO',
    borderColor: 'border-[var(--color-mundial-yellow)]',
    borderWidth: 'border-[5px]',
    glow: false,
    trophyColor: 'var(--color-mundial-yellow)',
    badgeBg: 'bg-[var(--color-mundial-yellow)]',
    badgeText: 'text-ink',
    shimmer: true,
    animatedBadge: true,
    colorScheme: 'mundial-full' as const
  }
};
