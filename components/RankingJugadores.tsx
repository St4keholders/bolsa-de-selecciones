"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eyebrow } from "./ui/Eyebrow";

interface RankingRow {
  player_id: string;
  player_name: string;
  total_points: number;
  position: number;
}

export function RankingJugadores({ userId }: { userId: string }) {
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase
        .from('global_ranking')
        .select('*')
        .order('position', { ascending: true });
        
      if (data && !error) {
        setRanking(data as RankingRow[]);
      } else {
        console.error("Error al obtener ranking de la vista global_ranking", error);
      }
      setLoading(false);
    };
    fetchRanking();
  }, [supabase]);

  if (loading) {
    return <div className="text-dim font-mono text-sm py-8 text-center tracking-widest uppercase">Cargando posiciones...</div>;
  }

  if (ranking.length === 0) {
    return (
      <div className="text-dim font-sans py-8 text-center">
        No hay datos de ranking disponibles.
        <br />
        <span className="text-xs font-mono mt-2 block opacity-50">Por favor revisa que la vista global_ranking tenga datos</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-[3fr_1fr] font-mono text-[0.65rem] text-dim tracking-widest pb-3 border-b-[2px] border-hair2 uppercase">
        <div className="pl-4">Posición y Jugador</div>
        <div className="text-right pr-4">Puntos</div>
      </div>

      <div className="flex flex-col mt-2 gap-2">
        {ranking.map((row) => {
          const isMe = row.player_id === userId;
          return (
            <div 
              key={row.player_id}
              className={`grid grid-cols-[3fr_1fr] items-center py-3 px-4 rounded-md transition-colors ${
                isMe ? 'bg-[var(--color-panini-blue)] text-white shadow-panini scale-[1.02]' : 'hover:bg-raise'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`font-display font-bold text-xl w-8 text-center ${isMe ? 'text-[var(--color-panini-mint)]' : 'text-dim'}`}>
                  {row.position}
                </span>
                <span className={`font-sans font-semibold ${isMe ? 'text-white' : 'text-ink'}`}>
                  {row.player_name} {isMe && "(Tú)"}
                </span>
              </div>
              <div className={`text-right font-display font-bold text-2xl ${isMe ? 'text-white' : 'text-ink'}`}>
                {row.total_points}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
