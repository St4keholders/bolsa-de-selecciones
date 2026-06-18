"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Partido, MercadoSeleccion } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";
import { Eyebrow } from "./ui/Eyebrow";

type PartidoFull = Partido & {
  local: MercadoSeleccion | null;
  visitante: MercadoSeleccion | null;
};

export function ProximoPartido() {
  const [partidosHoy, setPartidosHoy] = useState<PartidoFull[]>([]);
  const [proximo, setProximo] = useState<PartidoFull | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Obtenemos los próximos 10 partidos programados con equipos asignados
      const { data } = await supabase
        .from('partidos')
        .select('*, local:equipo_local_id(*), visitante:equipo_visitante_id(*)')
        .eq('estado', 'programado')
        .not('equipo_local_id', 'is', null)
        .not('equipo_visitante_id', 'is', null)
        .gte('fecha', new Date().toISOString().split('T')[0])
        .order('fecha', { ascending: true })
        .limit(10);
      
      if (data && data.length > 0) {
        // Encontrar partidos de "hoy" (usando UTC/local simplificado: misma fecha string YYYY-MM-DD)
        const todayStr = new Date().toISOString().split('T')[0];
        
        const hoy = data.filter(p => p.fecha === todayStr);
        
        if (hoy.length > 0) {
          setPartidosHoy(hoy as PartidoFull[]);
          setProximo(null);
        } else {
          // Buscar el próximo futuro
          const futuros = data.filter(p => p.fecha >= todayStr);
          if (futuros.length > 0) {
            setProximo(futuros[0] as PartidoFull);
            setPartidosHoy([]);
          } else {
            // Fallback: el más cercano del array original aunque sea viejo
            setProximo(data[0] as PartidoFull);
            setPartidosHoy([]);
          }
        }
      } else {
        setPartidosHoy([]);
        setProximo(null);
      }
    };

    fetchData();

    const channel = supabase
      .channel('proximo_partido_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidos' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  if (partidosHoy.length === 0 && !proximo) {
    return <div className="p-6 border border-hair2 text-dim text-center">No hay partidos programados.</div>;
  }

  const formatDate = (d: string) => {
    return new Date(d + 'T12:00:00Z').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  // Renderizar lista si hay múltiples hoy
  if (partidosHoy.length > 1) {
    return (
      <div className="border border-hair2 p-5 bg-raise flex flex-col relative overflow-hidden">
        <div className="mb-4 text-center">
          <Eyebrow className="text-[var(--color-mundial-orange)]">HOY · {partidosHoy.length} PARTIDOS</Eyebrow>
        </div>
        <div className="flex flex-col gap-2">
          {partidosHoy.map(p => {
            const isReprogramado = p.fecha_actualizada_at != null;
            return (
              <div key={p.id} className="flex items-center justify-between bg-canvas p-2 border border-hair2 text-sm">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-4 h-4 rounded-full border border-hair2" style={{ background: COUNTRIES[p.local!.id]?.gradientFull }} />
                  <span className="font-sans text-ink truncate">{p.local!.pais}</span>
                </div>
                <div className="font-mono text-xs text-dim px-2">vs</div>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="font-sans text-ink truncate">{p.visitante!.pais}</span>
                  <div className="w-4 h-4 rounded-full border border-hair2" style={{ background: COUNTRIES[p.visitante!.id]?.gradientFull }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Renderizar carta individual (1 hoy o 1 próximo)
  const partidoAMostrar = partidosHoy.length === 1 ? partidosHoy[0] : proximo!;
  const isHoy = partidosHoy.length === 1;
  const isReprogramado = partidoAMostrar.fecha_actualizada_at != null;

  return (
    <div className={`border border-hair2 border-l-4 border-l-[var(--color-mundial-orange)] p-5 flex flex-col items-center text-center relative overflow-hidden ${isHoy ? 'bg-[var(--color-mundial-lime)]/10' : 'bg-raise'}`}>
      <div className="mb-4 flex flex-col items-center">
        <Eyebrow className={isHoy ? 'text-[var(--color-mundial-orange)]' : ''}>
          {isHoy ? 'PARTIDO DE HOY' : `PRÓXIMO PARTIDO · ${formatDate(partidoAMostrar.fecha)}`}
        </Eyebrow>
        {isReprogramado && (
          <span className="mt-1 font-mono text-[0.65rem] bg-accent2 text-canvas px-2 py-0.5 tracking-widest uppercase">
            Reprogramado
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 w-full">
        {/* Local */}
        <div className="flex-1 flex flex-col items-center">
          <div 
            className="w-12 h-12 rounded-full mb-2 border border-hair2"
            style={{ background: COUNTRIES[partidoAMostrar.local!.id]?.gradientFull }}
          />
          <span className="font-display font-semibold text-lg leading-tight text-ink">{partidoAMostrar.local!.pais}</span>
        </div>

        {/* VS */}
        <div className="font-mono font-bold text-dim2 mx-2">VS</div>

        {/* Visitante */}
        <div className="flex-1 flex flex-col items-center">
          <div 
            className="w-12 h-12 rounded-full mb-2 border border-hair2"
            style={{ background: COUNTRIES[partidoAMostrar.visitante!.id]?.gradientFull }}
          />
          <span className="font-display font-semibold text-lg leading-tight text-ink">{partidoAMostrar.visitante!.pais}</span>
        </div>
      </div>

      <div className="mt-6 border border-hair2 rounded-full px-3 py-1 bg-canvas">
        <span className="font-mono text-[0.65rem] uppercase tracking-widest font-medium text-ink">
          {partidoAMostrar.fase.replace('_', ' ')} {partidoAMostrar.grupo ? `· GRUPO ${partidoAMostrar.grupo}` : ''}
        </span>
      </div>
    </div>
  );
}
