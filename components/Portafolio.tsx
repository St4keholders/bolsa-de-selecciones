"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { CartaConSeleccion, MercadoSeleccion, PortafolioCarta } from "@/lib/types";
import { Eyebrow } from "./ui/Eyebrow";
import { CartaSeleccion } from "./CartaSeleccion";
import { IconEnvelope } from "./icons/IconEnvelope";
import { Button } from "./ui/Button";

interface PortafolioProps {
  userId: string;
}

export function Portafolio({ userId }: PortafolioProps) {
  const [cartas, setCartas] = useState<CartaConSeleccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const supabase = createClient();

  const fetchPortafolio = async () => {
    // 1. Obtener el portafolio del usuario (solo cartas activas)
    const { data: portafolioData } = await supabase
      .from("portafolio")
      .select("*")
      .eq("user_id", userId)
      .eq("estado_carta", "activa");

    if (!portafolioData) return;

    // 2. Obtener el mercado
    const { data: mercadoData } = await supabase
      .from("mercado_selecciones")
      .select("*");

    if (!mercadoData) return;

    // 3. Mapear y unir
    const mercadoMap = new Map<number, MercadoSeleccion>();
    mercadoData.forEach((m) => mercadoMap.set(m.id, m as MercadoSeleccion));

    const cartasCompletas: CartaConSeleccion[] = portafolioData.map((p: any) => ({
      ...p,
      seleccion: mercadoMap.get(p.seleccion_id)!,
    }));

    // Ordenar por fecha_obtencion (más recientes primero)
    cartasCompletas.sort((a, b) => new Date(b.fecha_obtencion).getTime() - new Date(a.fecha_obtencion).getTime());

    setCartas(cartasCompletas);
    setLoading(false);

    // Check if new user (5 cartas && created < 60 seconds ago)
    if (cartasCompletas.length === 5) {
      const { data: userData } = await supabase
        .from("usuarios")
        .select("created_at")
        .eq("id", userId)
        .single();

      if (userData) {
        const createdAt = new Date(userData.created_at).getTime();
        const now = Date.now();
        if (now - createdAt < 60000) {
          setIsNewUser(true);
          setShowBanner(true);
          setTimeout(() => setShowBanner(false), 5000);
        }
      }
    }
  };

  useEffect(() => {
    fetchPortafolio();

    // Suscripción a cambios en portafolio y mercado
    const channel = supabase
      .channel("portafolio_mercado_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "portafolio", filter: `user_id=eq.${userId}` },
        () => fetchPortafolio()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mercado_selecciones" },
        () => fetchPortafolio()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const handleLiquidateSuccess = () => {
    fetchPortafolio();
  };

  return (
    <div className="py-12 px-5">
      {/* Banner de bienvenida para nuevos usuarios */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 mb-6 py-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-accent2">
              <path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
            <span className="font-mono text-xs uppercase tracking-widest text-accent2 font-medium">
              Paquete de Bienvenida · 5 Cartas
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <Eyebrow className="block mb-2">TU PORTAFOLIO</Eyebrow>
        <h2 className="font-display text-3xl font-semibold text-ink flex items-baseline gap-2">
          Activos en juego
          <span className="font-sans text-lg font-normal text-dim">({cartas.length})</span>
        </h2>
      </div>

      {cartas.length === 0 ? (
        <div className="bg-canvas border border-hair2 rounded-xl p-8 text-center text-dim font-sans">
          Aún no tienes cartas en tu portafolio. ¡Abre tu paquete de inicio arriba para empezar!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(() => {
            const sortedByValue = [...cartas].sort((a, b) => b.seleccion.valor_total - a.seleccion.valor_total);
            const top3Threshold = sortedByValue.length > 3 ? sortedByValue[2].seleccion.valor_total : 0;
            
            return cartas.map((carta, index) => {
              const isEstrella = cartas.length >= 3 && carta.seleccion.valor_total >= top3Threshold && !isNewUser;
              
              return (
                <motion.div
                  key={carta.id}
                  initial={isNewUser ? { scale: 0.8, opacity: 0, y: 20 } : false}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={
                    isNewUser
                      ? {
                          duration: 0.6,
                          delay: index * 0.2,
                          ease: [0.22, 1, 0.36, 1],
                        }
                      : undefined
                  }
                >
                  <CartaSeleccion 
                    carta={carta} 
                    onLiquidateSuccess={handleLiquidateSuccess}
                    isEstrella={isEstrella}
                  />
                </motion.div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
}
