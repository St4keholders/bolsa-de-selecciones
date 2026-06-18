"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Partido } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";
import { Eyebrow } from "./ui/Eyebrow";

type PartidoFecha = Partido & {
  local_pais?: string;
  visitante_pais?: string;
  local_id?: number;
  visitante_id?: number;
};

export function ProximasFechas() {
  const [partidos, setPartidos] = useState<PartidoFecha[]>([]);
  const [reprogramados, setReprogramados] = useState<Set<string>>(new Set());
  const supabase = createClient();

  const fetchProximos = async () => {
    const { data } = await supabase
      .from("partidos")
      .select(`
        *,
        local:equipo_local_id(id, pais),
        visitante:equipo_visitante_id(id, pais)
      `)
      .eq("estado", "programado")
      .gte("fecha", new Date().toISOString().split('T')[0])
      .order("fecha", { ascending: true })
      .limit(10);

    if (data) {
      setPartidos(
        data.map((p: any) => ({
          ...p,
          local_pais: p.local?.pais || null,
          visitante_pais: p.visitante?.pais || null,
          local_id: p.local?.id || null,
          visitante_id: p.visitante?.id || null,
        }))
      );
    }
  };

  useEffect(() => {
    fetchProximos();

    // Realtime: detectar reprogramaciones
    const channel = supabase
      .channel("proximas_fechas_rt")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "partidos" },
        (payload) => {
          const newDoc = payload.new;
          const oldDoc = payload.old;
          // Si solo cambió la fecha (reprogramación)
          if (oldDoc.fecha !== newDoc.fecha && newDoc.estado === "programado") {
            setReprogramados((prev) => {
              const next = new Set(prev);
              next.add(newDoc.id);
              return next;
            });
            // Quitar badge después de 24h (en la práctica, limpiamos al desmontar)
            setTimeout(() => {
              setReprogramados((prev) => {
                const next = new Set(prev);
                next.delete(newDoc.id);
                return next;
              });
            }, 24 * 60 * 60 * 1000);
          }
          fetchProximos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (partidos.length === 0)
    return (
      <div className="text-dim text-center p-6 border border-hair2">
        No hay partidos programados próximamente.
      </div>
    );

  // Agrupar por fecha
  const grouped: Record<string, PartidoFecha[]> = {};
  partidos.forEach((p) => {
    const key = p.fecha;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-CO", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).toUpperCase();

  return (
    <div className="flex flex-col">
      {Object.entries(grouped).map(([fecha, matches]) => (
        <div key={fecha} className="mb-6">
          <Eyebrow className="block mb-3 text-[var(--color-mundial-orange)]">{formatDate(fecha)}</Eyebrow>
          <div className="flex flex-col gap-2">
            {matches.map((p) => {
              const localTheme = p.local_id ? COUNTRIES[p.local_id] : null;
              const visitTheme = p.visitante_id ? COUNTRIES[p.visitante_id] : null;
              const isReprogramado =
                reprogramados.has(p.id) || p.fecha_actualizada_at != null;

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between border border-hair2 p-3 bg-canvas hover:bg-raise transition-colors relative"
                >
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--color-mundial-ribbon)] opacity-20" />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Local */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {localTheme ? (
                        <>
                          <div
                            className="w-5 h-5 rounded-full border border-hair2 flex-shrink-0"
                            style={{ background: localTheme.gradientFull }}
                          />
                          <span className="font-sans text-sm text-ink truncate">
                            <span className="md:hidden">{(p.local_pais || '').length > 12 ? (localTheme?.codigo || (p.local_pais || '').substring(0, 3).toUpperCase()) : p.local_pais}</span>
                            <span className="hidden md:inline">{p.local_pais}</span>
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-[0.6rem] text-dim truncate">
                          {p.dependencia_local}
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-xs text-dim2 mx-1">vs</span>

                    {/* Visitante */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {visitTheme ? (
                        <>
                          <div
                            className="w-5 h-5 rounded-full border border-hair2 flex-shrink-0"
                            style={{ background: visitTheme.gradientFull }}
                          />
                          <span className="font-sans text-sm text-ink truncate">
                            <span className="md:hidden">{(p.visitante_pais || '').length > 12 ? (visitTheme?.codigo || (p.visitante_pais || '').substring(0, 3).toUpperCase()) : p.visitante_pais}</span>
                            <span className="hidden md:inline">{p.visitante_pais}</span>
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-[0.6rem] text-dim truncate">
                          {p.dependencia_visitante}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className={`font-mono text-[0.6rem] uppercase px-1.5 py-0.5 ${p.fase === 'grupos' ? 'bg-[var(--color-mundial-blue)]/10 text-[var(--color-mundial-blue)]' : 'bg-[var(--color-mundial-purple)]/10 text-[var(--color-mundial-purple)]'}`}>
                      {p.fase.replace("_", " ")}
                    </span>
                    {isReprogramado && (
                      <span className="font-mono text-[0.55rem] bg-accent text-canvas px-1.5 py-0.5 tracking-wider uppercase">
                        Reprogramado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
