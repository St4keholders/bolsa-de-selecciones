"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePartner } from "@/hooks/usePartner";
import { Eyebrow } from "./ui/Eyebrow";

interface RankingRow {
  player_id: string;
  player_name: string;
  total_points: number;
  position: number;
}

export function RankingJugadores({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'global' | 'partner'>('global');
  const [globalRanking, setGlobalRanking] = useState<RankingRow[]>([]);
  const [partnerRanking, setPartnerRanking] = useState<RankingRow[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(true);
  const [loadingPartner, setLoadingPartner] = useState(false);
  const { partner, partnerId } = usePartner(userId);
  const supabase = createClient();

  // Fetch Global Ranking
  useEffect(() => {
    const fetchGlobalRanking = async () => {
      setLoadingGlobal(true);
      const { data, error } = await supabase
        .from('global_ranking')
        .select('*')
        .order('position', { ascending: true });
        
      if (data && !error) {
        setGlobalRanking(data as RankingRow[]);
      } else {
        console.error("Error al obtener ranking de la vista global_ranking", error);
      }
      setLoadingGlobal(false);
    };
    fetchGlobalRanking();
  }, [supabase]);

  // Fetch Partner Ranking
  useEffect(() => {
    const fetchPartnerRanking = async () => {
      if (!partnerId) return;
      setLoadingPartner(true);
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre, puntos_permanentes')
        .eq('partner_id', partnerId)
        .order('puntos_permanentes', { ascending: false })
        .limit(20);

      if (data && !error) {
        // Formatear igual que la vista global_ranking
        const formatted = data.map((u, index) => ({
          player_id: u.id,
          player_name: u.nombre,
          total_points: u.puntos_permanentes,
          position: index + 1
        }));
        setPartnerRanking(formatted);
      }
      setLoadingPartner(false);
    };
    
    if (activeTab === 'partner') {
      fetchPartnerRanking();
    }
  }, [partnerId, activeTab, supabase]);

  const ranking = activeTab === 'global' ? globalRanking : partnerRanking;
  const isLoading = activeTab === 'global' ? loadingGlobal : loadingPartner;

  // Encontrar la posición del usuario en el ranking actual para destacarla si es necesario
  const userRankIndex = ranking.findIndex(r => r.player_id === userId);
  const userRank = userRankIndex !== -1 ? ranking[userRankIndex] : null;

  return (
    <div className="flex flex-col w-full">
      {/* Sub-tabs solo si el usuario tiene partner */}
      {partnerId && partner && (
        <div className="flex border-b border-hair2 mb-6">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
              activeTab === 'global' 
                ? 'border-b-2 border-ink text-ink font-bold' 
                : 'text-dim hover:bg-raise'
            }`}
          >
            RANKING GLOBAL
          </button>
          <button
            onClick={() => setActiveTab('partner')}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${
              activeTab === 'partner' 
                ? 'border-b-2 border-ink text-ink font-bold' 
                : 'text-dim hover:bg-raise'
            }`}
          >
            RANKING DE {partner.nombre}
          </button>
        </div>
      )}

      {/* Mensaje de posición destacada en ranking partner */}
      {activeTab === 'partner' && partner && userRank && (
        <div 
          className="mb-6 p-4 rounded-lg flex flex-col md:flex-row md:items-center gap-3 border"
          style={{ backgroundColor: `${partner.color_brand}10`, borderColor: `${partner.color_brand}30` }}
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display font-bold text-xl flex-shrink-0 shadow-sm"
            style={{ backgroundColor: partner.color_brand }}
          >
            #{userRank.position}
          </div>
          <div>
            <span className="font-sans text-ink block">
              Estás <strong className="font-bold">#{userRank.position}</strong> entre los jugadores que eligieron a {partner.nombre}.
            </span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-dim font-mono text-sm py-8 text-center tracking-widest uppercase animate-pulse">
          Cargando posiciones...
        </div>
      ) : ranking.length === 0 ? (
        <div className="text-dim font-sans py-8 text-center">
          No hay datos de ranking disponibles.
        </div>
      ) : (
        <>
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
                    <span className={`font-sans font-semibold truncate ${isMe ? 'text-white' : 'text-ink'}`}>
                      {row.player_name} {isMe && "(Tú)"}
                    </span>
                  </div>
                  <div className={`text-right font-display font-bold text-xl md:text-2xl ${isMe ? 'text-white' : 'text-ink'}`}>
                    {row.total_points.toLocaleString('es-CO')}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
