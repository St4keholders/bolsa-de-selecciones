"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartaConSeleccion } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";
import { createClient } from "@/lib/supabase/client";
import { Eyebrow } from "./ui/Eyebrow";
import { Button } from "./ui/Button";
import { Hairline } from "./ui/Hairline";
import { IconArrow } from "./icons/IconArrow";
import { IconSpark as IconCreacion } from "./icons/IconSpark";
import { IconShield as IconMuralla } from "./icons/IconShield";
import { IconEye as IconReflejos } from "./icons/IconEye";
import { IconBall as IconPosesion } from "./icons/IconBall";
import { IconEficiencia } from "./icons/IconEficiencia";
import { CountrySvg } from "./icons/countries/CountrySvg";
import { Trofeo } from "./icons/Trofeo";
import { getTier, tierConfig } from "@/lib/cardTiers";

function ArcosESPN() {
  const coloresIzq = ["#1C68D5", "#009966", "#FCD20F", "#D3202E"];
  const coloresDer = ["#D3202E", "#1C68D5", "#009966", "#7F4EB3"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Lado izquierdo */}
      {coloresIzq.map((color, i) => (
        <div 
          key={`izq-${i}`}
          className="absolute top-1/2 -translate-y-1/2 rounded-[50%]"
          style={{
            left: `-${60 - (i * 15)}%`,
            width: '120%',
            height: `${140 - (i * 20)}%`,
            border: `12px solid ${color}`
          }}
        />
      ))}
      {/* Lado derecho */}
      {coloresDer.map((color, i) => (
        <div 
          key={`der-${i}`}
          className="absolute top-1/2 -translate-y-1/2 rounded-[50%]"
          style={{
            right: `-${60 - (i * 15)}%`,
            width: '120%',
            height: `${140 - (i * 20)}%`,
            border: `12px solid ${color}`
          }}
        />
      ))}
    </div>
  );
}

interface CartaSeleccionProps {
  carta: CartaConSeleccion;
  onLiquidateSuccess?: (puntos: number) => void;
  isReveal?: boolean;
  isEstrella?: boolean;
}

function Stat({ icon: Icon, label, value, isQuiebra }: { icon: any, label: string, value: number, isQuiebra: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3 text-dim2" />
        <Eyebrow className="text-[10px] text-dim">{label}</Eyebrow>
      </div>
      <span className="font-display font-bold text-ink text-[1.1rem]">
        {isQuiebra ? 0 : value}
      </span>
    </div>
  );
}

function AnimatedValue({ value, isQuiebra, isReveal }: { value: number, isQuiebra: boolean, isReveal: boolean }) {
  const [displayValue, setDisplayValue] = useState(isReveal ? 0 : value);

  useEffect(() => {
    if (isReveal) {
      const timeout = setTimeout(() => {
        let start = 0;
        const duration = 800;
        const stepTime = Math.abs(Math.floor(duration / 30));
        const increment = value / 30;
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= value) {
            setDisplayValue(value);
            clearInterval(timer);
          } else {
            setDisplayValue(Math.floor(start));
          }
        }, stepTime);

        return () => clearInterval(timer);
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setDisplayValue(value);
    }
  }, [value, isReveal]);

  return (
    <span className={`font-display font-bold text-3xl mt-1 mb-2 leading-none tracking-tighter ${isQuiebra ? 'text-dim' : 'text-ink'}`}>
      {displayValue.toLocaleString("es-CO")} {isQuiebra && <span className="text-sm">PTS</span>}
    </span>
  );
}

export function CartaSeleccion({ carta, onLiquidateSuccess, isReveal = false, isEstrella = false }: CartaSeleccionProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLiquidating, setIsLiquidating] = useState(false);
  const [isLiquidated, setIsLiquidated] = useState(false);
  
  const [prevVal, setPrevVal] = useState(carta.seleccion.valor_total);
  const [delta, setDelta] = useState<number | null>(null);

  const supabase = createClient();
  const countryTheme = COUNTRIES[carta.seleccion_id];
  const isQuiebra = carta.seleccion.estado === 'eliminado';
  const val = isQuiebra ? 0 : carta.seleccion.valor_total;
  
  const tierName = getTier(val);
  const tier = tierConfig[tierName];

  useEffect(() => {
    if (val !== prevVal && prevVal !== undefined && !isQuiebra) {
      const d = val - prevVal;
      setDelta(d);
      setPrevVal(val);
      const timer = setTimeout(() => setDelta(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [val, prevVal, isQuiebra]);

  const handleLiquidate = async () => {
    setIsLiquidating(true);
    const { data, error } = await supabase.rpc('liquidar_carta', { carta_id: carta.id });
    
    if (!error && data?.success) {
      setIsLiquidated(true);
      if (onLiquidateSuccess) {
        setTimeout(() => {
          onLiquidateSuccess(data.puntos_ganados);
        }, 800);
      }
    }
    setIsLiquidating(false);
    setShowModal(false);
  };

  if (isLiquidated) {
    return (
      <motion.div
        initial={{ scale: 1, opacity: 1, y: 0 }}
        animate={{ scale: 1.1, opacity: 0, y: -50 }}
        transition={{ duration: 0.8 }}
        className="text-center font-display text-2xl font-bold text-success flex items-center justify-center min-h-[300px]"
      >
        + {val.toLocaleString("es-CO")} PUNTOS
      </motion.div>
    );
  }

  // Las cartas Oro tienen el fondo de mosaico complejo.
  // Plata y Bronce pueden tener solo el borde sólido o mosaico opacado para diferenciarse.
  const isGold = tierName === 'oro';

  return (
    <div className="relative group">
      <AnimatePresence>
        {delta !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            className={`absolute -top-10 left-1/2 -translate-x-1/2 font-display text-2xl font-bold z-30 shadow-panini ${delta > 0 ? 'text-success' : 'text-danger'}`}
          >
            <div className="bg-canvas px-3 py-1 border-[2px] border-ink rounded">
              {delta > 0 ? '+' : ''}{delta}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        layoutId={carta.id}
        className={`bg-canvas flex flex-col aspect-[3/4.2] relative transition-transform duration-300 hover:-translate-y-2 shadow-panini-hover overflow-hidden rounded-sm ${isQuiebra ? 'grayscale opacity-60' : ''}`}
      >
        {/* Capa 0: Cintas gruesas estilo ESPN en los bordes */}
        <div className="absolute inset-0 opacity-100">
          <ArcosESPN />
        </div>

        {/* Capa 1: El Marco Delgado de Tier que va ENCIMA del mosaico */}
        <div 
          className="absolute inset-[4px] border-[3px] z-[5] rounded-sm pointer-events-none"
          style={{
            borderColor: tierName === 'oro' ? '#FBBF24' : tierName === 'plata' ? '#9CA3AF' : '#B45309',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
          }}
        />

        {/* Capa 2: La placa blanca central masiva (El ancla) */}
        <div className="absolute inset-[10px] bg-canvas shadow-panini flex flex-col z-10 rounded-sm" />

        <div className="flex-1 flex flex-col z-20 px-5 pb-5 pt-3">
          
          <div className="flex justify-between items-start mb-2">
            <span className="font-mono text-xs tracking-widest font-bold text-dim2">
              {countryTheme?.codigo || 'XXX'}
            </span>
            {!isQuiebra && (
              <div style={{ color: tier.trophyColor }}>
                <Trofeo size={22} className={isEstrella ? 'drop-shadow-md' : 'opacity-80'} />
              </div>
            )}
          </div>

          {/* PAIS SVG */}
          <div className="flex flex-col items-center justify-center relative my-2 h-[80px]">
            <CountrySvg 
              countryCode={countryTheme?.codigo || 'XXX'} 
              svgArtType={countryTheme?.svgArt || 'Text'} 
              color={isQuiebra ? '#6B6B6B' : countryTheme?.colores?.primary}
              className="w-20 h-20"
            />
            {isQuiebra && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono bg-danger text-white px-3 py-1.5 font-bold text-sm tracking-widest rotate-[-12deg] shadow-panini">
                  EN QUIEBRA
                </span>
              </div>
            )}
          </div>

          <h3 className="font-display font-bold text-2xl leading-tight text-ink text-center mb-1 line-clamp-1 uppercase tracking-tight">
            {carta.seleccion.pais}
          </h3>

          <div className="flex justify-center mb-4">
            {!isQuiebra && (
              <span className={`font-mono text-[10px] tracking-widest px-2 py-0.5 rounded font-bold uppercase border ${tier.badgeBg} ${tier.badgeText} border-ink/10`}>
                {tier.label}
              </span>
            )}
          </div>

          <Hairline className="mb-2 border-ink/10" />

          {/* 6 Stats Grid */}
          <div className="grid grid-cols-3 gap-y-3 gap-x-1 mb-2">
            <Stat icon={IconArrow} label="ATAQ" value={carta.seleccion.ataque} isQuiebra={isQuiebra} />
            <Stat icon={IconCreacion} label="CREA" value={carta.seleccion.creacion} isQuiebra={isQuiebra} />
            <Stat icon={IconMuralla} label="MURA" value={carta.seleccion.muralla} isQuiebra={isQuiebra} />
            <Stat icon={IconReflejos} label="REFL" value={carta.seleccion.reflejos} isQuiebra={isQuiebra} />
            <Stat icon={IconPosesion} label="POSE" value={carta.seleccion.posesion} isQuiebra={isQuiebra} />
            <Stat icon={IconEficiencia} label="EFI" value={carta.seleccion.eficiencia} isQuiebra={isQuiebra} />
          </div>

          <Hairline className="mb-2 border-ink/10" />

          {/* Valor Total */}
          <div className="flex flex-col items-center justify-center mt-auto">
            <Eyebrow className="text-[10px]">VALOR TOTAL</Eyebrow>
            <AnimatedValue value={val} isQuiebra={isQuiebra} isReveal={isReveal} />
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          disabled={isQuiebra}
          className={`relative z-20 w-[calc(100%-20px)] mx-[10px] mb-[10px] py-3 font-mono uppercase tracking-widest text-xs font-bold transition-all rounded-sm ${
            isQuiebra 
              ? 'bg-raise text-dim cursor-not-allowed border border-hair2' 
              : 'bg-[var(--color-panini-blue)] text-white hover:bg-[var(--color-panini-navy)] hover:shadow-panini active:translate-y-[1px]'
          }`}
        >
          LIQUIDAR
        </button>
      </motion.div>

      <AnimatePresence>
        {showModal && !isQuiebra && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-canvas shadow-2xl p-8 max-w-md w-full relative overflow-hidden rounded-xl border border-hair2"
            >
              <div className="relative z-10">
                <h2 className="font-display text-2xl font-bold mb-4 text-ink">LIQUIDAR CARTA</h2>
                <p className="font-sans text-ink mb-8">
                  ¿Liquidar {carta.seleccion.pais} por <strong className="text-[var(--color-panini-forest)]">{val.toLocaleString("es-CO")} PTS</strong>? 
                  <br/><br/>Esta acción es permanente y la carta desaparecerá.
                </p>
                
                <div className="flex gap-4">
                  <Button 
                    variant="ghost" 
                    fullWidth 
                    onClick={() => setShowModal(false)}
                    disabled={isLiquidating}
                    className="font-bold font-mono tracking-widest hover:bg-raise"
                  >
                    CANCELAR
                  </Button>
                  <Button 
                    fullWidth 
                    onClick={handleLiquidate}
                    disabled={isLiquidating}
                    className="bg-[var(--color-panini-red)] text-white font-bold font-mono tracking-widest hover:bg-[var(--color-panini-red-dark)]"
                  >
                    {isLiquidating ? 'LIQUIDANDO' : 'CONFIRMAR'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
