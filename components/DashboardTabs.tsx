"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SobreDiario } from "./SobreDiario";
import { Portafolio } from "./Portafolio";
import { Top10Chart } from "./Top10Chart";
import { ProximoPartido } from "./ProximoPartido";
import { Top5Peores } from "./Top5Peores";
import { HistorialSeleccion } from "./HistorialSeleccion";
import { UltimosResultados } from "./UltimosResultados";
import { ProximasFechas } from "./ProximasFechas";
import { RankingJugadores } from "./RankingJugadores";
import { Eyebrow } from "./ui/Eyebrow";

interface DashboardTabsProps {
  userId: string;
}

type TabType = 'INICIO' | 'MERCADO' | 'PARTIDOS' | 'LLAVES' | 'HISTORIAL' | 'RANKING';

export function DashboardTabs({ userId }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('INICIO');
  const router = useRouter();

  const tabs: { id: TabType, label: string, color: string }[] = [
    { id: 'INICIO', label: 'MI PORTAFOLIO', color: 'var(--color-panini-mint)' },
    { id: 'MERCADO', label: 'EL MERCADO', color: 'var(--color-panini-blue)' },
    { id: 'PARTIDOS', label: 'PARTIDOS', color: 'var(--color-panini-orange)' },
    { id: 'LLAVES', label: 'LLAVES', color: 'var(--color-mundial-lime)' },
    { id: 'HISTORIAL', label: 'HISTORIAL', color: 'var(--color-panini-purple)' },
    { id: 'RANKING', label: 'RANKING', color: 'var(--color-panini-red)' },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (tabId === 'LLAVES') {
      router.push('/llaves');
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-[1400px] mx-auto px-3 md:px-5 py-4 md:py-6">
      
      {/* TABS NAVIGATION - horizontal scroll on mobile, neumorphic on mobile */}
      <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 mb-6 md:mb-8 scrollbar-hide">
        <div className="flex gap-2 md:gap-2 md:flex-wrap border-b-[3px] border-ink pb-3 md:pb-4 min-w-max md:min-w-0">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id && tab.id !== 'LLAVES';
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`font-mono font-bold tracking-widest text-xs px-4 py-2.5 md:px-6 md:py-3 md:text-sm uppercase transition-all whitespace-nowrap
                  ${isActive
                    ? 'neumo-pressed md:bg-transparent md:shadow-none md:rounded-t-lg text-white md:translate-y-[-2px] md:shadow-panini rounded-2xl md:rounded-t-lg'
                    : 'neumo md:bg-white md:shadow-none md:rounded-t-lg text-dim md:text-dim md:border md:border-hair2 md:border-b-0 md:hover:text-ink md:hover:bg-raise rounded-2xl md:rounded-t-lg'
                  }`}
                style={{
                  backgroundColor: isActive ? tab.color : undefined,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1">
        
        {/* INICIO / PORTAFOLIO TAB */}
        {activeTab === 'INICIO' && (
          <div className="flex flex-col gap-6 md:gap-8">
            <section>
              <SobreDiario />
            </section>
            <section className="bg-canvas rounded-xl p-4 md:p-6 shadow-panini border border-hair2 neumo md:bg-canvas md:shadow-panini md:border-hair2">
              <Portafolio userId={userId} />
            </section>
          </div>
        )}

        {/* MERCADO TAB */}
        {activeTab === 'MERCADO' && (
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 md:gap-8">
              <div className="bg-canvas rounded-xl p-4 md:p-6 shadow-panini border border-hair2 neumo md:bg-canvas md:shadow-panini md:border-hair2">
                <Eyebrow className="block mb-6 text-[var(--color-panini-blue)] border-b border-hair2 pb-2">TOP 10 SELECCIONES</Eyebrow>
                <Top10Chart />
              </div>
              <div className="bg-canvas rounded-xl p-4 md:p-6 shadow-panini border border-hair2 neumo md:bg-canvas md:shadow-panini md:border-hair2">
                <Eyebrow className="block mb-6 text-[var(--color-panini-red)] border-b border-hair2 pb-2">ZONA DE RIESGO (PEORES 5)</Eyebrow>
                <Top5Peores />
              </div>
            </div>
          </div>
        )}

        {/* PARTIDOS TAB */}
        {activeTab === 'PARTIDOS' && (
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-canvas rounded-xl p-4 md:p-6 shadow-panini border border-hair2 neumo md:bg-canvas md:shadow-panini md:border-hair2">
                <Eyebrow className="block mb-6 text-[var(--color-panini-orange)] border-b border-hair2 pb-2">PRÓXIMO PARTIDO EN JUEGO</Eyebrow>
                <ProximoPartido />
              </div>
              <div className="bg-canvas rounded-xl p-4 md:p-6 shadow-panini border border-hair2 neumo md:bg-canvas md:shadow-panini md:border-hair2">
                <Eyebrow className="block mb-6 text-[var(--color-panini-mint)] border-b border-hair2 pb-2">PRÓXIMAS FECHAS</Eyebrow>
                <ProximasFechas />
              </div>
            </div>
            <div className="bg-canvas rounded-xl p-4 md:p-6 shadow-panini border border-hair2 neumo md:bg-canvas md:shadow-panini md:border-hair2">
              <UltimosResultados userId={userId} />
            </div>
          </div>
        )}

        {/* HISTORIAL TAB */}
        {activeTab === 'HISTORIAL' && (
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="bg-canvas rounded-xl p-4 md:p-6 shadow-panini border border-hair2 neumo md:bg-canvas md:shadow-panini md:border-hair2">
              <Eyebrow className="block mb-6 text-[var(--color-panini-purple)] border-b border-hair2 pb-2">HISTORIAL COMPLETO DE PARTIDOS</Eyebrow>
              <HistorialSeleccion />
            </div>
          </div>
        )}

        {/* RANKING TAB */}
        {activeTab === 'RANKING' && (
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="bg-canvas rounded-xl p-4 md:p-6 shadow-panini border border-hair2 max-w-3xl mx-auto w-full neumo md:bg-canvas md:shadow-panini md:border-hair2">
              <Eyebrow className="block mb-6 text-[var(--color-panini-red)] border-b border-hair2 pb-2 text-center">TABLA DE POSICIONES GLOBAL</Eyebrow>
              <RankingJugadores userId={userId} />
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
