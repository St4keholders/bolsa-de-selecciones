"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { motion } from "framer-motion";
import { LogoMundial } from "@/components/icons/LogoMundial";
import { Partner } from "@/lib/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPartnerStep, setShowPartnerStep] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
        },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setShowPartnerStep(true);
      setIsLoading(false);
    }
  };

  // Fetch active partners
  const { data: partners = [] } = useSWR(
    showPartnerStep ? "partners-activos-register" : null,
    async () => {
      const { data } = await supabase
        .from("partners")
        .select("*")
        .eq("activo", true)
        .order("created_at", { ascending: false });
      return (data as Partner[]) || [];
    }
  );

  const handleSelectPartner = async (partner: Partner) => {
    setIsSubmittingPartner(true);
    const { error } = await supabase.rpc("seleccionar_partner", {
      partner_id_param: partner.id,
    });
    setIsSubmittingPartner(false);
    if (!error) {
      setSelectedPartner(partner);
      setShowPartnerStep(false);
      setShowWelcome(true);
    } else {
      console.error(error);
      // Falla silenciosa y avanza de todos modos en caso de error para no bloquear el onboarding
      setShowPartnerStep(false);
      setShowWelcome(true);
    }
  };

  const handleSkipPartner = () => {
    setShowPartnerStep(false);
    setShowWelcome(true);
  };

  if (showWelcome) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-canvas">
        <motion.div
          className="flex flex-col items-center text-center max-w-[480px]"
          initial="hidden"
          animate="visible"
        >
          <motion.div custom={0} variants={fadeInUp}>
            <Eyebrow className="block mb-6">LA BOLSA DE SELECCIONES</Eyebrow>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeInUp}
            className="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink mb-4"
          >
            Tu paquete de inicio te espera
          </motion.h1>

          <motion.div custom={2} variants={fadeInUp} className="font-sans font-light text-dim text-lg mb-10 leading-relaxed">
            Te regalamos 5 cartas para que empieces a jugar de una vez.
            Tu primer sobre diario estará disponible en 24 horas.
            {selectedPartner && (
              <div className="mt-6 p-4 border border-[var(--color-panini-mustard)]/30 bg-[var(--color-panini-mustard)]/10 rounded-lg text-sm text-ink">
                <strong>Patrocinador elegido:</strong> {selectedPartner.nombre} · <strong>Compites por:</strong> {selectedPartner.premio_titulo}
              </div>
            )}
          </motion.div>

          <motion.div custom={3} variants={fadeInUp}>
            <Button
              variant="custom"
              onClick={() => {
                router.push("/dashboard");
                router.refresh();
              }}
              className="bg-cta text-ink py-5 px-12 text-lg"
            >
              Entrar al Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (showPartnerStep) {
    return (
      <div className="flex min-h-screen flex-col items-center py-12 px-6 bg-canvas w-full">
        <motion.div
          className="flex flex-col items-center text-center w-full max-w-[800px]"
          initial="hidden"
          animate="visible"
        >
          <motion.div custom={0} variants={fadeInUp}>
            <Eyebrow className="block mb-6 text-[var(--color-panini-mint)]">PASO 2 DE 2 (OPCIONAL)</Eyebrow>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeInUp}
            className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink mb-4"
          >
            ¿Quieres elegir un patrocinador?
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeInUp}
            className="font-sans font-light text-dim text-base md:text-lg mb-10 leading-relaxed max-w-2xl"
          >
            Los patrocinadores son empresas que ofrecen premios a los jugadores. 
            Si eliges uno, competirás por el premio que ofrece. 
            Puedes saltarte este paso y elegir más tarde en el dashboard.
          </motion.p>

          <motion.div custom={3} variants={fadeInUp} className="w-full flex flex-col items-center">
            {partners.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
                {partners.map(p => (
                  <div key={p.id} className="border border-hair2 rounded-xl p-4 text-left flex flex-col bg-raise hover:border-ink transition-colors cursor-pointer group" onClick={() => !isSubmittingPartner && handleSelectPartner(p)}>
                    <div className="flex items-center gap-3 mb-3">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt={p.nombre} className="w-10 h-10 rounded object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded flex items-center justify-center text-white font-display font-bold" style={{ backgroundColor: p.color_brand }}>
                          {p.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-display font-bold text-lg">{p.nombre}</span>
                    </div>
                    <div className="font-mono text-[0.65rem] uppercase tracking-widest text-dim mb-1" style={{ color: p.color_brand }}>🏆 {p.premio_titulo}</div>
                    <div className="text-sm text-dim">{p.premio_descripcion}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-dim mb-8">Cargando patrocinadores disponibles...</div>
            )}

            <Button
              variant="ghost"
              onClick={handleSkipPartner}
              disabled={isSubmittingPartner}
              className="text-dim hover:text-ink"
            >
              ELEGIR MÁS TARDE
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-canvas relative">
      {/* ← VOLVER */}
      <Link
        href="/"
        className="absolute top-6 left-6 font-mono text-dim hover:text-ink text-xs uppercase tracking-widest transition-colors"
      >
        ← Volver
      </Link>

      <div className="w-full max-w-[400px] flex flex-col mt-12">
        <div className="mb-10 text-center flex flex-col items-center">
          <LogoMundial size={80} className="mb-6" />
          <h1 className="text-display font-display text-4xl font-semibold tracking-tight text-ink">
            Crea tu cuenta
          </h1>
          <p className="font-sans text-dim text-sm mt-2">Te regalamos 5 cartas para empezar.</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-8">
          <Input
            label="Nombre Completo"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Juan Pérez"
            required
          />

          <Input
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan@ejemplo.com"
            required
          />
          
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="mt-4 flex flex-col gap-4">
            {error && (
              <div className="border-l-2 border-danger pl-3 text-danger font-sans text-sm">
                {error}
              </div>
            )}
            
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear cuenta"}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="font-mono text-dim hover:text-ink text-sm uppercase tracking-widest transition-colors">
            Ya tengo cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
