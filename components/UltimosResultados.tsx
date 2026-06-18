"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Partido, MercadoSeleccion } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";
import { Eyebrow } from "./ui/Eyebrow";

type PartidoResult = Partido & {
  local: MercadoSeleccion | null;
  visitante: MercadoSeleccion | null;
};

interface UltimosResultadosProps {
  userId: string;
}

function calculateDelta(gl: number, gv: number, pl: number, pv: number, tl: number, tv: number, isLocal: boolean) {
  const efi = isLocal ? (tl > 0 ? (gl/tl)*100 : 0) : (tv > 0 ? (gv/tv)*100 : 0);
  const win = isLocal ? gl > gv : gv > gl;
  const draw = gl === gv;
  const gf = isLocal ? gl : gv;
  const gc = isLocal ? gv : gl;
  const pos = isLocal ? pl : pv;
  
  let pts = 0;
  pts += gf > 0 ? gf * 8 : -4;
  pts += pos > 55 ? 5 : (pos < 45 ? -2 : 0);
  pts += gc === 0 ? 5 : (gc > 2 ? -4 : -2);
  pts += gc === 0 ? 3 : (gc > 2 ? -3 : 0);
  pts += pos > 50 ? 3 : -2;
  pts += efi > 20 ? 5 : (efi < 10 ? -3 : 0);
  pts += win ? 10 : (draw ? 2 : -5);
  return pts;
}

export function UltimosResultados({ userId }: UltimosResultadosProps) {
  const [partidos, setPartidos] = useState<PartidoResult[]>([]);
  const [userSelecciones, setUserSelecciones] = useState<Set<number>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    const fetchResultados = async () => {
      // 1. Obtener partidos finalizados
      const { data: partidosData } = await supabase
        .from('partidos')
        .select('*, local:equipo_local_id(id, pais, codigo), visitante:equipo_visitante_id(id, pais, codigo)')
        .eq('estado', 'finalizado')
        .not('equipo_local_id', 'is', null)
        .not('equipo_visitante_id', 'is', null)
        .order('finalizado_at', { ascending: false })
        .limit(5);

      if (partidosData) {
        setPartidos(partidosData as PartidoResult[]);
      }

      // 2. Obtener portafolio del usuario
      const { data: portafolioData } = await supabase
        .from('portafolio')
        .select('seleccion_id')
        .eq('user_id', userId)
        .eq('estado_carta', 'activa');

      if (portafolioData) {
        setUserSelecciones(new Set(portafolioData.map(p => p.seleccion_id)));
      }
    };

    fetchResultados();
  }, [userId, supabase]);

  if (partidos.length === 0) return null;

  const formatDate = (d: string) =>
    new Date(d + 'T12:00:00Z').toLocaleDateString("es-CO", {
      weekday: "short",
      day: "2-digit",
      month: "short"
    }).toUpperCase();

  return (
    <div className="mb-8">
      <Eyebrow className="block mb-1 text-[var(--color-mundial-orange)]">ÚLTIMOS RESULTADOS</Eyebrow>
      <h2 className="font-display text-3xl font-bold text-ink mb-6">Lo que acaba de pasar</h2>
      
      <div className="flex flex-col gap-4">
        {partidos.map(p => {
          const localTheme = p.local ? COUNTRIES[p.local.id] : null;
          const visitTheme = p.visitante ? COUNTRIES[p.visitante.id] : null;
          
          const gl = p.goles_local || 0;
          const gv = p.goles_visitante || 0;
          const pl = p.posesion_local || 0;
          const pv = p.posesion_visitante || 0;
          const tl = p.tiros_local || 0;
          const tv = p.tiros_visitante || 0;

          const hasLocal = userSelecciones.has(p.local!.id);
          const hasVisit = userSelecciones.has(p.visitante!.id);

          return (
            <div key={p.id} className="border-t-[3px] border-t-transparent relative border-b border-l border-r border-hair2 bg-canvas overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--color-mundial-orange)] via-[var(--color-mundial-red)] to-[var(--color-mundial-purple)]" />
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-3 border-b border-hair2 pb-2">
                  <span className="font-mono text-xs text-[var(--color-mundial-orange)] font-bold">{formatDate(p.fecha)}</span>
                  <span className={`font-mono text-[0.6rem] uppercase px-1.5 py-0.5 ${p.fase === 'grupos' ? 'bg-[var(--color-mundial-blue)]/10 text-[var(--color-mundial-blue)]' : 'bg-[var(--color-mundial-purple)]/10 text-[var(--color-mundial-purple)]'}`}>
                    {p.fase.replace("_", " ")} {p.grupo ? `· GRUPO ${p.grupo}` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Local */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full border border-hair2" style={{ background: localTheme?.gradientFull }} />
                    <span className="font-sans font-medium text-ink text-sm">{p.local?.pais}</span>
                  </div>

                  {/* Marcador Grande */}
                  <div className="flex-shrink-0 flex items-center justify-center gap-3 px-4">
                    <span className={`font-display font-bold text-4xl ${gl > gv ? 'text-[var(--color-mundial-lime)]' : (gl < gv ? 'text-[var(--color-mundial-red)]' : 'text-ink')}`}>{gl}</span>
                    <span className="font-mono text-dim">-</span>
                    <span className={`font-display font-bold text-4xl ${gv > gl ? 'text-[var(--color-mundial-lime)]' : (gv < gl ? 'text-[var(--color-mundial-red)]' : 'text-ink')}`}>{gv}</span>
                  </div>

                  {/* Visitante */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full border border-hair2" style={{ background: visitTheme?.gradientFull }} />
                    <span className="font-sans font-medium text-ink text-sm">{p.visitante?.pais}</span>
                  </div>
                </div>

                {/* Badges Portafolio */}
                {(hasLocal || hasVisit) && (
                  <div className="mt-4 pt-3 border-t border-hair2 flex flex-col gap-2">
                    {hasLocal && (
                      <div className="flex items-center justify-center">
                        {(() => {
                          const delta = calculateDelta(gl, gv, pl, pv, tl, tv, true);
                          return (
                            <span className={`font-mono text-[0.65rem] px-2 py-1 tracking-widest ${delta >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                              TU CARTA DE {p.local?.codigo} {delta >= 0 ? 'SUBIÓ' : 'BAJÓ'} {delta > 0 ? '+' : ''}{delta} PTS
                            </span>
                          );
                        })()}
                      </div>
                    )}
                    {hasVisit && (
                      <div className="flex items-center justify-center">
                        {(() => {
                          const delta = calculateDelta(gl, gv, pl, pv, tl, tv, false);
                          return (
                            <span className={`font-mono text-[0.65rem] px-2 py-1 tracking-widest ${delta >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                              TU CARTA DE {p.visitante?.codigo} {delta >= 0 ? 'SUBIÓ' : 'BAJÓ'} {delta > 0 ? '+' : ''}{delta} PTS
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
