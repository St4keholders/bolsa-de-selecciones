"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { Partner } from "@/lib/types";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Hairline } from "@/components/ui/Hairline";
import { ArrowLeft, Trophy, AlertTriangle, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ElegirPartnerPage() {
  const router = useRouter();
  const supabase = createClient();

  // Check if user already has a partner
  const [checking, setChecking] = useState(true);
  const [hasPartner, setHasPartner] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Selection state
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successPartner, setSuccessPartner] = useState<Partner | null>(null);

  // Check protection: redirect if already has partner
  useEffect(() => {
    const checkPartner = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("usuarios")
        .select("partner_id")
        .eq("id", user.id)
        .single();

      if (data?.partner_id) {
        setHasPartner(true);
        setToastMsg("Ya tienes un partner asignado");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
      setChecking(false);
    };
    checkPartner();
  }, [supabase, router]);

  // Fetch active partners with SWR
  const { data: partners = [], mutate } = useSWR(
    checking || hasPartner ? null : "partners-activos",
    async () => {
      const { data } = await supabase
        .from("partners")
        .select("*")
        .eq("activo", true)
        .order("created_at", { ascending: false });
      return (data as Partner[]) || [];
    }
  );

  // Realtime subscription for new partners
  useEffect(() => {
    if (checking || hasPartner) return;

    const channel = supabase
      .channel("partners_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partners" },
        () => {
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checking, hasPartner, supabase, mutate]);

  // Handle partner selection
  const handleConfirm = async () => {
    if (!selectedPartner) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const { data, error } = await supabase.rpc("seleccionar_partner", {
      partner_id_param: selectedPartner.id,
    });

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    if (data?.success) {
      setSuccessPartner(selectedPartner);
      setShowConfirm(false);
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    }
  };

  // Loading / redirect state
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-mono text-dim text-sm tracking-widest uppercase animate-pulse">
          Verificando...
        </div>
      </div>
    );
  }

  // Toast for already-has-partner redirect
  if (hasPartner) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-ink text-canvas px-6 py-3 rounded-lg font-mono text-sm tracking-wider shadow-xl"
        >
          {toastMsg}
        </motion.div>
      </div>
    );
  }

  // Success celebration screen
  if (showSuccess && successPartner) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col items-center text-center max-w-md"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <PartyPopper className="w-16 h-16 text-[var(--color-panini-mustard)] mb-4" />
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">
            ¡{successPartner.nombre} es tu partner!
          </h2>
          <p className="font-sans text-dim text-lg mb-2">Buena suerte.</p>
          <Eyebrow className="block text-[var(--color-panini-mustard)]">
            🏆 {successPartner.premio_titulo}
          </Eyebrow>
          <p className="font-mono text-dim text-xs mt-6 animate-pulse tracking-widest uppercase">
            Redirigiendo al dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen py-8 md:py-12 px-4 md:px-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <button
        onClick={() => router.push("/dashboard")}
        className="font-mono text-dim hover:text-ink text-xs uppercase tracking-widest transition-colors mb-8 md:mb-10 self-start flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        VOLVER AL DASHBOARD
      </button>

      {/* Title section */}
      <div className="mb-8 md:mb-12 max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-ink mb-3">
          Elige tu patrocinador
        </h1>
        <p className="font-sans text-dim font-light text-base md:text-lg leading-relaxed">
          Cada partner representa una empresa que entrega premios. Una vez
          elegido, no podrás cambiarlo. Si prefieres no elegir ahora, puedes
          seguir jugando y elegir más tarde.
        </p>
      </div>

      {/* Partners grid */}
      {partners.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle className="w-12 h-12 text-dim2 mb-4" />
          <h2 className="font-display text-2xl font-bold text-ink mb-2">
            Aún no hay patrocinadores disponibles
          </h2>
          <p className="font-sans text-dim mb-6">
            Pronto agregaremos nuevos partners. Vuelve después.
          </p>
          <Button
            variant="secondary"
            onClick={() => router.push("/dashboard")}
          >
            Volver al dashboard
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {partners.map((p) => (
            <PartnerCard
              key={p.id}
              partner={p}
              onSelect={() => {
                setSelectedPartner(p);
                setShowConfirm(true);
                setSubmitError(null);
              }}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && selectedPartner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-canvas/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              if (!isSubmitting) setShowConfirm(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-canvas border-2 border-hair2 shadow-2xl p-6 md:p-8 w-full max-w-md"
            >
              <h2 className="font-display text-2xl font-bold text-ink mb-2">
                ¿Confirmar elección?
              </h2>
              <p className="font-sans text-dim text-sm mb-6 leading-relaxed">
                Vas a elegir a{" "}
                <span className="font-semibold text-ink">
                  {selectedPartner.nombre}
                </span>{" "}
                como tu patrocinador. Esta decisión es{" "}
                <span className="font-bold text-danger uppercase">
                  permanente
                </span>{" "}
                y no podrás cambiarla.
              </p>

              {/* Partner preview */}
              <div
                className="p-4 rounded-lg mb-6 border"
                style={{
                  backgroundColor: `${selectedPartner.color_brand}08`,
                  borderColor: `${selectedPartner.color_brand}30`,
                }}
              >
                <div className="flex items-center gap-3">
                  {selectedPartner.logo_url ? (
                    <img
                      src={selectedPartner.logo_url}
                      alt={selectedPartner.nombre}
                      className="w-10 h-10 rounded object-contain"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center text-white font-display font-bold"
                      style={{
                        backgroundColor: selectedPartner.color_brand,
                      }}
                    >
                      {selectedPartner.nombre.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="font-display font-semibold text-ink block">
                      {selectedPartner.nombre}
                    </span>
                    <span
                      className="font-mono text-xs uppercase tracking-wider"
                      style={{ color: selectedPartner.color_brand }}
                    >
                      🏆 {selectedPartner.premio_titulo}
                    </span>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="text-accent text-sm font-sans mb-4 border-l-2 border-danger pl-3 text-danger">
                  {submitError}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="custom"
                  fullWidth
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="bg-cta text-ink py-4 hover:brightness-105 transition-all"
                >
                  {isSubmitting ? "Confirmando..." : "CONFIRMAR ELECCIÓN"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Partner Card Component ─────────────────────────────────────────────────

function PartnerCard({
  partner,
  onSelect,
}: {
  partner: Partner;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-canvas rounded-xl border-2 border-hair2 shadow-panini hover:shadow-panini-hover transition-all duration-300 flex flex-col overflow-hidden group"
    >
      {/* Header with logo */}
      <div className="p-5 pb-4 flex items-center gap-4">
        {partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={partner.nombre}
            className="w-[60px] h-[60px] rounded-xl object-contain flex-shrink-0"
          />
        ) : (
          <div
            className="w-[60px] h-[60px] rounded-xl flex items-center justify-center text-white font-display font-bold text-2xl flex-shrink-0 shadow-sm"
            style={{ backgroundColor: partner.color_brand }}
          >
            {partner.nombre.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="font-display font-bold text-ink text-xl md:text-[1.5rem] leading-tight">
            {partner.nombre}
          </h3>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pb-4">
        <p className="font-sans text-dim font-light text-sm leading-relaxed">
          {partner.descripcion}
        </p>
      </div>

      <Hairline />

      {/* Prize section */}
      <div className="px-5 py-4 flex-1">
        <Eyebrow className="block mb-2 text-[var(--color-panini-mustard)]">
          PREMIO
        </Eyebrow>
        <p className="font-display font-semibold text-ink text-base mb-1">
          {partner.premio_titulo}
        </p>
        <p className="font-sans text-dim font-light text-sm leading-relaxed">
          {partner.premio_descripcion}
        </p>
      </div>

      {/* CTA Button */}
      <div className="p-5 pt-3">
        <Button
          variant="custom"
          fullWidth
          onClick={onSelect}
          className="bg-ink text-canvas font-mono uppercase tracking-widest text-xs py-3.5 hover:bg-ink/90 transition-colors"
        >
          ELEGIR ESTE PARTNER
        </Button>
      </div>
    </motion.div>
  );
}
