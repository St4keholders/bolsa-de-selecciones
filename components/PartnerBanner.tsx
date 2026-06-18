"use client";

import { useRouter } from "next/navigation";
import { usePartner } from "@/hooks/usePartner";
import { Eyebrow } from "./ui/Eyebrow";
import { Button } from "./ui/Button";
import { Trophy, Lock, Gift } from "lucide-react";

interface PartnerBannerProps {
  userId: string;
}

export function PartnerBanner({ userId }: PartnerBannerProps) {
  const { partner, partnerId, isLoading } = usePartner(userId);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="mx-3 md:mx-5 mt-3 md:mt-4 animate-pulse">
        <div className="h-24 md:h-20 rounded-2xl bg-raise" />
      </div>
    );
  }

  // CASE B — User HAS a partner assigned
  if (partnerId && partner) {
    return (
      <div className="mx-3 md:mx-5 mt-3 md:mt-4">
        <div
          className="relative rounded-2xl p-4 md:p-5 border-l-4 overflow-hidden"
          style={{
            borderLeftColor: partner.color_brand,
            backgroundColor: `${partner.color_brand}10`,
          }}
        >
          {/* Lock icon top-right */}
          <div className="absolute top-3 right-3 group cursor-default">
            <Lock className="w-4 h-4 text-dim" />
            <div className="absolute right-0 top-6 bg-ink text-canvas text-[0.6rem] font-mono px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Elección permanente
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Logo or initial */}
            {partner.logo_url ? (
              <img
                src={partner.logo_url}
                alt={partner.nombre}
                className="w-12 h-12 rounded-lg object-contain flex-shrink-0"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-display font-bold text-xl flex-shrink-0"
                style={{ backgroundColor: partner.color_brand }}
              >
                {partner.nombre.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col gap-0.5 pr-6">
              <Eyebrow className="block text-dim">TU PATROCINADOR</Eyebrow>
              <span className="font-display font-semibold text-ink text-lg leading-tight">
                {partner.nombre}
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                <span
                  className="font-mono uppercase text-[0.65rem] tracking-widest font-medium"
                  style={{ color: partner.color_brand }}
                >
                  🏆 {partner.premio_titulo}
                </span>
                <span className="text-dim text-xs font-sans">
                  Compites por: {partner.premio_descripcion}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CASE A — User WITHOUT partner (CTA banner)
  return (
    <div className="mx-3 md:mx-5 mt-3 md:mt-4">
      <div className="rounded-2xl p-5 md:p-6 overflow-hidden relative bg-white/90 backdrop-blur-md shadow-panini border border-hair2">
        {/* Subtle gradient accent line at top */}
        <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[var(--color-panini-mint)] to-[var(--color-panini-orange)]" />

        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[var(--color-panini-mint)] to-[var(--color-panini-orange)] flex items-center justify-center shadow-sm">
            <Trophy className="w-7 h-7 md:w-6 md:h-6 text-white" />
          </div>

          {/* Text */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 gap-1">
            <Eyebrow className="block text-[var(--color-panini-forest)]">
              ELIGE TU PATROCINADOR
            </Eyebrow>
            <h3 className="font-display font-bold text-ink text-xl md:text-2xl tracking-tight">
              Compite por premios
            </h3>
            <p className="font-sans text-dim text-sm font-light leading-relaxed max-w-md">
              Cada partner ofrece un premio diferente. Elige el tuyo y
              desbloquea la chance de ganar.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            variant="custom"
            onClick={() => router.push("/elegir-partner")}
            className="bg-ink text-canvas font-mono uppercase tracking-widest text-xs md:text-sm px-6 py-3 md:py-3.5 whitespace-nowrap flex-shrink-0 hover:scale-[1.02] transition-transform"
          >
            VER PARTNERS DISPONIBLES →
          </Button>
        </div>
      </div>
    </div>
  );
}
