"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { MercadoSeleccion } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";

export function Top10Chart() {
  const [top10, setTop10] = useState<MercadoSeleccion[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchTop = async () => {
      const { data } = await supabase
        .from('mercado_selecciones')
        .select('*')
        .eq('estado', 'activo')
        .order('valor_total', { ascending: false })
        .limit(10);
      if (data) setTop10(data as MercadoSeleccion[]);
    };

    fetchTop();

    const channel = supabase
      .channel('top10_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mercado_selecciones' }, fetchTop)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  if (top10.length === 0) {
    return (
      <div className="p-8 text-center border border-hair2 border-dashed rounded-lg bg-raise/50">
        <span className="font-mono text-dim text-sm tracking-widest uppercase">Aún no hay selecciones en el Top 10</span>
      </div>
    );
  }

  const maxVal = top10[0]?.valor_total || 1;

  return (
    <div className="flex flex-col gap-3">
      {top10.map((sel, i) => {
        const country = COUNTRIES[sel.id];
        const widthPercent = Math.max(10, (sel.valor_total / maxVal) * 100);
        return (
          <div key={sel.id} className="flex flex-col gap-1 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex justify-between items-end mb-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-dim w-4">{i + 1}.</span>
                <span className="font-sans font-medium text-ink">{sel.pais}</span>
              </div>
              <span className="font-display font-semibold text-ink">{sel.valor_total}</span>
            </div>
            <div className="w-full h-2 bg-hair rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ background: country?.gradientFull || '#000' }}
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
