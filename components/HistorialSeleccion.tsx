"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MercadoSeleccion, Partido } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";
import { Eyebrow } from "./ui/Eyebrow";
import { IconArrow } from "./icons/IconArrow";
import { IconSpark as IconCreacion } from "./icons/IconSpark";
import { IconShield as IconMuralla } from "./icons/IconShield";
import { IconEye as IconReflejos } from "./icons/IconEye";
import { IconBall as IconPosesion } from "./icons/IconBall";
import { IconEficiencia } from "./icons/IconEficiencia";

type PartidoHistorial = Partido & {
  local_pais: string;
  visitante_pais: string;
};

export function HistorialSeleccion() {
  const [selecciones, setSelecciones] = useState<MercadoSeleccion[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [selectedData, setSelectedData] = useState<MercadoSeleccion | null>(null);
  const [historial, setHistorial] = useState<PartidoHistorial[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    const fetchSelecciones = async () => {
      const { data } = await supabase.from('mercado_selecciones').select('*').order('pais');
      if (data) setSelecciones(data as MercadoSeleccion[]);
    };
    fetchSelecciones();
  }, [supabase]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedId) {
        // Fetch stats actuales
        const { data: s } = await supabase.from('mercado_selecciones').select('*').eq('id', selectedId).single();
        setSelectedData(s);
      } else {
        setSelectedData(null);
      }

      // Fetch historial (global si no hay selectedId)
      let query = supabase
        .from('partidos')
        .select(`
          *,
          local:equipo_local_id(pais),
          visitante:equipo_visitante_id(pais)
        `)
        .eq('estado', 'finalizado')
        .order('fecha', { ascending: false });

      if (selectedId) {
        query = query.or(`equipo_local_id.eq.${selectedId},equipo_visitante_id.eq.${selectedId}`);
      }

      const { data: h } = await query;

      if (h) {
        const mapped = h.map(p => ({
          ...p,
          local_pais: p.local?.pais || '',
          visitante_pais: p.visitante?.pais || ''
        }));
        setHistorial(mapped);
      }
    };

    fetchData();
  }, [selectedId, supabase]);

  const countryTheme = selectedId ? COUNTRIES[Number(selectedId)] : null;

  return (
    <div className="flex flex-col bg-canvas border border-hair2">
      {/* Header Select */}
      <div className="p-4">
        {selecciones.length === 0 ? (
          <div className="w-full text-center py-4">
            <span className="font-mono text-dim text-sm tracking-widest uppercase">Aún no hay selecciones en el mercado</span>
          </div>
        ) : (
          <div className="relative">
            <select 
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
              className="w-full font-display text-lg font-semibold text-white py-4 px-5 pr-12 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-panini-mint)] transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--color-panini-blue) 0%, var(--color-panini-purple) 100%)',
              }}
            >
              <option value="" className="bg-white text-ink">🏆 Selecciona un país...</option>
              {selecciones.map(s => (
                <option key={s.id} value={s.id} className="bg-white text-ink">{s.pais}</option>
              ))}
            </select>
            {/* Flecha dropdown */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {selecciones.length > 0 && !selectedId && historial.length > 0 && (
        <div className="p-5">
          <Eyebrow className="block mb-4 text-[var(--color-panini-purple)]">TODOS LOS PARTIDOS JUGADOS ({historial.length})</Eyebrow>
          <div className="flex flex-col">
            <div className="grid grid-cols-[1fr_2fr_1fr] font-mono text-[0.65rem] text-dim tracking-widest pb-2 border-b border-hair2 uppercase">
              <div>Fecha</div>
              <div>Rival · Res</div>
              <div className="text-right">Fase</div>
            </div>
            {historial.map(p => {
              const myGoals = p.goles_local;
              const rivalGoals = p.goles_visitante;
              const resultStr = `${myGoals} - ${rivalGoals}`;
              return (
                <div key={p.id} className="grid grid-cols-[1fr_2fr_1fr] items-center py-3 border-b border-hair2 last:border-b-0 text-sm">
                  <div className="font-mono text-dim">{new Date(p.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short'})}</div>
                  <div className="font-sans text-ink">
                    <span className="font-semibold">{p.local_pais}</span> vs {p.visitante_pais} <span className="ml-2 text-dim">{resultStr}</span>
                  </div>
                  <div className="text-right font-mono text-xs uppercase text-dim">{p.fase.replace('_',' ')}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedData && (
        <div className="p-5">
          {/* Stats Summary */}
          <div className="flex flex-col items-center mb-8">
            <Eyebrow className="mb-2">VALOR ACTUAL</Eyebrow>
            <div className="font-display font-bold text-5xl text-ink">
              {selectedData.valor_total.toLocaleString('es-CO')}
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 mt-6 w-full text-center">
              <div className="flex flex-col items-center"><IconArrow className="w-4 h-4 mb-1 text-dim"/><Eyebrow>ATQ</Eyebrow><span className="font-display font-medium text-lg mt-1">{selectedData.ataque}</span></div>
              <div className="flex flex-col items-center"><IconCreacion className="w-4 h-4 mb-1 text-dim"/><Eyebrow>CRE</Eyebrow><span className="font-display font-medium text-lg mt-1">{selectedData.creacion}</span></div>
              <div className="flex flex-col items-center"><IconMuralla className="w-4 h-4 mb-1 text-dim"/><Eyebrow>MUR</Eyebrow><span className="font-display font-medium text-lg mt-1">{selectedData.muralla}</span></div>
              <div className="flex flex-col items-center"><IconReflejos className="w-4 h-4 mb-1 text-dim"/><Eyebrow>REF</Eyebrow><span className="font-display font-medium text-lg mt-1">{selectedData.reflejos}</span></div>
              <div className="flex flex-col items-center"><IconPosesion className="w-4 h-4 mb-1 text-dim"/><Eyebrow>POS</Eyebrow><span className="font-display font-medium text-lg mt-1">{selectedData.posesion}</span></div>
              <div className="flex flex-col items-center"><IconEficiencia className="w-4 h-4 mb-1 text-dim"/><Eyebrow>EFI</Eyebrow><span className="font-display font-medium text-lg mt-1">{selectedData.eficiencia}</span></div>
            </div>
          </div>

          <Eyebrow className="block mb-4">HISTORIAL DE PARTIDOS ({historial.length})</Eyebrow>
          
          {historial.length === 0 ? (
            <div className="text-dim font-sans text-sm pb-4">No ha jugado partidos finalizados aún.</div>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-[1fr_2fr_1fr] font-mono text-[0.65rem] text-dim tracking-widest pb-2 border-b border-hair2 uppercase">
                <div>Fecha</div>
                <div>Rival · Res</div>
                <div className="text-right">Fase</div>
              </div>
              {historial.map(p => {
                const isLocal = p.equipo_local_id === selectedId;
                const rival = isLocal ? p.visitante_pais : p.local_pais;
                const myGoals = isLocal ? p.goles_local : p.goles_visitante;
                const rivalGoals = isLocal ? p.goles_visitante : p.goles_local;
                const resultStr = `${myGoals} - ${rivalGoals}`;
                let resultColor = 'text-dim';
                if (myGoals! > rivalGoals!) resultColor = 'text-success font-medium';
                if (myGoals! < rivalGoals!) resultColor = 'text-danger font-medium';

                return (
                  <div key={p.id} className="grid grid-cols-[1fr_2fr_1fr] items-center py-3 border-b border-hair2 last:border-b-0 text-sm">
                    <div className="font-mono text-dim">{new Date(p.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short'})}</div>
                    <div className="font-sans text-ink">
                      vs {rival} <span className={`ml-2 ${resultColor}`}>{resultStr}</span>
                    </div>
                    <div className="text-right font-mono text-xs uppercase text-dim">{p.fase.replace('_',' ')}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
