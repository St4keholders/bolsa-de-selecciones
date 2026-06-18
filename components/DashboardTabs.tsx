"use client";

import { useState } from "react";
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

type TabType = 'INICIO' | 'MERCADO' | 'PARTIDOS' | 'HISTORIAL' | 'RANKING';

export function DashboardTabs({ userId }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('INICIO');

  const tabs: { id: TabType, label: string, color: string }[] = [
    { id: 'INICIO', label: 'MI PORTAFOLIO', color: 'var(--color-panini-mint)' },
    { id: 'MERCADO', label: 'EL MERCADO', color: 'var(--color-panini-blue)' },
    { id: 'PARTIDOS', label: 'PARTIDOS', color: 'var(--color-panini-orange)' },
    { id: 'HISTORIAL', label: 'HISTORIAL', color: 'var(--color-panini-purple)' },
    { id: 'RANKING', label: 'RANKING', color: 'var(--color-panini-red)' },
  ];

  return (
    <div className="flex flex-col flex-1 w-full max-w-[1400px] mx-auto px-5 py-6">
      
      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 mb-8 border-b-[3px] border-ink pb-4">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono font-bold tracking-widest text-sm px-6 py-3 uppercase rounded-t-lg transition-all ${
                isActive 
                  ? 'text-white shadow-panini translate-y-[-2px]' 
                  : 'bg-white text-dim border border-hair2 border-b-0 hover:text-ink hover:bg-raise shadow-none'
              }`}
              style={{ backgroundColor: isActive ? tab.color : undefined }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1">
        
        {/* INICIO / PORTAFOLIO TAB */}
        {activeTab === 'INICIO' && (
          <div className="flex flex-col gap-8">
            <section>
              <SobreDiario />
            </section>
            <section className="bg-canvas rounded-xl p-6 shadow-panini border border-hair2">
              <Portafolio userId={userId} />
            </section>
          </div>
        )}

        {/* MERCADO TAB */}
        {activeTab === 'MERCADO' && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8">
              <div className="bg-canvas rounded-xl p-6 shadow-panini border border-hair2">
                <Eyebrow className="block mb-6 text-[var(--color-panini-blue)] border-b border-hair2 pb-2">TOP 10 SELECCIONES</Eyebrow>
                <Top10Chart />
              </div>
              <div className="bg-canvas rounded-xl p-6 shadow-panini border border-hair2">
                <Eyebrow className="block mb-6 text-[var(--color-panini-red)] border-b border-hair2 pb-2">ZONA DE RIESGO (PEORES 5)</Eyebrow>
                <Top5Peores />
              </div>
            </div>
          </div>
        )}

        {/* PARTIDOS TAB */}
        {activeTab === 'PARTIDOS' && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-canvas rounded-xl p-6 shadow-panini border border-hair2">
                <Eyebrow className="block mb-6 text-[var(--color-panini-orange)] border-b border-hair2 pb-2">PRÓXIMO PARTIDO EN JUEGO</Eyebrow>
                <ProximoPartido />
              </div>
              <div className="bg-canvas rounded-xl p-6 shadow-panini border border-hair2">
                <Eyebrow className="block mb-6 text-[var(--color-panini-mint)] border-b border-hair2 pb-2">PRÓXIMAS FECHAS</Eyebrow>
                <ProximasFechas />
              </div>
            </div>
            <div className="bg-canvas rounded-xl p-6 shadow-panini border border-hair2">
              <UltimosResultados userId={userId} />
            </div>
          </div>
        )}

        {/* HISTORIAL TAB */}
        {activeTab === 'HISTORIAL' && (
          <div className="flex flex-col gap-8">
            <div className="bg-canvas rounded-xl p-6 shadow-panini border border-hair2">
              <Eyebrow className="block mb-6 text-[var(--color-panini-purple)] border-b border-hair2 pb-2">HISTORIAL COMPLETO DE PARTIDOS</Eyebrow>
              <HistorialSeleccion />
            </div>
          </div>
        )}

        {/* RANKING TAB */}
        {activeTab === 'RANKING' && (
          <div className="flex flex-col gap-8">
            <div className="bg-canvas rounded-xl p-6 shadow-panini border border-hair2 max-w-3xl mx-auto w-full">
              <Eyebrow className="block mb-6 text-[var(--color-panini-red)] border-b border-hair2 pb-2 text-center">TABLA DE POSICIONES GLOBAL</Eyebrow>
              <RankingJugadores userId={userId} />
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
