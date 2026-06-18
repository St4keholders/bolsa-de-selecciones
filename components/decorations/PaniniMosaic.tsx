"use client";

import React from 'react';

interface Props {
  className?: string;
  variant?: 'border' | 'card-header';
}

export function PaniniMosaic({ className = "", variant = "border" }: Props) {
  const patternDefs = (
    <defs>
      <pattern id="panini-pattern" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
        {/* Fondo base para el patrón */}
        <rect x="0" y="0" width="160" height="160" fill="transparent" />
        
        {/* Cuadrante 1: Círculo central superior */}
        <path d="M80,0 A80,80 0 0,0 0,80 L80,80 Z" fill="var(--color-panini-blue)" />
        <path d="M160,80 A80,80 0 0,0 80,0 L80,80 Z" fill="var(--color-panini-mint)" />
        
        {/* Cuadrante 2: Esquinas inferiores */}
        <path d="M0,80 A80,80 0 0,0 80,160 L0,160 Z" fill="var(--color-panini-red)" />
        <path d="M80,160 A80,80 0 0,0 160,80 L160,160 Z" fill="var(--color-panini-mustard)" />

        {/* Semicírculos desplazados para dar el efecto de intersección */}
        <path d="M160,0 A80,80 0 0,0 80,80 L160,80 Z" fill="var(--color-panini-navy)" />
        <path d="M0,160 A80,80 0 0,0 80,80 L0,80 Z" fill="var(--color-panini-forest)" />
      </pattern>
    </defs>
  );

  if (variant === 'border') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          {patternDefs}
          {/* Columna Izquierda */}
          <rect x="0" y="0" width="160" height="100%" fill="url(#panini-pattern)" />
          {/* Columna Derecha */}
          <rect x="calc(100% - 160px)" y="0" width="160" height="100%" fill="url(#panini-pattern)" />
        </svg>
      </div>
    );
  }

  if (variant === 'card-header') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
        <svg width="100%" height="100%" preserveAspectRatio="none">
          {patternDefs}
          <rect x="0" y="0" width="100%" height="100%" fill="url(#panini-pattern)" />
        </svg>
      </div>
    );
  }

  return null;
}
