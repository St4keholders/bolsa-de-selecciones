"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import BackgroundMundialista from "@/components/BackgroundMundialista";
import { PaniniMosaic } from "@/components/decorations/PaniniMosaic";
import { CintasMundialistas } from "@/components/decorations/CintasMundialistas";
import { LogoMundial } from "@/components/icons/LogoMundial";

import { IconEnvelope } from "@/components/icons/IconEnvelope";
import { IconChart } from "@/components/icons/IconChart";
import { IconCashOut } from "@/components/icons/IconCashOut";
import { IconArrow } from "@/components/icons/IconArrow";
import { IconSpark as IconCreacion } from "@/components/icons/IconSpark";
import { IconShield as IconMuralla } from "@/components/icons/IconShield";
import { IconEye as IconReflejos } from "@/components/icons/IconEye";
import { IconBall as IconPosesion } from "@/components/icons/IconBall";
import { IconEficiencia } from "@/components/icons/IconEficiencia";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Hairline } from "@/components/ui/Hairline";
import { ChevronDown } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── SECCIÓN 1: HERO ────────────────────────────────────────── */
function HeroSection() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) setHasSession(true);
    };
    checkSession();
  }, []);

  return (
    <section className="relative min-h-[80vh] md:min-h-screen flex flex-col items-center justify-center px-5 py-12 md:py-20 overflow-hidden">
      {/* Fondo Panini (esquinas dinámicas) */}
      <div className="absolute inset-0 z-0">
        <BackgroundMundialista />
      </div>

      {/* Eliminado PaniniMosaic hero-center a petición del usuario para mantener el centro completamente limpio */}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center max-w-[680px] space-y-4 md:space-y-8"
      >
        <motion.div variants={fadeInUp}>
          <LogoMundial size={80} />
        </motion.div>

        <motion.div variants={fadeInUp} className="relative w-full">
          {/* SVG decorativo (bola gris) ha sido eliminado para mantener la pantalla 100% limpia */}
          <h1 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.04em] text-ink relative z-10">
            La Bolsa de Selecciones
          </h1>
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className="font-sans font-light text-dim max-w-xs md:max-w-prose text-sm md:text-lg leading-relaxed"
        >
          Colecciona selecciones del Mundial 2026, observa cómo sus
          estadísticas suben y bajan con cada partido, y liquida en el
          momento exacto para acumular puntos.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 md:gap-4">
          {hasSession ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-[var(--color-panini-blue)] text-white font-mono uppercase tracking-widest font-bold py-4 px-8 md:py-5 md:px-10 text-base md:text-lg shadow-panini hover:shadow-panini-hover rounded-md transition-all"
            >
              IR A MI DASHBOARD
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-[var(--color-panini-blue)] text-white font-mono uppercase tracking-widest font-bold py-3 px-6 md:py-4 md:px-8 text-sm md:text-base shadow-panini hover:shadow-panini-hover rounded-md transition-all"
              >
                Empezar a jugar
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-white text-ink border border-hair2 font-mono uppercase tracking-widest font-bold py-3 px-6 md:py-4 md:px-8 text-sm md:text-base shadow-sm hover:shadow-md rounded-md transition-all"
              >
                Ya tengo cuenta
              </Link>
            </>
          )}
        </motion.div>

        <motion.div variants={fadeInUp} className="flex flex-col items-center gap-2">
          <span className="font-mono text-[var(--color-mundial-teal)] text-xs uppercase tracking-widest font-semibold">↓ Aprende cómo funciona</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-[var(--color-mundial-teal)]" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── SECCIÓN 2: CÓMO FUNCIONA ───────────────────────────────── */
const steps = [
  {
    icon: IconEnvelope,
    iconColor: "text-[var(--color-mundial-blue)]",
    title: "Recibe tu paquete",
    desc: "Al registrarte te regalamos 5 cartas de selecciones del Mundial. Cada día puedes abrir 1 sobre nuevo.",
    bg: "bg-canvas"
  },
  {
    icon: IconChart,
    iconColor: "text-[var(--color-mundial-teal)]",
    title: "Observa el mercado",
    desc: "Cada selección tiene 6 estadísticas que suben y bajan según sus resultados reales en el torneo.",
    bg: "bg-canvas"
  },
  {
    icon: IconCashOut,
    iconColor: "text-[var(--color-mundial-lime)]",
    title: "Liquida y gana",
    desc: "Cuando creas que una selección está en su mejor momento, liquídala para sumar puntos permanentes.",
    bg: "bg-gradient-to-b from-canvas to-[var(--color-mundial-lime)]/10"
  },
];

function HowItWorksSection() {
  return (
    <section className="py-24 px-5 bg-canvas relative">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-[1080px] mx-auto relative z-10"
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <Eyebrow className="block mb-4">EN 3 PASOS</Eyebrow>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink">
            Es como la bolsa, pero del Mundial
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className={`bg-white rounded-xl border border-hair2 p-8 flex flex-col items-center text-center shadow-sm hover:shadow-panini transition-all duration-300 relative overflow-hidden`}
            >
              <div className="absolute top-4 left-4 font-display font-bold text-4xl text-[var(--color-panini-orange)] opacity-10">{i + 1}</div>
              <step.icon className={`w-24 h-24 mb-6 relative z-10 ${step.iconColor}`} />
              <h3 className="font-display font-semibold text-xl text-ink mb-3 relative z-10">{step.title}</h3>
              <p className="font-sans text-dim leading-relaxed relative z-10">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ─── SECCIÓN 3: LAS 6 ESTADÍSTICAS ─────────────────────────── */
const stats = [
  { icon: IconArrow, iconColor: "text-[var(--color-mundial-red)]", name: "Ataque", desc: "Sube por cada gol anotado. Baja si la selección se va en blanco." },
  { icon: IconCreacion, iconColor: "text-[var(--color-mundial-orange)]", name: "Creación", desc: "Depende de la posesión del balón. Más control, más creación." },
  { icon: IconMuralla, iconColor: "text-[var(--color-mundial-blue)]", name: "Muralla", desc: "Premia las vallas en cero. Castiga los goles recibidos." },
  { icon: IconReflejos, iconColor: "text-[var(--color-mundial-purple)]", name: "Reflejos", desc: "+10 por victoria, +3 por empate, -5 por derrota. La forma del momento." },
  { icon: IconPosesion, iconColor: "text-[var(--color-mundial-teal)]", name: "Posesión", desc: "Media móvil del control del balón en sus últimos partidos." },
  { icon: IconEficiencia, iconColor: "text-[var(--color-mundial-lime)]", name: "Eficiencia", desc: "El % de tiros que terminaron en gol. Premia la puntería, castiga la falta de definición." },
];

function StatsSection() {
  return (
    <section className="py-24 px-5 relative overflow-hidden bg-canvas">
      {/* Fondo radial lavanda */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, rgba(181, 168, 217, 0.08) 0%, rgba(255, 255, 255, 0) 70%)"
        }}
      />
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-[1080px] mx-auto relative z-10"
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <Eyebrow className="block mb-4">CADA CARTA, 6 MÉTRICAS</Eyebrow>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink">
            El valor está en los detalles
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="bg-white rounded-xl border border-hair2 p-6 shadow-sm flex gap-4 items-start transition-all hover:-translate-y-1 hover:shadow-panini"
            >
              <stat.icon className={`w-8 h-8 flex-shrink-0 mt-1 ${stat.iconColor}`} />
              <div>
                <h3 className="font-display font-semibold text-lg text-ink mb-1">{stat.name}</h3>
                <p className="font-sans text-dim text-sm leading-relaxed">{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ─── SECCIÓN 4: CÓMO SE MUEVEN LOS PRECIOS ─────────────────── */
function PricingSection() {
  return (
    <section className="py-24 px-5 bg-raise/50 relative z-10">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-[720px] mx-auto relative z-20"
      >
        <motion.div variants={fadeInUp} className="mb-12">
          <Eyebrow className="block mb-4">EL MERCADO ES EL MUNDIAL</Eyebrow>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink mb-6">
            Los resultados deciden el valor
          </h2>
          <p className="font-sans text-dim leading-relaxed text-lg">
            No hay especulación misteriosa. Cada vez que se juega un partido
            del Mundial, las estadísticas de las dos selecciones se actualizan
            automáticamente según el marcador, la posesión, los goles, la eficiencia
            y el resultado. El admin solo registra lo que pasó en
            la cancha — el resto es matemática transparente.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-hair2 p-6 md:p-8 shadow-panini">
          <Eyebrow className="block mb-6">EJEMPLO · <span className="text-[#75AADB]">Argentina</span> 3 - 1 <span className="text-[#006233]">Argelia</span></Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 font-sans text-sm">
            {/* Argentina */}
            <div>
              <div className="font-display font-semibold text-ink text-base mb-3 border-b border-hair2 pb-2">Argentina (gana)</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="text-dim">Ataque</span><span className="font-mono bg-[var(--color-mundial-lime)] text-ink px-2 py-0.5 font-bold">+24</span></div>
                <div className="flex justify-between items-center"><span className="text-dim">Reflejos</span><span className="font-mono bg-[var(--color-mundial-lime)] text-ink px-2 py-0.5 font-bold">+10</span></div>
                <div className="flex justify-between items-center"><span className="text-dim">Muralla</span><span className="font-mono bg-[var(--color-mundial-red)] text-white px-2 py-0.5 font-bold">-5</span></div>
                <div className="flex justify-between items-center"><span className="text-dim">Creación</span><span className="font-mono bg-[var(--color-mundial-lime)] text-ink px-2 py-0.5 font-bold">+7</span></div>
                <div className="flex justify-between items-center"><span className="text-dim">Posesión</span><span className="font-mono bg-[var(--color-mundial-lime)] text-ink px-2 py-0.5 font-bold">+5</span></div>
              </div>
              <Hairline className="my-3" />
              <div className="flex justify-between font-display font-bold text-ink">
                <span>Total</span><span className="text-[var(--color-mundial-blue)]">+41 pts</span>
              </div>
            </div>
            {/* Argelia */}
            <div>
              <div className="font-display font-semibold text-ink text-base mb-3 border-b border-hair2 pb-2">Argelia (pierde)</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="text-dim">Ataque</span><span className="font-mono bg-[var(--color-mundial-lime)] text-ink px-2 py-0.5 font-bold">+8</span></div>
                <div className="flex justify-between items-center"><span className="text-dim">Reflejos</span><span className="font-mono bg-[var(--color-mundial-red)] text-white px-2 py-0.5 font-bold">-5</span></div>
                <div className="flex justify-between items-center"><span className="text-dim">Muralla</span><span className="font-mono bg-[var(--color-mundial-red)] text-white px-2 py-0.5 font-bold">-15</span></div>
                <div className="flex justify-between items-center"><span className="text-dim">Creación</span><span className="font-mono bg-[var(--color-mundial-red)] text-white px-2 py-0.5 font-bold">-3</span></div>
                <div className="flex justify-between items-center"><span className="text-dim">Posesión</span><span className="font-mono bg-[var(--color-mundial-lime)] text-ink px-2 py-0.5 font-bold">+2</span></div>
              </div>
              <Hairline className="my-3" />
              <div className="flex justify-between font-display font-bold text-ink">
                <span>Total</span><span className="text-ink">-13 pts</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── SECCIÓN 5: RIESGO Y RECOMPENSA ────────────────────────── */
function RiskSection() {
  return (
    <section className="py-24 px-5 bg-canvas relative z-10">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-[1080px] mx-auto relative z-20"
      >
        <motion.div variants={fadeInUp} className="mb-12">
          <Eyebrow className="flex items-center gap-2 mb-4 text-[var(--color-mundial-red)]">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            ATENCIÓN
          </Eyebrow>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink">
            Cuidado con la quiebra
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeInUp}>
            <p className="font-sans text-dim leading-relaxed text-lg">
              Si una selección queda eliminada del torneo, declaramos su
              quiebra: sus estadísticas caen a cero permanentemente y las
              cartas de esa selección no pueden ser liquidadas. Por eso el
              timing importa: liquida antes de que tu selección se vaya a
              casa, o aprovecha cuando esté en su mejor racha.
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center justify-center">
            <div className="w-[240px] aspect-[3/4] bg-white rounded-xl border border-hair2 shadow-panini grayscale opacity-70 flex flex-col items-center justify-center relative p-6 overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-20 h-20 text-[#6B6B6B] mb-4 relative z-10">
                <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontWeight="700" fontSize="36">XXX</text>
              </svg>
              <div className="font-display font-semibold text-[#6B6B6B] text-lg mb-2 relative z-10">Selección</div>
              <div className="font-display font-bold text-3xl text-[#A8A8A8] relative z-10">0 PTS</div>
              
              {/* Gran X roja encima */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 mix-blend-multiply">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--color-mundial-red)] opacity-80" stroke="currentColor" strokeWidth="8" strokeLinecap="round">
                  <path d="M20,20 L80,80 M80,20 L20,80" />
                </svg>
              </div>

              <div className="absolute inset-0 flex items-center justify-center z-30">
                <span className="font-mono bg-[var(--color-mundial-red)] text-white px-3 py-1.5 font-bold text-sm tracking-widest rotate-[-12deg] shadow-lg">
                  EN QUIEBRA
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── SECCIÓN 6: CTA FINAL ───────────────────────────────────── */
function CtaSection() {
  return (
    <section className="relative py-32 px-5 text-white overflow-hidden bg-[var(--color-panini-navy)] z-20">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="relative z-10 max-w-[680px] mx-auto text-center flex flex-col items-center"
      >
        <motion.div variants={fadeInUp} className="mb-6">
          <LogoMundial size={60} className="filter brightness-0 invert" />
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <Eyebrow className="block mb-6 text-dim2">EL MUNDIAL ESTÁ EMPEZANDO</Eyebrow>
        </motion.div>
        
        <motion.h2
          variants={fadeInUp}
          className="font-display font-bold text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.04em] mb-4"
        >
          <span className="text-canvas">Recibe </span>
          <span className="text-[var(--color-mundial-lime)]">tus 5 cartas </span>
          <span className="text-canvas border-b-4 border-[var(--color-mundial-orange)] pb-1">ahora</span>
        </motion.h2>
        
        <motion.p variants={fadeInUp} className="font-sans font-light text-white/80 text-lg mb-10">
          Gratis. Sin tarjeta. Solo email.
        </motion.p>
        
        <motion.div variants={fadeInUp}>
          <Link
            href="/register"
            className="inline-flex items-center justify-center bg-[var(--color-panini-mint)] text-ink font-mono uppercase tracking-widest font-bold py-5 px-12 text-lg shadow-panini hover:shadow-panini-hover transition-all rounded-md"
          >
            Registrarme gratis
          </Link>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="mt-6">
          <Link href="/login" className="font-mono text-white/60 hover:text-white text-xs uppercase tracking-widest transition-colors">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── TRANSICIONES VISUALES ENTRE SECCIONES ──────────────────── */
function Transition1To2() {
  return <div className="h-[40px] w-full" />;
}

function Transition2To3() {
  return <div className="h-[40px] w-full" />;
}

function Transition3To4() {
  return <div className="h-[40px] w-full" />;
}

function Transition4To5() {
  return <div className="h-[40px] w-full" />;
}

function Transition5To6() {
  return <div className="h-[80px] w-full" />;
}

/* ─── EXPORT ─────────────────────────────────────────────────── */
export function LandingPage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <Transition1To2 />
      <HowItWorksSection />
      <Transition2To3 />
      <StatsSection />
      <Transition3To4 />
      <PricingSection />
      <Transition4To5 />
      <RiskSection />
      <Transition5To6 />
      <CtaSection />
    </div>
  );
}
