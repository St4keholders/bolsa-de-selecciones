"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { CartaConSeleccion } from "@/lib/types";
import { COUNTRIES, CountryTheme } from "@/lib/countries";
import { IconEnvelope } from "./icons/IconEnvelope";
import { Button } from "./ui/Button";
import { Eyebrow } from "./ui/Eyebrow";
import { CartaSeleccion } from "./CartaSeleccion";
import { CintasMundialistas } from "./decorations/CintasMundialistas";

export function SobreDiario() {
  const supabase = createClient();
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [nextAvailable, setNextAvailable] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>("");
  const [animationPhase, setAnimationPhase] = useState<number>(0);
  const [revealedCarta, setRevealedCarta] = useState<CartaConSeleccion | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryTheme | null>(null);

  useEffect(() => {
    const fetchCooldown = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('portafolio')
        .select('fecha_obtencion')
        .eq('user_id', user.id)
        .order('fecha_obtencion', { ascending: false })
        .limit(1);
        
      if (data && data.length > 0) {
        const lastDate = new Date(data[0].fecha_obtencion);
        const nextDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
        if (nextDate > new Date()) {
          setIsAvailable(false);
          setNextAvailable(nextDate);
        }
      }
    };
    
    fetchCooldown();
  }, [supabase]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isAvailable && nextAvailable) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = nextAvailable.getTime() - now;

        if (distance < 0) {
          clearInterval(interval);
          setIsAvailable(true);
          setNextAvailable(null);
          setCountdown("");
        } else {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setCountdown(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAvailable, nextAvailable]);

  const handleOpen = async () => {
    if (!isAvailable) return;

    // Call RPC
    const { data, error } = await supabase.rpc('abrir_sobre_diario');

    if (error || !data.success) {
      if (data?.error === 'cooldown') {
        setIsAvailable(false);
        setNextAvailable(new Date(data.proximo_disponible));
      }
      return;
    }

    const country = COUNTRIES[data.seleccion_id];
    
    // Obtenemos los detalles de la selección recién obtenida desde la base de datos
    const { data: seleccionData } = await supabase
      .from('mercado_selecciones')
      .select('*')
      .eq('id', data.seleccion_id)
      .single();

    if (seleccionData) {
      setRevealedCarta({
        id: data.carta_id || Math.random().toString(), // Fallback en caso de que la RPC no retorne ID de carta
        user_id: '',
        seleccion_id: data.seleccion_id,
        estado_carta: 'activa',
        fecha_obtencion: new Date().toISOString(),
        seleccion: seleccionData
      });
    }
    
    setSelectedCountry(country);
    setIsAvailable(false);
    setNextAvailable(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));

    // Animation Sequence
    setAnimationPhase(1); // Vibrates and scales
    
    setTimeout(() => {
      setAnimationPhase(2); // Light ray, gradient bg
    }, 800);

    setTimeout(() => {
      setAnimationPhase(3); // Envelope breaks, card appears (completa)
    }, 1400);

    setTimeout(() => {
      setAnimationPhase(4); // Button appears
    }, 2500); // Darle tiempo a la animación de conteo de valor_total (800ms)
  };

  const handleCloseAnimation = () => {
    setAnimationPhase(0);
    setRevealedCarta(null);
    setSelectedCountry(null);
  };

  if (animationPhase > 0 && selectedCountry && revealedCarta) {
    return (
      <div className="relative flex flex-col items-center justify-center py-16 min-h-[400px]">
        {/* Background gradient full from country */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: animationPhase >= 2 ? 0.25 : 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-0"
          style={{ background: selectedCountry.gradientFull }}
        />
        
        <div className="z-10 relative flex flex-col items-center justify-center">
          
          <AnimatePresence>
            {(animationPhase === 2 || animationPhase === 3) && (
              <motion.div
                initial={{ scale: 0, rotate: -20, opacity: 1 }}
                animate={{ scale: 1, rotate: 0, opacity: animationPhase === 3 ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              >
                <div className="w-[500px] h-[500px]">
                  <CintasMundialistas variant="radial" animated={true} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {animationPhase < 3 ? (
            <motion.div
              animate={{ 
                scale: animationPhase === 1 ? 1.05 : 1.1,
                rotate: animationPhase === 1 ? [-2, 2, -2, 2, 0] : 0
              }}
              transition={{ duration: 0.8 }}
            >
              <IconEnvelope className="w-32 h-32 text-ink" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, rotate: -8, y: 50, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              className="w-64 max-w-[90vw] relative"
            >
              <CartaSeleccion carta={revealedCarta} isReveal={true} />
              
              {/* Animación de corner que se transforma en trofeo */}
              {animationPhase === 3 && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="absolute -top-10 -right-10 w-[150px] h-[150px] pointer-events-none z-20"
                >
                  <CintasMundialistas variant="corner" />
                </motion.div>
              )}
            </motion.div>
          )}

          <AnimatePresence>
            {animationPhase === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Button variant="custom" onClick={handleCloseAnimation} className="bg-cta text-ink py-4 px-6">
                  GUARDAR EN PORTAFOLIO
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className={`transition-opacity duration-300 ${isAvailable ? 'opacity-100' : 'opacity-40'}`}>
        <IconEnvelope className="w-24 h-24 text-ink mx-auto mb-6" />
      </div>
      
      {isAvailable ? (
        <>
          <h2 className="font-display text-3xl font-semibold text-ink mb-2">Sobre disponible</h2>
          <Eyebrow className="mb-8 block">ABRIR PARA REVELAR</Eyebrow>
          <Button variant="custom" onClick={handleOpen} className="text-xl py-5 px-10 bg-primary text-canvas">
            ABRIR SOBRE
          </Button>
        </>
      ) : (
        <>
          <Eyebrow className="mb-4 block">PRÓXIMO SOBRE EN</Eyebrow>
          <div className="font-mono font-medium text-[clamp(2.5rem,8vw,4rem)] tracking-wide text-ink mb-8">
            {countdown || "00:00:00"}
          </div>
          <Button variant="custom" disabled className="text-xl py-5 px-10 bg-raise text-dim border border-hair2">
            ABRIR SOBRE
          </Button>
        </>
      )}
    </div>
  );
}
