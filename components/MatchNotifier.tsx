"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { COUNTRIES } from "@/lib/countries";

export function MatchNotifier() {
  const [toast, setToast] = useState<{ id: string, msg: string, localId: number, visitId: number } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('match_notifier')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'partidos',
        filter: 'estado=eq.finalizado'
      }, async (payload) => {
        const newDoc = payload.new;
        const oldDoc = payload.old;
        // Solo notificar si acaba de cambiar a finalizado
        if (oldDoc.estado === 'programado' && newDoc.estado === 'finalizado') {
          // Obtener nombres
          const { data: local } = await supabase.from('mercado_selecciones').select('pais').eq('id', newDoc.equipo_local_id).single();
          const { data: visit } = await supabase.from('mercado_selecciones').select('pais').eq('id', newDoc.equipo_visitante_id).single();
          
          if (local && visit) {
            setToast({
              id: newDoc.id,
              msg: `${local.pais} ${newDoc.goles_local} - ${newDoc.goles_visitante} ${visit.pais}`,
              localId: newDoc.equipo_local_id,
              visitId: newDoc.equipo_visitante_id
            });
            setTimeout(() => setToast(null), 4000);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-5 z-[200] bg-canvas border border-hair2 shadow-2xl overflow-hidden flex flex-col min-w-[280px]"
        >
          <div className="flex h-2">
            <div className="flex-1" style={{ background: COUNTRIES[toast.localId]?.gradientFull || '#000' }} />
            <div className="flex-1" style={{ background: COUNTRIES[toast.visitId]?.gradientFull || '#000' }} />
          </div>
          <div className="p-4 flex flex-col">
            <span className="font-mono text-[0.65rem] text-primary tracking-widest uppercase mb-1">Partido Finalizado</span>
            <span className="font-sans font-medium text-ink">{toast.msg}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
