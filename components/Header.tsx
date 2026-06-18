"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eyebrow } from "./ui/Eyebrow";
import { Hairline } from "./ui/Hairline";
import { LogoutButton } from "./LogoutButton";

interface HeaderProps {
  userId: string;
}

export function Header({ userId }: HeaderProps) {
  const [nombre, setNombre] = useState<string>("Usuario");
  const [puntos, setPuntos] = useState<number>(0);
  const [ranking, setRanking] = useState<number>(0);
  const supabase = createClient();

  const fetchUserDataAndRanking = async () => {
    // Obtener datos del usuario
    const { data: user } = await supabase
      .from("usuarios")
      .select("nombre, puntos_permanentes")
      .eq("id", userId)
      .single();

    if (user) {
      setNombre(user.nombre);
      setPuntos(user.puntos_permanentes);
    }

    // Obtener ranking global (usuarios ordenados por puntos)
    const { data: allUsers } = await supabase
      .from("usuarios")
      .select("id, puntos_permanentes")
      .order("puntos_permanentes", { ascending: false });

    if (allUsers) {
      const rankIndex = allUsers.findIndex((u) => u.id === userId);
      setRanking(rankIndex !== -1 ? rankIndex + 1 : 0);
    }
  };

  useEffect(() => {
    fetchUserDataAndRanking();

    // Suscripción a cambios en tiempo real
    const subscription = supabase
      .channel("usuarios_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "usuarios",
        },
        () => {
          // Refrescar cuando cambien los usuarios (puede afectar puntos o ranking)
          fetchUserDataAndRanking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, supabase]);

  return (
    <div className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-sm pt-4 pb-4 px-5 relative">
      <div className="absolute top-4 right-4 z-50">
        <LogoutButton />
      </div>
      <div className="flex flex-col items-center gap-1 relative z-10">
        <Eyebrow className="text-[var(--color-mundial-blue)]">LA BOLSA DE SELECCIONES</Eyebrow>
        <span className="font-sans font-normal text-dim">Hola, {nombre}</span>
        
        <div className="mt-2 text-center">
          <div className={`font-display font-bold text-ink text-[clamp(3rem,12vw,5rem)] leading-none tracking-[-0.04em] ${puntos > 0 ? 'drop-shadow-[0_4px_12px_rgba(255,107,0,0.4)] relative inline-block' : ''}`}>
            {puntos.toLocaleString("es-CO")}
            {puntos > 0 && <div className="absolute -bottom-2 left-0 w-full h-[4px] bg-[var(--color-mundial-orange)] rounded-full" />}
          </div>
          <Eyebrow className="block mt-4">PUNTOS PERMANENTES</Eyebrow>
        </div>

        <div className="mt-4 border border-[var(--color-mundial-blue)] rounded-full px-3 py-1 bg-[var(--color-mundial-lime)]">
          <span className="font-mono text-sm uppercase tracking-widest font-bold text-ink">
            #{ranking} GLOBAL
          </span>
        </div>
      </div>
      <Hairline className="absolute bottom-0 left-0" />
    </div>
  );
}
