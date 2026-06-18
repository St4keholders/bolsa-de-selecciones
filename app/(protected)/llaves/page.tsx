import { createClient } from "@/lib/supabase/server";
import { MercadoSeleccion, Partido } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Check } from "lucide-react";
import Link from "next/link";
import { CintasMundialistas } from "@/components/decorations/CintasMundialistas";

type PartidoLleno = Partido & {
  local?: MercadoSeleccion;
  visitante?: MercadoSeleccion;
};

function MatchCard({ partido }: { partido: PartidoLleno }) {
  const localTheme = partido.local ? COUNTRIES[partido.local.id] : null;
  const visitTheme = partido.visitante ? COUNTRIES[partido.visitante.id] : null;

  return (
    <div className="flex flex-col bg-canvas border border-hair2 w-[240px] shadow-sm relative">
      {partido.estado === 'finalizado' && (
        <div className="absolute -top-2 -right-2 bg-success text-canvas rounded-full p-0.5 z-10">
          <Check className="w-3 h-3" />
        </div>
      )}
      
      {/* Equipo Local */}
      <div className="flex items-center justify-between p-2 border-b border-hair2 h-10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {localTheme ? (
            <>
              <div className="w-4 h-4 rounded-full flex-shrink-0 border border-hair2" style={{ background: localTheme.gradientFull }} />
              <span className="font-sans font-medium text-ink truncate text-sm">{partido.local?.pais}</span>
            </>
          ) : (
            <span className="font-mono text-[0.65rem] text-dim truncate">{partido.dependencia_local}</span>
          )}
        </div>
        {partido.estado === 'finalizado' && (
          <span className="font-mono font-bold ml-2 text-sm">{partido.goles_local}</span>
        )}
      </div>

      {/* Equipo Visitante */}
      <div className="flex items-center justify-between p-2 h-10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {visitTheme ? (
            <>
              <div className="w-4 h-4 rounded-full flex-shrink-0 border border-hair2" style={{ background: visitTheme.gradientFull }} />
              <span className="font-sans font-medium text-ink truncate text-sm">{partido.visitante?.pais}</span>
            </>
          ) : (
            <span className="font-mono text-[0.65rem] text-dim truncate">{partido.dependencia_visitante}</span>
          )}
        </div>
        {partido.estado === 'finalizado' && (
          <span className="font-mono font-bold ml-2 text-sm">{partido.goles_visitante}</span>
        )}
      </div>
    </div>
  );
}

export default async function BracketsPage() {
  const supabase = await createClient();

  // Traer todos los partidos de eliminatorias
  const { data } = await supabase
    .from('partidos')
    .select(`
      *,
      local:equipo_local_id(*),
      visitante:equipo_visitante_id(*)
    `)
    .in('fase', ['dieciseisavos', 'octavos', 'cuartos', 'semis', 'final'])
    .order('id');

  const partidos = (data || []) as PartidoLleno[];

  const fases = [
    { key: 'dieciseisavos', label: '16vos de Final', count: 16 },
    { key: 'octavos', label: 'Octavos de Final', count: 8 },
    { key: 'cuartos', label: 'Cuartos de Final', count: 4 },
    { key: 'semis', label: 'Semifinales', count: 2 },
    { key: 'final', label: 'Gran Final', count: 1 }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-raise">
      <div className="bg-canvas border-b border-hair2 sticky top-0 z-50 px-5 py-4 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="font-mono text-dim hover:text-ink text-xs uppercase tracking-[0.2em] transition-colors block mb-1">
            ← Volver al Dashboard
          </Link>
          <h1 className="font-display text-2xl font-semibold text-ink">Llaves del Torneo</h1>
        </div>
      </div>

      <main className="flex-1 overflow-x-auto p-8 relative">
        <div className="absolute top-0 left-0 w-full h-[60px] opacity-40 pointer-events-none">
          <CintasMundialistas variant="horizontal" />
        </div>
        
        <div className="flex gap-16 min-w-max pb-16 pt-8">
          {fases.map((fase) => {
            const matchesInPhase = partidos.filter(p => p.fase === fase.key);
            
            return (
              <div key={fase.key} className="flex flex-col w-[240px] flex-shrink-0 relative z-10">
                <div className="mb-6 text-center border-b border-hair2 pb-2">
                  <Eyebrow>{fase.label}</Eyebrow>
                </div>
                
                <div className="flex flex-col flex-1 justify-around gap-4">
                  {matchesInPhase.map((p, idx) => (
                    <div key={p.id} className="relative">
                      <MatchCard partido={p} />
                      
                      {/* Conectores Visuales */}
                      {fase.key !== 'final' && (
                        <div className="absolute -right-8 top-1/2 w-8 border-t border-hair2" />
                      )}
                      {fase.key !== 'dieciseisavos' && (
                        <div className="absolute -left-8 top-1/2 w-8 border-t border-hair2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
