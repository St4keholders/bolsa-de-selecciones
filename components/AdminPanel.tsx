"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MercadoSeleccion, Partido } from "@/lib/types";
import { Eyebrow } from "./ui/Eyebrow";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { COUNTRIES } from "@/lib/countries";
import { CalendarIcon } from "lucide-react";

type Tab = 'partidos' | 'llaves' | 'quiebras';

type PartidoLleno = Partido & {
  local_pais?: string;
  visitante_pais?: string;
};

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('partidos');
  
  // Data general
  const [selecciones, setSelecciones] = useState<MercadoSeleccion[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchSelecciones = async () => {
      const { data } = await supabase.from("mercado_selecciones").select("*").order("pais");
      if (data) setSelecciones(data as MercadoSeleccion[]);
    };
    fetchSelecciones();
  }, [supabase]);

  return (
    <div className="flex flex-col min-h-[600px] bg-canvas border border-hair2 shadow-sm">
      {/* Tabs Header */}
      <div className="flex border-b border-hair2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('partidos')}
          className={`flex-1 py-4 font-mono text-sm tracking-widest uppercase transition-colors ${activeTab === 'partidos' ? 'bg-primary text-canvas font-bold' : 'text-dim hover:bg-raise'}`}
        >
          Partidos
        </button>
        <button 
          onClick={() => setActiveTab('llaves')}
          className={`flex-1 py-4 font-mono text-sm tracking-widest uppercase transition-colors border-l border-hair2 ${activeTab === 'llaves' ? 'bg-primary text-canvas font-bold' : 'text-dim hover:bg-raise'}`}
        >
          Llaves
        </button>
        <button 
          onClick={() => setActiveTab('quiebras')}
          className={`flex-1 py-4 font-mono text-sm tracking-widest uppercase transition-colors border-l border-hair2 ${activeTab === 'quiebras' ? 'bg-danger text-canvas font-bold' : 'text-dim hover:bg-raise'}`}
        >
          Quiebras
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex-1">
        {activeTab === 'partidos' && <AdminPartidos selecciones={selecciones} supabase={supabase} />}
        {activeTab === 'llaves' && <AdminLlaves selecciones={selecciones} supabase={supabase} />}
        {activeTab === 'quiebras' && <AdminQuiebras selecciones={selecciones} supabase={supabase} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// TAB 1: PARTIDOS
// ----------------------------------------------------------------------------
function AdminPartidos({ selecciones, supabase }: { selecciones: MercadoSeleccion[], supabase: any }) {
  const [partidos, setPartidos] = useState<PartidoLleno[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<'programado'|'finalizado'|'todos'>('programado');
  
  const [selectedPartido, setSelectedPartido] = useState<PartidoLleno | null>(null);
  // Form de resultado
  const [formRes, setFormRes] = useState({ gl: 0, gv: 0, pl: 50, pv: 50, tl: 0, tv: 0 });
  const [isSaving, setIsSaving] = useState(false);

  // Form de reprogramación
  const [reprogramarPartido, setReprogramarPartido] = useState<PartidoLleno | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [isReprogramando, setIsReprogramando] = useState(false);
  const [reprogramarError, setReprogramarError] = useState("");

  const fetchPartidos = async () => {
    let q = supabase.from('partidos').select(`
      *,
      local:equipo_local_id(pais),
      visitante:equipo_visitante_id(pais)
    `).order('fecha', { ascending: true });
    
    if (filtroEstado !== 'todos') {
      q = q.eq('estado', filtroEstado);
    }
    
    const { data } = await q;
    if (data) {
      setPartidos(data.map((p: any) => ({
        ...p,
        local_pais: p.local?.pais || p.dependencia_local,
        visitante_pais: p.visitante?.pais || p.dependencia_visitante
      })));
    }
  };

  useEffect(() => { fetchPartidos(); }, [filtroEstado, supabase]);

  const handleSaveResult = async () => {
    if (!selectedPartido) return;
    setIsSaving(true);
    const { data, error } = await supabase.rpc('registrar_resultado_partido', {
      partido_id_param: selectedPartido.id,
      goles_local_param: formRes.gl,
      goles_visitante_param: formRes.gv,
      posesion_local_param: formRes.pl,
      posesion_visitante_param: formRes.pv,
      tiros_local_param: formRes.tl,
      tiros_visitante_param: formRes.tv
    });
    setIsSaving(false);
    if (!error && data?.success) {
      alert(`Resultado guardado con éxito. ID: ${data.partido_id}`);
      setSelectedPartido(null);
      fetchPartidos();
    } else {
      alert(error?.message || "Error desconocido");
    }
  };

  const handleReprogramar = async () => {
    if (!reprogramarPartido || !nuevaFecha) return;
    setReprogramarError("");
    setIsReprogramando(true);
    
    const { data, error } = await supabase.rpc('reprogramar_partido', {
      partido_id_param: reprogramarPartido.id,
      nueva_fecha_param: nuevaFecha
    });

    setIsReprogramando(false);
    
    if (error) {
      setReprogramarError(error.message);
    } else if (data?.success) {
      alert(`Partido reprogramado para ${nuevaFecha}`);
      setReprogramarPartido(null);
      fetchPartidos();
    }
  };

  const totalPartidos = partidos.length;
  const terminados = partidos.filter(p => p.estado === 'finalizado').length;
  const programados = partidos.filter(p => p.estado === 'programado');
  const proximo = programados.length > 0 ? programados.sort((a,b) => a.fecha.localeCompare(b.fecha))[0] : null;

  return (
    <div className="flex flex-col">
      <div className="mb-6 grid grid-cols-3 gap-4 border border-hair2 p-4 bg-raise text-sm">
        <div className="flex flex-col">
          <span className="text-dim font-mono text-xs mb-1">PROGRESO</span>
          <span className="font-display font-semibold text-ink text-lg">{terminados} / {totalPartidos} jugados</span>
        </div>
        <div className="flex flex-col">
          <span className="text-dim font-mono text-xs mb-1">PRÓXIMO PARTIDO</span>
          <span className="font-display font-semibold text-ink text-lg">
            {proximo ? `${proximo.local_pais || proximo.dependencia_local} vs ${proximo.visitante_pais || proximo.dependencia_visitante}` : 'Ninguno'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-dim font-mono text-xs mb-1">FECHA</span>
          <span className="font-display font-semibold text-ink text-lg">{proximo?.fecha || 'N/A'}</span>
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value as any)} className="border border-hair2 px-3 py-2">
          <option value="programado">Programados</option>
          <option value="finalizado">Finalizados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-sm border-collapse">
          <thead>
            <tr className="border-b border-hair2 text-dim font-mono text-xs uppercase tracking-widest">
              <th className="pb-2">ID</th>
              <th className="pb-2">Fecha</th>
              <th className="pb-2">Fase</th>
              <th className="pb-2">Partido</th>
              <th className="pb-2">Estado</th>
              <th className="pb-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {partidos.map(p => (
              <tr key={p.id} className="border-b border-hair2 last:border-b-0 hover:bg-raise">
                <td className="py-3 text-dim font-mono">{p.id}</td>
                <td className="py-3 font-mono">
                  {p.fecha} 
                  {p.fecha_actualizada_at && <span className="ml-2 text-[0.6rem] bg-accent2 text-canvas px-1 rounded uppercase tracking-wider">Reprog</span>}
                </td>
                <td className="py-3 uppercase text-xs text-dim">{p.fase.replace('_', ' ')}</td>
                <td className="py-3 font-medium text-ink">
                  {p.local_pais} vs {p.visitante_pais}
                  {p.estado === 'finalizado' && <span className="ml-2 text-success font-mono font-bold">({p.goles_local} - {p.goles_visitante})</span>}
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 text-xs font-mono uppercase ${p.estado === 'programado' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}`}>
                    {p.estado}
                  </span>
                </td>
                <td className="py-3">
                  {p.estado === 'programado' && (
                    <div className="flex items-center gap-2">
                      <Button variant="custom" className="bg-cta text-ink px-2 py-1 text-xs" onClick={() => setSelectedPartido(p)}>
                        Registrar Resultado
                      </Button>
                      <button 
                        onClick={() => setReprogramarPartido(p)}
                        className="p-2 text-dim hover:text-ink hover:bg-hair rounded transition-colors"
                        title="Reprogramar"
                      >
                        <CalendarIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Resultado */}
      {selectedPartido && (
        <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-canvas border border-hair2 shadow-2xl p-6 w-full max-w-lg">
            <h2 className="font-display text-2xl font-bold mb-2">Registrar Resultado</h2>
            <Eyebrow className="block mb-6">{selectedPartido.fase.replace('_',' ')} · {selectedPartido.fecha}</Eyebrow>
            
            <div className="grid grid-cols-2 gap-8 text-center mb-6">
              <div>
                <div className="font-display font-semibold text-lg mb-4">{selectedPartido.local_pais}</div>
                <Input label="GOLES" type="number" min={0} value={formRes.gl.toString()} onChange={e => setFormRes({...formRes, gl: parseInt(e.target.value)||0})} />
                <div className="my-2" />
                <Input label="POSESIÓN (%)" type="number" min={0} max={100} value={formRes.pl.toString()} onChange={e => {const v=parseInt(e.target.value)||0; setFormRes({...formRes, pl: v, pv: 100-v})}} />
                <div className="my-2" />
                <Input label="TIROS A ARCO" type="number" min={0} value={formRes.tl.toString()} onChange={e => setFormRes({...formRes, tl: parseInt(e.target.value)||0})} />
              </div>
              <div>
                <div className="font-display font-semibold text-lg mb-4">{selectedPartido.visitante_pais}</div>
                <Input label="GOLES" type="number" min={0} value={formRes.gv.toString()} onChange={e => setFormRes({...formRes, gv: parseInt(e.target.value)||0})} />
                <div className="my-2" />
                <Input label="POSESIÓN (%)" type="number" min={0} max={100} value={formRes.pv.toString()} onChange={e => {const v=parseInt(e.target.value)||0; setFormRes({...formRes, pv: v, pl: 100-v})}} />
                <div className="my-2" />
                <Input label="TIROS A ARCO" type="number" min={0} value={formRes.tv.toString()} onChange={e => setFormRes({...formRes, tv: parseInt(e.target.value)||0})} />
              </div>
            </div>
            {/* Vista Previa de Impacto en Vivo */}
            {(() => {
              const gl = formRes.gl; const gv = formRes.gv;
              const pl = formRes.pl; const pv = formRes.pv;
              const tl = formRes.tl; const tv = formRes.tv;
              const localWin = gl > gv; const visitWin = gv > gl; const draw = gl === gv;
              
              const efiLocal = tl > 0 ? (gl / tl) * 100 : 0;
              const efiVisit = tv > 0 ? (gv / tv) * 100 : 0;

              const localDeltas = {
                ataque: gl > 0 ? gl * 8 : -4,
                creacion: Math.round((pl - 50) * 0.4),
                muralla: gv === 0 ? 6 : gv * -5,
                reflejos: localWin ? 10 : draw ? 3 : -5,
                posesion: Math.round((pl - 50) * 0.2),
                eficiencia: Math.round((efiLocal - 50) * 0.3),
              };
              const visitDeltas = {
                ataque: gv > 0 ? gv * 8 : -4,
                creacion: Math.round((pv - 50) * 0.4),
                muralla: gl === 0 ? 6 : gl * -5,
                reflejos: visitWin ? 10 : draw ? 3 : -5,
                posesion: Math.round((pv - 50) * 0.2),
                eficiencia: Math.round((efiVisit - 50) * 0.3),
              };
              const localTotal = Object.values(localDeltas).reduce((a, b) => a + b, 0);
              const visitTotal = Object.values(visitDeltas).reduce((a, b) => a + b, 0);
              
              const DeltaRow = ({ label, l, v }: { label: string, l: number, v: number }) => (
                <div className="grid grid-cols-3 text-xs font-mono py-0.5">
                  <span className={`text-right pr-3 ${l >= 0 ? 'text-success' : 'text-accent'}`}>{l >= 0 ? '+' : ''}{l}</span>
                  <span className="text-center text-dim">{label}</span>
                  <span className={`text-left pl-3 ${v >= 0 ? 'text-success' : 'text-accent'}`}>{v >= 0 ? '+' : ''}{v}</span>
                </div>
              );

              return (
                <div className="bg-raise border border-hair2 p-4 mb-6">
                  <Eyebrow className="block mb-3 text-center">CAMBIOS QUE SE APLICARÁN</Eyebrow>
                  <div className="grid grid-cols-3 text-xs font-mono pb-2 border-b border-hair2 mb-2">
                    <span className="text-right pr-3 font-bold">{selectedPartido.local_pais}</span>
                    <span className="text-center text-dim">STAT</span>
                    <span className="text-left pl-3 font-bold">{selectedPartido.visitante_pais}</span>
                  </div>
                  <DeltaRow label="ATQ" l={localDeltas.ataque} v={visitDeltas.ataque} />
                  <DeltaRow label="CRE" l={localDeltas.creacion} v={visitDeltas.creacion} />
                  <DeltaRow label="MUR" l={localDeltas.muralla} v={visitDeltas.muralla} />
                  <DeltaRow label="REF" l={localDeltas.reflejos} v={visitDeltas.reflejos} />
                  <DeltaRow label="POS" l={localDeltas.posesion} v={visitDeltas.posesion} />
                  <DeltaRow label="EFI" l={localDeltas.eficiencia} v={visitDeltas.eficiencia} />
                  <div className="grid grid-cols-3 text-sm font-display font-bold pt-2 border-t border-hair2 mt-2">
                    <span className={`text-right pr-3 ${localTotal >= 0 ? 'text-success' : 'text-accent'}`}>{localTotal >= 0 ? '+' : ''}{localTotal}</span>
                    <span className="text-center text-dim text-xs">TOTAL</span>
                    <span className={`text-left pl-3 ${visitTotal >= 0 ? 'text-success' : 'text-accent'}`}>{visitTotal >= 0 ? '+' : ''}{visitTotal}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-4">
              <Button variant="ghost" fullWidth onClick={() => setSelectedPartido(null)}>Cancelar</Button>
              <Button variant="custom" fullWidth onClick={handleSaveResult} disabled={isSaving || formRes.pl + formRes.pv !== 100 || formRes.tl < formRes.gl || formRes.tv < formRes.gv} className="bg-cta text-ink py-4">
                {isSaving ? 'Guardando...' : 'GUARDAR RESULTADO'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reprogramación */}
      {reprogramarPartido && (
        <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-canvas border border-hair2 shadow-2xl p-6 w-full max-w-sm">
            <h2 className="font-display text-xl font-bold mb-2">Reprogramar {reprogramarPartido.id}</h2>
            <Eyebrow className="block mb-6">Fecha actual: {reprogramarPartido.fecha}</Eyebrow>

            <Input 
              label="NUEVA FECHA" 
              type="date" 
              value={nuevaFecha}
              onChange={e => setNuevaFecha(e.target.value)}
              className="mb-2"
            />
            {reprogramarError && <div className="text-accent font-sans text-sm mb-4">{reprogramarError}</div>}
            
            <div className="flex gap-4 mt-6">
              <Button variant="ghost" fullWidth onClick={() => {setReprogramarPartido(null); setReprogramarError("");}}>Cancelar</Button>
              <Button variant="custom" fullWidth onClick={handleReprogramar} disabled={isReprogramando || !nuevaFecha} className="bg-primary text-canvas py-4">
                {isReprogramando ? 'Guardando...' : 'GUARDAR FECHA'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// TAB 2: LLAVES
// ----------------------------------------------------------------------------
function AdminLlaves({ selecciones, supabase }: { selecciones: MercadoSeleccion[], supabase: any }) {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);
  const [localId, setLocalId] = useState<number | "">("");
  const [visitId, setVisitId] = useState<number | "">("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchPartidos = async () => {
    const { data } = await supabase
      .from('partidos')
      .select('*')
      .in('fase', ['dieciseisavos','octavos','cuartos','semis','tercer_puesto','final'])
      .eq('estado', 'programado')
      .or('equipo_local_id.is.null,equipo_visitante_id.is.null')
      .order('fecha', { ascending: true });
    if (data) setPartidos(data as Partido[]);
  };

  useEffect(() => { fetchPartidos(); }, [supabase]);

  const handleAssign = async () => {
    if (!selectedPartido || !localId || !visitId) return;
    setIsSaving(true);
    const { data, error } = await supabase.rpc('asignar_equipos_a_partido', {
      partido_id_param: selectedPartido.id,
      equipo_local_id_param: Number(localId),
      equipo_visitante_id_param: Number(visitId)
    });
    setIsSaving(false);
    if (!error && data?.success) {
      alert("Equipos asignados con éxito");
      setSelectedPartido(null);
      fetchPartidos();
    } else {
      alert(error?.message || "Error");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold">Gestión de Partidos</h2>
      </div>

      <p className="font-sans text-dim mb-6">Partidos de eliminación directa sin equipos definidos:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partidos.map(p => (
          <div key={p.id} className="border border-hair2 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <Eyebrow>{p.fase.replace('_',' ')} · {p.fecha}</Eyebrow>
              <span className="font-mono text-xs text-dim">ID: {p.id}</span>
            </div>
            <div className="font-display font-medium text-lg mb-6">
              {p.dependencia_local} vs {p.dependencia_visitante}
            </div>
            <Button onClick={() => setSelectedPartido(p)}>Asignar Equipos</Button>
          </div>
        ))}
        {partidos.length === 0 && <div className="text-dim">No hay partidos pendientes de asignación.</div>}
      </div>

      {selectedPartido && (
        <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-canvas border border-hair2 shadow-2xl p-6 w-full max-w-sm">
            <h2 className="font-display text-xl font-bold mb-4">Asignar Equipos ({selectedPartido.id})</h2>
            
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="font-mono text-xs text-dim mb-1 block">Local ({selectedPartido.dependencia_local})</label>
                <select value={localId} onChange={e => setLocalId(e.target.value ? Number(e.target.value) : "")} className="w-full border-b border-hair2 py-2">
                  <option value="">Seleccionar...</option>
                  {selecciones.map(s => <option key={s.id} value={s.id}>{s.pais}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-xs text-dim mb-1 block">Visitante ({selectedPartido.dependencia_visitante})</label>
                <select value={visitId} onChange={e => setVisitId(e.target.value ? Number(e.target.value) : "")} className="w-full border-b border-hair2 py-2">
                  <option value="">Seleccionar...</option>
                  {selecciones.map(s => <option key={s.id} value={s.id}>{s.pais}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" fullWidth onClick={() => setSelectedPartido(null)}>Cancelar</Button>
              <Button variant="custom" fullWidth onClick={handleAssign} disabled={isSaving || !localId || !visitId} className="bg-primary text-canvas py-4">
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// TAB 3: QUIEBRAS
// ----------------------------------------------------------------------------
function AdminQuiebras({ selecciones, supabase }: { selecciones: MercadoSeleccion[], supabase: any }) {
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selected = selecciones.find(s => s.id === selectedId);

  const handleQuiebra = async () => {
    if (!selected) return;
    setIsLoading(true);
    const { data, error } = await supabase.rpc('declarar_quiebra', {
      seleccion_id_param: selected.id
    });
    setIsLoading(false);
    if (!error && data?.success) {
      alert(`${selected.pais} declarada en quiebra.`);
      setShowConfirm(false);
      setConfirmText("");
      setSelectedId("");
      window.location.reload(); // Simple refresh para que se actualice selecciones del parent
    } else {
      alert(error?.message || "Error al declarar quiebra");
    }
  };

  return (
    <div className="max-w-md">
      <p className="font-sans text-dim mb-6">
        Declarar en quiebra reducirá sus stats a 0 de forma permanente y marcará a la selección como eliminada.
      </p>
      
      <select 
        value={selectedId}
        onChange={e => setSelectedId(e.target.value ? Number(e.target.value) : "")}
        className="w-full border-b border-hair2 bg-transparent py-3 mb-6 focus:outline-none"
      >
        <option value="">Selecciona un país activo...</option>
        {selecciones.filter(s => s.estado === 'activo').map(s => (
          <option key={s.id} value={s.id}>{s.pais}</option>
        ))}
      </select>

      {selected && (
        <Button variant="danger" fullWidth onClick={() => setShowConfirm(true)}>
          DECLARAR EN QUIEBRA
        </Button>
      )}

      {showConfirm && selected && (
        <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-canvas border border-danger shadow-2xl p-6 w-full max-w-sm">
            <h2 className="font-display text-xl font-bold mb-2 text-danger">Confirmar Quiebra</h2>
            <p className="font-sans text-dim mb-4 text-sm">
              ¿Seguro? Escribe "{selected.pais}" para confirmar.
            </p>
            <Input label="Confirmar País" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder={selected.pais} className="mb-6" />
            <div className="flex gap-4">
              <Button variant="ghost" fullWidth onClick={() => setShowConfirm(false)}>Cancelar</Button>
              <Button 
                variant="danger" 
                fullWidth 
                onClick={handleQuiebra}
                disabled={isLoading || confirmText.toLowerCase() !== selected.pais.toLowerCase()}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
