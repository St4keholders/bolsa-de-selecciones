"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MercadoSeleccion } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";

export function Top5Peores() {
  const [peores, setPeores] = useState<MercadoSeleccion[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchPeores = async () => {
      const { data } = await supabase
        .from('mercado_selecciones')
        .select('*')
        .eq('estado', 'activo')
        .order('valor_total', { ascending: true })
        .limit(5);
      if (data) setPeores(data as MercadoSeleccion[]);
    };

    fetchPeores();

    const channel = supabase
      .channel('top5peores_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mercado_selecciones' }, fetchPeores)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  if (peores.length === 0) {
    return (
      <div className="p-8 text-center border border-hair2 border-dashed rounded-lg bg-raise/50">
        <span className="font-mono text-dim text-sm tracking-widest uppercase">Aún no hay selecciones registradas</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-hair2 bg-canvas">
      {peores.map((sel, i) => {
        const country = COUNTRIES[sel.id];
        // 48 - 4 (top 5 = #48, #47, etc.) => position starts at 48 downwards
        // But since we selected ascending limit 5, the first one is the worst (e.g. #48)
        return (
          <div key={sel.id} className="flex items-center justify-between p-3 border-b border-hair2 last:border-b-0 cursor-pointer hover:bg-raise transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-mono text-dim text-xs w-6">#{48 - i}</span>
              <div 
                className="w-6 h-6 border border-hair2 flex-shrink-0"
                style={{ background: country?.gradientFull || '#000' }}
              />
              <span className="font-sans font-medium text-ink">{sel.pais}</span>
            </div>
            <span className="font-display text-dim font-medium">{sel.valor_total}</span>
          </div>
        );
      })}
    </div>
  );
}
