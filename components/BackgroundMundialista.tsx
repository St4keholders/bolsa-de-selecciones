"use client";

import { CintasConcentricas } from "./decorations/CintasConcentricas";

export default function BackgroundMundialista() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] bg-canvas overflow-hidden">
      {/* Eliminada la bola gris y los blobs pastel */}
      {/* Añadidas las cintas gruesas concéntricas del Mundial 2026 (100% de opacidad) */}
      <CintasConcentricas />
    </div>
  );
}
