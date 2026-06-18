"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Partner } from "@/lib/types";
import { Eyebrow } from "./ui/Eyebrow";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Hairline } from "./ui/Hairline";
import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";

interface PartnerWithCount extends Partner {
  user_count: number;
}

export function AdminPartnersPanel() {
  const supabase = createClient();
  const [partners, setPartners] = useState<PartnerWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [formNombre, setFormNombre] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formPremioTitulo, setFormPremioTitulo] = useState("");
  const [formPremioDesc, setFormPremioDesc] = useState("");
  const [formColorBrand, setFormColorBrand] = useState("#0055A4");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit modal state
  const [editPartner, setEditPartner] = useState<PartnerWithCount | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [editPremioTitulo, setEditPremioTitulo] = useState("");
  const [editPremioDesc, setEditPremioDesc] = useState("");
  const [editColorBrand, setEditColorBrand] = useState("#0055A4");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchPartners = async () => {
    setLoading(true);

    // Fetch all partners
    const { data: allPartners } = await supabase
      .from("partners")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch user counts per partner
    const { data: counts } = await supabase
      .from("usuarios")
      .select("partner_id")
      .not("partner_id", "is", null);

    // Count users per partner_id
    const countMap: Record<string, number> = {};
    if (counts) {
      for (const row of counts) {
        if (row.partner_id) {
          countMap[row.partner_id] = (countMap[row.partner_id] || 0) + 1;
        }
      }
    }

    if (allPartners) {
      setPartners(
        (allPartners as Partner[]).map((p) => ({
          ...p,
          user_count: countMap[p.id] || 0,
        }))
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPartners();
  }, [supabase]);

  const handleCreate = async () => {
    if (!formNombre || !formPremioTitulo) {
      setCreateError("Nombre y título del premio son obligatorios.");
      return;
    }
    setIsCreating(true);
    setCreateError("");

    const { error } = await supabase.rpc("crear_partner", {
      nombre_param: formNombre,
      descripcion_param: formDesc,
      logo_url_param: formLogoUrl || null,
      premio_titulo_param: formPremioTitulo,
      premio_descripcion_param: formPremioDesc,
      color_brand_param: formColorBrand,
    });

    setIsCreating(false);

    if (error) {
      setCreateError(error.message);
    } else {
      // Reset form
      setFormNombre("");
      setFormDesc("");
      setFormLogoUrl("");
      setFormPremioTitulo("");
      setFormPremioDesc("");
      setFormColorBrand("#0055A4");
      fetchPartners();
    }
  };

  const openEdit = (p: PartnerWithCount) => {
    setEditPartner(p);
    setEditNombre(p.nombre);
    setEditDesc(p.descripcion);
    setEditLogoUrl(p.logo_url || "");
    setEditPremioTitulo(p.premio_titulo);
    setEditPremioDesc(p.premio_descripcion);
    setEditColorBrand(p.color_brand);
    setEditError("");
  };

  const handleUpdate = async () => {
    if (!editPartner) return;
    setIsSaving(true);
    setEditError("");

    const { error } = await supabase.rpc("actualizar_partner", {
      partner_id_param: editPartner.id,
      nombre_param: editNombre,
      descripcion_param: editDesc,
      logo_url_param: editLogoUrl || null,
      premio_titulo_param: editPremioTitulo,
      premio_descripcion_param: editPremioDesc,
      color_brand_param: editColorBrand,
      activo_param: editPartner.activo,
    });

    setIsSaving(false);

    if (error) {
      setEditError(error.message);
    } else {
      setEditPartner(null);
      fetchPartners();
    }
  };

  const handleToggleActive = async (p: PartnerWithCount) => {
    await supabase.rpc("actualizar_partner", {
      partner_id_param: p.id,
      nombre_param: p.nombre,
      descripcion_param: p.descripcion,
      logo_url_param: p.logo_url,
      premio_titulo_param: p.premio_titulo,
      premio_descripcion_param: p.premio_descripcion,
      color_brand_param: p.color_brand,
      activo_param: !p.activo,
    });
    fetchPartners();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* ─── SECTION 1: PARTNER LIST ─── */}
      <div>
        <Eyebrow className="block mb-4 text-[var(--color-panini-blue)] border-b border-hair2 pb-2">
          PARTNERS REGISTRADOS
        </Eyebrow>

        {loading ? (
          <div className="font-mono text-dim text-sm py-8 text-center tracking-widest uppercase animate-pulse">
            Cargando partners...
          </div>
        ) : partners.length === 0 ? (
          <div className="text-dim font-sans py-8 text-center">
            No hay partners registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm border-collapse">
              <thead>
                <tr className="border-b border-hair2 text-dim font-mono text-xs uppercase tracking-widest">
                  <th className="pb-2">Nombre</th>
                  <th className="pb-2">Premio</th>
                  <th className="pb-2 text-center"># Usuarios</th>
                  <th className="pb-2 text-center">Estado</th>
                  <th className="pb-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-hair2 last:border-b-0 hover:bg-raise transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: p.color_brand }}
                        />
                        <span className="font-display font-semibold text-ink">
                          {p.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-dim">{p.premio_titulo}</td>
                    <td className="py-3 text-center font-mono font-bold text-ink">
                      {p.user_count}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2 py-0.5 text-xs font-mono uppercase tracking-wider rounded-full ${
                          p.activo
                            ? "bg-success/10 text-success"
                            : "bg-dim2/10 text-dim2"
                        }`}
                      >
                        {p.activo ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 text-dim hover:text-ink hover:bg-raise rounded transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`p-2 rounded transition-colors ${
                            p.activo
                              ? "text-success hover:text-danger hover:bg-danger/5"
                              : "text-dim2 hover:text-success hover:bg-success/5"
                          }`}
                          title={p.activo ? "Desactivar" : "Activar"}
                        >
                          {p.activo ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Hairline />

      {/* ─── SECTION 2: CREATE PARTNER FORM ─── */}
      <div>
        <Eyebrow className="block mb-4 text-[var(--color-panini-mint)] border-b border-hair2 pb-2">
          CREAR NUEVO PARTNER
        </Eyebrow>

        <div className="bg-canvas border border-hair2 p-6 rounded-lg max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input
              label="Nombre"
              value={formNombre}
              onChange={(e) => setFormNombre(e.target.value)}
              placeholder="Bavaria"
            />
            <Input
              label="Logo URL (opcional)"
              value={formLogoUrl}
              onChange={(e) => setFormLogoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="mb-6">
            <label className="font-mono uppercase tracking-widest text-[0.7rem] text-dim mb-2 block">
              Descripción
            </label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Descripción del partner..."
              rows={3}
              className="w-full border-b border-hair2 bg-transparent py-3 focus:outline-none focus:border-ink transition-colors font-sans text-ink placeholder-dim2 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input
              label="Título del premio"
              value={formPremioTitulo}
              onChange={(e) => setFormPremioTitulo(e.target.value)}
              placeholder="Nevera llena de cerveza"
            />
            <div className="flex flex-col">
              <label className="font-mono uppercase tracking-widest text-[0.7rem] text-dim mb-2">
                Color Brand
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formColorBrand}
                  onChange={(e) => setFormColorBrand(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-hair2"
                />
                <span className="font-mono text-sm text-dim">
                  {formColorBrand}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="font-mono uppercase tracking-widest text-[0.7rem] text-dim mb-2 block">
              Descripción del premio
            </label>
            <textarea
              value={formPremioDesc}
              onChange={(e) => setFormPremioDesc(e.target.value)}
              placeholder="Descripción del premio que recibirá el ganador..."
              rows={2}
              className="w-full border-b border-hair2 bg-transparent py-3 focus:outline-none focus:border-ink transition-colors font-sans text-ink placeholder-dim2 resize-none"
            />
          </div>

          {createError && (
            <div className="text-danger text-sm font-sans mb-4 border-l-2 border-danger pl-3">
              {createError}
            </div>
          )}

          <Button
            variant="custom"
            onClick={handleCreate}
            disabled={isCreating || !formNombre || !formPremioTitulo}
            className="bg-cta text-ink px-8 py-3"
          >
            {isCreating ? "Creando..." : "CREAR PARTNER"}
          </Button>
        </div>
      </div>

      {/* ─── EDIT MODAL ─── */}
      {editPartner && (
        <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-canvas border border-hair2 shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-xl font-bold mb-1">
              Editar Partner
            </h2>
            <Eyebrow className="block mb-6">{editPartner.nombre}</Eyebrow>

            <div className="flex flex-col gap-5">
              <Input
                label="Nombre"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
              />
              <div>
                <label className="font-mono uppercase tracking-widest text-[0.7rem] text-dim mb-2 block">
                  Descripción
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full border-b border-hair2 bg-transparent py-3 focus:outline-none focus:border-ink transition-colors font-sans text-ink placeholder-dim2 resize-none"
                />
              </div>
              <Input
                label="Logo URL"
                value={editLogoUrl}
                onChange={(e) => setEditLogoUrl(e.target.value)}
              />
              <Input
                label="Título del premio"
                value={editPremioTitulo}
                onChange={(e) => setEditPremioTitulo(e.target.value)}
              />
              <div>
                <label className="font-mono uppercase tracking-widest text-[0.7rem] text-dim mb-2 block">
                  Descripción del premio
                </label>
                <textarea
                  value={editPremioDesc}
                  onChange={(e) => setEditPremioDesc(e.target.value)}
                  rows={2}
                  className="w-full border-b border-hair2 bg-transparent py-3 focus:outline-none focus:border-ink transition-colors font-sans text-ink placeholder-dim2 resize-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-mono uppercase tracking-widest text-[0.7rem] text-dim mb-2">
                  Color Brand
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={editColorBrand}
                    onChange={(e) => setEditColorBrand(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-hair2"
                  />
                  <span className="font-mono text-sm text-dim">
                    {editColorBrand}
                  </span>
                </div>
              </div>
            </div>

            {editError && (
              <div className="text-danger text-sm font-sans mt-4 border-l-2 border-danger pl-3">
                {editError}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setEditPartner(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="custom"
                fullWidth
                onClick={handleUpdate}
                disabled={isSaving}
                className="bg-primary text-canvas py-4"
              >
                {isSaving ? "Guardando..." : "GUARDAR CAMBIOS"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
