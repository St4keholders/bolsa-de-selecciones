# 🎨 AJUSTES V3 PARA CLAUDE CODE — INYECCIÓN VISUAL MUNDIAL 2026

> **Cómo usar:** Pásale el bloque grande de código de abajo a Claude Code DESPUÉS de correr `MIGRATION_V3.sql` en Supabase.

---

```
═══════════════════════════════════════════════════════════════
AJUSTES V3 — INYECCIÓN VISUAL MUNDIAL 2026 + CAMBIOS DE BACKEND
═══════════════════════════════════════════════════════════════

Ya corrí MIGRATION_V3.sql en Supabase. Los cambios de backend son:

CAMBIOS DE BACKEND YA APLICADOS:
✅ Columna mercado_selecciones.atajadas → mercado_selecciones.eficiencia
✅ Columna partidos.atajadas_local/visitante → tiros_local/visitante
✅ registrar_resultado_partido AHORA recibe:
   (partido_id_param, goles_local, goles_visitante,
    posesion_local, posesion_visitante,
    tiros_local, tiros_visitante)
   Los últimos 2 son TIROS A ARCO (no atajadas del arquero).
✅ Nueva fórmula:
   eficiencia_partido = (goles / tiros) × 100   [% de conversión]
   delta_eficiencia = round((eficiencia_partido - 50) × 0.3)
✅ 20 resultados del Mundial cargados (12-17 junio 2026):
   USA 4-1 PAR, QAT 1-1 SUI, BRA 1-1 MAR, HAI 0-1 SCO, AUS 2-0 TUR,
   GER 7-1 CUW, NED 2-2 JPN, CIV 1-0 ECU, SWE 5-1 TUN, ESP 0-0 CPV,
   BEL 1-1 EGY, KSA 1-1 URU, IRN 2-2 NZL, FRA 3-1 SEN, IRQ 1-4 NOR,
   ARG 3-0 ALG, AUT 3-1 JOR, POR 1-1 COD, ENG 4-2 CRO, GHA 1-0 PAN

═══════════════════════════════════════════════════════════════
TAREA V3-1 — Renombrar "atajadas" → "eficiencia" en TODO el frontend
═══════════════════════════════════════════════════════════════

Reemplaza en TODOS los archivos del proyecto:
- "atajadas" (variable, prop, label) → "eficiencia"
- "ATAJADAS" (label uppercase) → "EFICIENCIA"
- IconGloves (componente) → IconEficiencia (renómbralo)
  Nuevo concepto: representa la conversión de tiros a goles.
  Diseño sugerido: una diana/target con flecha en el centro
  (viewBox 24x24, stroke 1.5, currentColor, strokeLinecap round)

En el form admin de registrar resultado:
- Reemplaza "ATAJADAS DEL ARQUERO" por "TIROS A ARCO" (de cada equipo)
- Validación nueva: tiros >= goles

En la vista previa de deltas del form admin:
- Ya NO calcules atajadas × 1.5
- Ahora calcula: eficiencia_partido = (goles / tiros) × 100
  Y muestra: delta_eficiencia = round((eficiencia_partido - 50) × 0.3)

En la sección de explicación del landing (las 6 stats):
Reemplaza la descripción de ATAJADAS por:
[IconEficiencia]  EFICIENCIA  "El % de tiros que terminaron en gol.
                               Premia la puntería, castiga la falta
                               de definición."

═══════════════════════════════════════════════════════════════
TAREA V3-2 — PALETA EXTENDIDA MUNDIAL 2026
═══════════════════════════════════════════════════════════════

La paleta actual se ve PLANA. La paleta oficial del Mundial 2026 tiene
una explosión de colores en cintas geométricas. Expande tailwind.config.ts:

colors: {
  // ============ BASE ESTRUCTURAL ============
  canvas: '#FFFFFF',
  raise:  '#FAFAFA',
  ink:    '#000000',
  ink2:   '#1A1A1A',
  dim:    '#6B6B6B',
  dim2:   '#A8A8A8',
  hair:   'rgba(0,0,0,0.08)',
  hair2:  'rgba(0,0,0,0.16)',

  // ============ PALETA OFICIAL MUNDIAL 2026 ============
  // 9 colores que se usan en gradientes, cintas decorativas
  // y transiciones del landing y reveals
  mundial: {
    red:      '#DB2C39',
    orange:   '#F37121',
    yellow:   '#FCD116',
    lime:     '#D4ED31',
    mint:     '#6BCE9C',
    teal:     '#18A0B5',
    blue:     '#0055A4',
    lavender: '#B5A8D9',
    purple:   '#8A2BE2',
  },

  // ============ TOKENS SEMÁNTICOS ============
  primary: '#0055A4',      // = mundial.blue
  cta:     '#D4ED31',      // = mundial.lime
  accent:  '#DB2C39',      // = mundial.red
  accent2: '#8A2BE2',      // = mundial.purple
  success: '#059669',
  danger:  '#DB2C39',
}

Y en theme.extend agrega gradientes reutilizables:

backgroundImage: {
  'mundial-ribbon': 'linear-gradient(90deg, #DB2C39 0%, #F37121 14%, #FCD116 28%, #D4ED31 42%, #6BCE9C 56%, #18A0B5 70%, #0055A4 84%, #8A2BE2 100%)',
  'mundial-vertical': 'linear-gradient(180deg, #DB2C39 0%, #F37121 20%, #FCD116 40%, #6BCE9C 60%, #18A0B5 80%, #8A2BE2 100%)',
  'mundial-radial': 'radial-gradient(circle at center, #FCD116 0%, #F37121 30%, #DB2C39 60%, #8A2BE2 100%)',
}

═══════════════════════════════════════════════════════════════
TAREA V3-3 — COMPONENTE DECORATIVO: CintasMundialistas
═══════════════════════════════════════════════════════════════

Crea components/decorations/CintasMundialistas.tsx — un SVG decorativo
con CINTAS CURVAS de colores que emulan el logo del Mundial 2026.

Especificaciones:
- viewBox responsive (ej: 0 0 1200 400)
- Renderiza 8-10 paths SVG paralelos curvos (no rectos) con stroke
  de los colores de la paleta Mundial en orden:
  red → orange → yellow → lime → mint → teal → blue → lavender → purple
- Cada cinta: stroke-width grande (~40-60px), stroke-linecap round
- Las cintas se curvan en S o en arco amplio, dando sensación de flujo
- Las cintas agrupadas (varias siguen la misma curva con offset)
- Animación con framer-motion: las cintas se "dibujan" de izquierda
  a derecha al entrar al viewport (strokeDasharray + animate)

Props:
- variant: 'horizontal' | 'vertical' | 'radial' | 'corner'
- opacity: number (default 1)
- animated: boolean (default true, respeta prefers-reduced-motion)

USO de este componente:
- En el HERO de la landing: cinta horizontal a la mitad de la sección
- ENTRE secciones de la landing: variant='horizontal' con
  height pequeña (60-80px) como separador visual con vida
- En la sección 6 CTA final: cinta vertical en el costado izquierdo
- En la animación de revelación de carta: cinta radial expandiéndose
  desde el centro durante la fase 2

═══════════════════════════════════════════════════════════════
TAREA V3-4 — USAR LOS SVGs OFICIALES YA EN LA CARPETA
═══════════════════════════════════════════════════════════════

En la raíz del proyecto hay:
- mundial-2026-world-cup.svg → logo oficial del Mundial
- trofeo2026.svg → trofeo del Mundial

PROCEDE:
1. Muévelos a public/ si no están ahí (para que Next.js los sirva)
2. Crea wrappers React:

   components/icons/LogoMundial.tsx
   → next/image apuntando a /mundial-2026-world-cup.svg
   → props: size, className

   components/icons/Trofeo.tsx
   → mismo patrón con /trofeo2026.svg

3. USO de LogoMundial:
   - Header del dashboard (esquina superior izquierda), tamaño 32px
   - SECCIÓN 1 del landing (hero), arriba del título, tamaño 80px
   - SECCIÓN 6 del landing (CTA final), arriba del eyebrow, tamaño
     60px (invertido a blanco si el fondo es ink)

4. USO de Trofeo (CRÍTICO):
   - Esquina superior derecha de CADA CartaSeleccion del portafolio
   - Tamaño 24px, position absolute (top-3 right-3)
   - Opacidad 0.4 en estado normal
   - Opacidad 1 + scale 1.2 + tint mundial.yellow cuando la carta es
     una de las 3 con mayor valor_total del usuario (carta estrella)
   - Oculto en estado de quiebra

═══════════════════════════════════════════════════════════════
TAREA V3-5 — LOGO PROPIO DE STAKEHOLDERS (SVG custom)
═══════════════════════════════════════════════════════════════

Crea components/icons/LogoStakeholders.tsx — un logo CUSTOM en SVG
inline (no archivo, código).

Concepto: tipografía + balón estilizado:
- Una "S" mayúscula geométrica (font-display style)
- Dentro o detrás de la S, un balón estilizado con patrón
  pentágonos/hexágonos visible (3-4 paneles, no completo)
- Tilde o acento en uno de los colores Mundial (sugerido: lime u
  orange) como detalle

Especificaciones:
- viewBox 0 0 200 60 (horizontal)
- Color principal: currentColor (heredable)
- Detalle de acento: hardcoded a un color Mundial
- Limpio, geométrico, mobile-first (legible a 100px de ancho)

USO:
- Header del landing: tamaño 120px, junto al LogoMundial
- Footer del landing: tamaño 80px
- Pantallas /login y /register: arriba del título, tamaño 100px

═══════════════════════════════════════════════════════════════
TAREA V3-6 — INYECTAR LA PALETA EN LA LANDING (CRÍTICO)
═══════════════════════════════════════════════════════════════

Repasa CADA sección de la landing y agrega elementos visuales con la
paleta Mundial. La regla: "ninguna sección debe verse 100% blanco/negro".

──── SECCIÓN 1 HERO ────
- Encima del título, LogoMundial centrado, 80px
- Detrás del título, un blob abstracto SVG en mundial.lime al 8%
  opacidad (decoración orgánica, no rectangular)
- Debajo del subtítulo, CintasMundialistas variant='horizontal'
  height 80px, opacity 0.6 — separador antes de los botones
- Botón CTA "EMPEZAR A JUGAR" mantiene bg-cta verde lima text-ink
- "↓ Aprende cómo funciona" en font-mono color mundial.teal

──── SECCIÓN 2 — 3 PASOS ────
- Cada ícono de paso en un color distinto:
  PASO 1 IconEnvelope → mundial.blue
  PASO 2 IconChart → mundial.teal
  PASO 3 IconCashOut → mundial.lime (sobre fondo gradient sutil
    mundial.lime al 10% opacidad)
- El número del paso (1, 2, 3) en font-display weight 700 size 2rem
  en mundial.orange

──── SECCIÓN 3 — LAS 6 ESTADÍSTICAS ────
- Asigna un color distinto a cada ícono de stat:
  ATAQUE     → mundial.red
  CREACIÓN   → mundial.orange
  MURALLA    → mundial.blue
  REFLEJOS   → mundial.purple
  POSESIÓN   → mundial.teal
  EFICIENCIA → mundial.lime
- Fondo de sección: gradient radial muy diluido de mundial.lavender
  al 8% opacidad en el centro

──── SECCIÓN 4 — CÓMO SE MUEVEN LOS PRECIOS ────
- En el mini ejemplo (Argentina 3-1 Argelia), badges positivos en
  mundial.lime, negativos en mundial.red (no text-success/text-accent)
- Nombre "Argentina" en su color de bandera (celeste #75AADB)
- Nombre "Argelia" en su color de bandera (verde #006233)

──── SECCIÓN 5 — RIESGO Y QUIEBRA ────
- La ilustración SVG de la carta en quiebra: gran X en mundial.red
  sobre el grayscale (más impactante)
- Eyebrow "ATENCIÓN" en color mundial.red con mini triángulo a la izq

──── SECCIÓN 6 — CTA FINAL ────
- Mantén bg-ink, pero agrega CintasMundialistas variant='vertical'
  pegada al lado izquierdo (width 8% del viewport), ANIMADA en loop
  infinito ~20s (sensación de "el mundial está pasando ahora")
- Título "Recibe tus 5 cartas ahora" con cada palabra en un color:
  "Recibe" → canvas (blanco)
  "tus 5 cartas" → mundial.lime
  "ahora" → canvas con underline mundial.orange
- Botón CTA grande sigue siendo mundial.lime text-ink

──── FOOTER ────
- La hairline arriba: mini gradient mundial-ribbon height 2px,
  opacidad 0.4 (en lugar de hair2 plano)

═══════════════════════════════════════════════════════════════
TAREA V3-7 — TRANSICIONES ENTRE SECCIONES (LANDING)
═══════════════════════════════════════════════════════════════

Entre cada par de secciones consecutivas, agrega una TRANSICIÓN
VISUAL con la paleta Mundial:

- 1→2: CintasMundialistas variant='horizontal', height 100px,
  opacity 0.5, con curvatura sutil
- 2→3: bloque de transición 60px con gradient horizontal sutil de
  canvas → mundial.lavender 5% → canvas
- 3→4: CintasMundialistas variant='horizontal' INVERTED (cintas de
  derecha a izquierda)
- 4→5: bloque negro estrecho (h-2) con gradient horizontal mundial-red
- 5→6: CintasMundialistas variant='radial' saliendo del centro hacia
  arriba — efecto de "llamada de atención" antes del CTA final

Estas transiciones son las que dan VIDA al scroll. Son la analogía
visual de las cintas multicolores del logo Mundial.

═══════════════════════════════════════════════════════════════
TAREA V3-8 — ANIMACIÓN DE REVELADO DE CARTA CON PALETA MUNDIAL
═══════════════════════════════════════════════════════════════

En SobreDiario.tsx, FASE 2 (0.8s-1.4s):
- Explosión de cintas SVG saliendo del sobre hacia los 4 lados con
  los 9 colores de la paleta Mundial
- Las cintas crecen desde el centro con scale 0 → 1 y rotate -20° → 0°
- Duración: 600ms, ease-out
- Las cintas SE DESVANECEN al final de fase 3 (opacidad → 0)
- Mientras tanto los colores reales de la bandera del país obtenido
  van apareciendo en el fondo (esto ya estaba)

FASE 3 (revelación de la carta):
- Cuando aparece la carta, una mini CintasMundialistas variant='corner'
  emerge desde la esquina superior derecha (donde luego va el Trofeo)
  y se transforma en el ícono del Trofeo (coronación visual)

═══════════════════════════════════════════════════════════════
TAREA V3-9 — DASHBOARD: PARTIDOS DE HOY O PRÓXIMOS
═══════════════════════════════════════════════════════════════

En la Sección D del dashboard, la card "PRÓXIMO PARTIDO" actualmente
muestra el partido programado más cercano (que puede ser uno viejo
sin asignar). CAMBIO:

NUEVA LÓGICA del query:
1. Busca partidos con fecha = TODAY y estado='programado':
   - Si hay 1: muéstralo
   - Si hay varios: muestra el primero y agrega un sub-link
     "ver los {N} partidos de hoy →" que abre un modal o expande
     a la lista de partidos del día
2. Si no hay partidos hoy, busca el siguiente programado con
   fecha >= TODAY ordenado asc, que tenga ambos equipos asignados
3. Si tampoco hay, busca el partido programado más cercano

EXTRA — Card alternativa cuando hay múltiples partidos hoy:
- Mini lista vertical con TODOS los partidos del día
- Cada fila: hora, banderas mini, nombres, badge de fase
- Padding compacto
- Título: "HOY · {N} PARTIDOS"

Query SQL (referencia):
  SELECT p.*, ml.pais as local_pais, ml.codigo as local_codigo,
         mv.pais as visit_pais, mv.codigo as visit_codigo
  FROM partidos p
  LEFT JOIN mercado_selecciones ml ON p.equipo_local_id = ml.id
  LEFT JOIN mercado_selecciones mv ON p.equipo_visitante_id = mv.id
  WHERE p.estado = 'programado'
    AND p.fecha >= CURRENT_DATE
    AND p.equipo_local_id IS NOT NULL
    AND p.equipo_visitante_id IS NOT NULL
  ORDER BY p.fecha ASC, p.id ASC
  LIMIT 10

Filtra en frontend para separar "hoy" del resto.

═══════════════════════════════════════════════════════════════
TAREA V3-10 — LIMPIEZA Y CONSISTENCIA
═══════════════════════════════════════════════════════════════

- Verifica que NINGÚN componente todavía use "atajadas":
  grep -ri "atajadas" en todo el proyecto
  reemplaza por "eficiencia" donde aplique
- Form admin de partidos: labels "TIROS A ARCO" (no "ATAJADAS")
- En /llaves (brackets), CintasMundialistas horizontal arriba del título
- En /admin-control-panel/partidos, encima de la tabla, summary card:
  · Partidos finalizados / Total
  · Próximo partido programado
  · Selección líder del mercado actualmente
- Responsiveness de CintasMundialistas en mobile (height 40-60px)

═══════════════════════════════════════════════════════════════
RESULTADO ESPERADO
═══════════════════════════════════════════════════════════════

Después de estos cambios, la app debe sentirse:
- Más viva y colorida (especialmente la landing)
- Con identidad visual fuerte del Mundial 2026 (cintas, paleta)
- Métrica "eficiencia" reemplazando atajadas en todos lados
- Trofeo decorando cada carta
- Logo Mundial presente como elemento de branding
- Mostrando "hoy" como prioridad en el dashboard

EMPIEZA AHORA por V3-1 (rename) y V3-2 (paleta), luego sigue en orden.
Las decoraciones (V3-3 a V3-8) son las que más mueven la aguja
visualmente.
```

---

## 🎯 Resumen de lo que está en V3

| # | Tarea | Resuelve |
|---|---|---|
| V3-1 | Rename atajadas → eficiencia en frontend | Cambio de métrica |
| V3-2 | Paleta extendida (9 colores Mundial) | "Faltan colores" |
| V3-3 | Componente CintasMundialistas | Transiciones tipo logo |
| V3-4 | Usar logo Mundial + trofeo en esquina cartas | Tus 2 SVGs |
| V3-5 | LogoStakeholders custom | Logo del landing |
| V3-6 | Inyectar paleta sección por sección landing | "Más mundialista" |
| V3-7 | Transiciones de cintas entre secciones | Aestética del logo |
| V3-8 | Cintas en animación de revelado de carta | Más vivo |
| V3-9 | Partidos de hoy en dashboard | "Mostrar los de hoy" |
| V3-10 | Limpieza final | Consistencia |
