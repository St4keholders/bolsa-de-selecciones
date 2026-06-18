# 🚨 AJUSTES V5 CRÍTICOS — LA BOLSA DE SELECCIONES

> **Diagnóstico:** Las cintas actuales se ven como bandera LGBTI (7 colores en bandas paralelas) y no como el Mundial 2026 (que tiene CURVAS CONCÉNTRICAS de bloques de color). Además hay un bug de truncamiento en el footer, transiciones cortadas, y faltan: rediseño de cartas, historial completo y eliminación del branding "Stakeholders".

---

## 📋 Cómo usar este archivo

Copia TODO el bloque de código de abajo y pégalo a Claude Code en la carpeta `mundial`.

---

```
═══════════════════════════════════════════════════════════════
AJUSTES V5 CRÍTICOS — REWORK VISUAL + DASHBOARD + CARTAS
═══════════════════════════════════════════════════════════════

PROBLEMAS ACTUALES (visibles en screenshots del usuario):
- Las CintasMundialistas se ven como bandera LGBTI/pride
  (7 colores en stripes paralelos), no como el logo Mundial 2026
- Las transiciones entre secciones se ven CORTADAS abruptamente
- El logo "STAKEHOLDERS" se trunca en el footer ("STAKEHOLI...")
- Las cartas del portafolio se ven idénticas entre sí (sin tiers)
- Falta historial completo de partidos en formato lista
- El branding "STAKEHOLDERS" debe desaparecer del proyecto

═══════════════════════════════════════════════════════════════
TAREA V5-1 — REWORK COMPLETO DE CintasMundialistas
═══════════════════════════════════════════════════════════════

PROBLEMA: La implementación actual usa 7-9 stripes paralelos con todos
los colores del arco iris en secuencia. Eso es estética PRIDE/RAINBOW
flag, NO la estética del Mundial 2026.

ESTÉTICA REAL del Mundial 2026 (ver logo oficial):
- BLOQUES de UN SOLO COLOR (no gradientes ni stripes paralelos)
- CURVAS dramáticas en S o concéntricas (no líneas rectas paralelas)
- Cada "cinta" es UN bloque grueso de UN color sólido
- Las cintas se REPITEN/AGRUPAN en pares o trios del MISMO color
- Mezcla de máximo 4-5 colores por composición (no los 9 de la paleta)
- Mucho más DRAMÁTICAS y arquitectónicas, no decorativas

REESCRIBE components/decorations/CintasMundialistas.tsx así:

interface CintasMundialistasProps {
  variant: 'horizontal-flow' | 'vertical-block' | 'corner-burst' | 'radial-explosion';
  colorScheme?: 'warm' | 'cool' | 'mixed' | 'mundial-full';
  opacity?: number;
  animated?: boolean;
}

ESQUEMAS DE COLOR (NO uses los 9 colores juntos):
- 'warm':       [red, orange, yellow]  — 3-4 cintas de estos colores
- 'cool':       [teal, blue, purple, lavender]  — 4 cintas
- 'mixed':      [red, lavender, lime, purple]  — alternados
- 'mundial-full': [red, orange, lime, blue, purple]  — máximo 5

VARIANTS:

(a) 'horizontal-flow':
- 3-4 bloques curvos paralelos (NO 9 stripes finos)
- Cada bloque tiene stroke-width ~60-80px
- Curva en S muy pronunciada (no recta)
- Stroke-linecap: butt (no round) para look más architectural
- Espaciado entre cintas: ~20px

(b) 'vertical-block':
- 2-3 cintas verticales en el LADO izquierdo (sangrando del viewport)
- Como en el logo del Mundial: bloques masivos sólidos
- Pueden tener ligera curvatura en S

(c) 'corner-burst':
- 3-4 cintas saliendo de UNA esquina hacia afuera
- En abanico, no paralelas
- Curvas hacia afuera

(d) 'radial-explosion':
- 5-6 cintas saliendo del CENTRO en direcciones distintas
- Como rayos curvos
- Para usar en animación de revelado de carta

REGLAS DE IMPLEMENTACIÓN:
- NO uses los 9 colores en orden de arco iris
- Cada cinta tiene UN SOLO COLOR sólido (no gradient)
- Las cintas pueden tener un sutil drop-shadow para sensación de capa
- Usa overflow-visible en el SVG si extienden fuera del contenedor

═══════════════════════════════════════════════════════════════
TAREA V5-2 — FIX TRANSICIONES CORTADAS ENTRE SECCIONES
═══════════════════════════════════════════════════════════════

PROBLEMA visible: las CintasMundialistas entre secciones se ven cortadas
abruptamente (puedes verlo en la transición a la sección "Es como la
bolsa, pero del Mundial").

SOLUCIONES:

(a) Container con overflow-hidden:
   Cada wrapper de transición debe tener overflow-hidden vertical pero
   permitir overflow horizontal (overflow-x-visible)

(b) Las cintas deben EXTENDERSE más allá del viewport:
   El SVG viewBox debe ser más ancho que el container.
   Por ejemplo, si el container es 1200px, el viewBox del SVG puede
   ser 1600px (-200 a 1400) y las cintas entran/salen del viewport
   suavemente

(c) Padding negativo o margin del contenedor:
   En lugar de tener una sección de 100px con cintas, considera tener
   una sección de 200px con padding-y de 50px, así las cintas tienen
   espacio para "respirar"

(d) Fade-out edges:
   Aplica mask-image: linear-gradient(to right, transparent 0%,
   black 5%, black 95%, transparent 100%) al SVG para que los
   extremos se desvanezcan en lugar de cortarse

(e) Para las transiciones entre secciones de la landing:
   En lugar de UNA cinta horizontal grande, usa 2-3 cintas separadas
   verticalmente con offset, dando sensación de profundidad

═══════════════════════════════════════════════════════════════
TAREA V5-3 — ELIMINAR FOOTER COMPLETAMENTE + REMOVER "STAKEHOLDERS"
═══════════════════════════════════════════════════════════════

PROBLEMA: El logo STAKEHOLDERS se trunca a "STAKEHOLI" en el footer
(bug visible en screenshots). Además el usuario ya no quiere usar la
marca "Stakeholders" por ahora.

ACCIONES:

(a) ELIMINA el footer completo de la landing page
    - Borra el componente Footer / div del footer en app/page.tsx
    - Quita el último div con "STAKEHOLDERS · LA BOLSA"
    - No reemplaces con nada — la landing termina en la sección 6 (CTA)

(b) ELIMINA toda mención de "STAKEHOLDERS" en TODO el proyecto:
    - Header del dashboard: cambia "STAKEHOLDERS · LA BOLSA" por
      solo "LA BOLSA DE SELECCIONES" en font-mono uppercase
    - Header del landing: igual
    - Header de pantallas /login y /register: solo
      "LA BOLSA DE SELECCIONES"
    - Header de /admin-control-panel: solo "LA BOLSA · PANEL ADMIN"
    - Pantalla de bienvenida post-registro: solo "LA BOLSA DE SELECCIONES"
    - Cualquier metadata, title, og:title: solo "La Bolsa de Selecciones"
    - El nombre del componente LogoStakeholders.tsx → renómbralo a
      LogoBolsa.tsx y rediseña como solo una "B" o un balón

(c) ELIMINA el componente LogoStakeholders del proyecto:
    - Donde se usaba, reemplaza por solo texto "LA BOLSA DE SELECCIONES"
      en font-mono uppercase tracking-widest, o por LogoMundial (el
      ícono del Mundial 2026)

═══════════════════════════════════════════════════════════════
TAREA V5-4 — SISTEMA DE TIERS PARA CARTAS (Bronze / Silver / Gold)
═══════════════════════════════════════════════════════════════

PROBLEMA: Todas las cartas se ven idénticas. Necesitan distinción visual
según el valor_total de la selección para crear emoción ("¡me salió
una carta DORADA!").

SISTEMA DE 3 TIERS:

  BRONCE (valor_total < 500)
  PLATA  (500 <= valor_total < 900)
  ORO    (valor_total >= 900)

Crea lib/cardTiers.ts con:

  export type CardTier = 'bronce' | 'plata' | 'oro';
  
  export function getTier(valorTotal: number): CardTier {
    if (valorTotal >= 900) return 'oro';
    if (valorTotal >= 500) return 'plata';
    return 'bronce';
  }
  
  export const tierConfig = {
    bronce: {
      label: 'COMÚN',
      gradient: 'gradient con flag colors tenue (lo que ya tienes)',
      borderColor: 'transparent o hair2',
      borderWidth: 1,
      glow: false,
      trophyColor: 'currentColor',
      shimmer: false,
    },
    plata: {
      label: 'PLATA',
      gradient: 'linear-gradient(135deg, #E8E8E8 0%, [flag.primary]20 50%, #F5F5F5 100%)',
      borderColor: '#C0C0C0',
      borderWidth: 2,
      glow: true,  // box-shadow plateado sutil
      glowColor: 'rgba(192,192,192,0.4)',
      trophyColor: '#A8A8A8',
      shimmer: true,  // animación shimmer sutil
    },
    oro: {
      label: 'ORO',
      gradient: 'linear-gradient(135deg, #FCD116 0%, [flag.primary]30 50%, #F37121 100%)',
      borderColor: '#D4A017',  // golden border
      borderWidth: 3,
      glow: true,  // box-shadow dorado más pronunciado
      glowColor: 'rgba(252,209,22,0.5)',
      trophyColor: '#FCD116',
      shimmer: true,  // shimmer más intenso
      animatedBadge: true,  // badge "ORO" pulsando suave
    }
  };

REDISEÑO de CartaSeleccion.tsx para implementar tiers:

ESTRUCTURA NUEVA (basada en tarjetas Panini-style del Mundial):

```
┌──────────────────────────────────┐
│ [CODIGO]              [TROFEO]   │  ← Header sutil
│                                  │
│        [LOGO MUNDIAL]            │  ← Centrado, prominente (60px)
│        [con bandera atrás]       │
│                                  │
│           PAIS                   │  ← Nombre grande
│        ────────                  │
│       [TIER BADGE]               │  ← COMÚN / PLATA / ORO
│                                  │
│  ATAQUE       83  CREACIÓN  73   │
│  MURALLA      55  REFLEJOS  70   │  ← 6 stats grid 2x3
│  POSESIÓN     37  EFICIENCIA 12  │
│                                  │
│     VALOR TOTAL                  │
│        330                       │  ← Display grande
│                                  │
│  [    LIQUIDAR    ]              │
└──────────────────────────────────┘
```

CAMBIOS visuales por tier:

BRONCE:
- Fondo: gradientTenue actual del país
- Sin efectos especiales
- Tier badge: bg-canvas border-1 hair2, text-dim, font-mono "COMÚN"
- Trofeo en esquina: opacity 0.4

PLATA:
- Fondo: gradient plateado mezclado con colores tenues del país
- Border 2px color plata #C0C0C0
- box-shadow sutil 0 4px 12px rgba(192,192,192,0.3)
- Tier badge: bg-gradient-to-r de #E8E8E8 a #C0C0C0, text-ink2
  font-mono "PLATA" con tracking-wider
- Trofeo en esquina: color #A8A8A8 + scale 1.1
- Shimmer animation: una línea diagonal de brillo que pasa cada 4s
  (use framer-motion con backgroundPosition animado)

ORO:
- Fondo: gradient dorado #FCD116 → flag.primary 30% → #F37121
- Border 3px color dorado #D4A017
- box-shadow 0 6px 20px rgba(252,209,22,0.4) (glow dorado)
- Tier badge: bg-gradient-to-r de #FCD116 a #F37121, text-ink
  font-mono "ORO" con tracking-widest, weight 700, pequeño pulse
- Trofeo en esquina: color #FCD116 + scale 1.2 + glow effect
- Shimmer animation: más intenso, cada 3s
- Optional: pequeñas estrellas/sparkles decorativas en las esquinas

ESTADO QUIEBRA (cualquier tier):
- Override del gradient: gris grayscale
- Tier badge: oculto
- Trofeo: oculto
- "EN QUIEBRA" en text-accent sobre el contenido

═══════════════════════════════════════════════════════════════
TAREA V5-5 — DASHBOARD MÁS INTUITIVO + HISTORIAL COMPLETO
═══════════════════════════════════════════════════════════════

PROBLEMA: El dashboard tiene mucho espacio vacío y las secciones se
sienten desconectadas. Además falta un historial completo de partidos.

CAMBIO 1 — REORGANIZACIÓN del dashboard con NAVEGACIÓN POR TABS arriba:

Justo debajo del Header (puntos + ranking + salir), agrega un nav
sticky horizontal con tabs:

  [INICIO] [MI PORTAFOLIO] [MERCADO] [PARTIDOS] [LLAVES]

- Estilo: font-mono uppercase tracking-widest weight 500
- Tab activo: text-primary con border-b-2 primary
- Tabs inactivos: text-dim, hover text-ink
- Scroll suave a la sección correspondiente al hacer click
- También funciona como scroll-spy (se marca el tab activo según
  qué sección está visible)

Cada tab corresponde a una sección del dashboard:
- INICIO: Header + Sobre Diario (lo que ya hay arriba)
- MI PORTAFOLIO: La grilla de cartas activas del usuario
- MERCADO: Top 10 + Próximo Partido + Top 5 peores
- PARTIDOS: Últimos resultados + Historial completo (NUEVO)
- LLAVES: Link a /llaves (o sub-vista embebida)

CAMBIO 2 — NUEVA SECCIÓN: HISTORIAL COMPLETO DE PARTIDOS

Crea components/HistorialCompleto.tsx con:

Header: eyebrow "EL TORNEO EN ORDEN" + título "Historial de partidos"

Filtros sticky arriba (sub-header):
- Tabs: [TODOS] [JUGADOS] [PROGRAMADOS]
- Dropdown: filtrar por Fase (Todos / Grupos / Dieciseisavos / etc.)
- Dropdown: filtrar por Grupo (A, B, C, D, E, F, G, H, I, J, K, L)
- Search input: buscar por nombre de país

Lista vertical de TODOS los partidos:
- Agrupados por fecha (header de fecha sticky por grupo)
- Cada fila de partido:
  - Hora (si aplica) o icono de calendario
  - Banderas mini (círculos con gradient del país)
  - Nombre equipo local + código
  - Marcador grande "1 - 1" (si finalizado) o "VS" (si programado)
  - Nombre equipo visitante + código
  - Badge de fase a la derecha (color por fase: grupos=blue,
    eliminatorios=purple, final=red)
  - Badge de estado: "FINALIZADO" (success) o "PROGRAMADO" (dim)
    o "REPROGRAMADO" (accent) si fecha cambió recientemente
- Click en fila: expande detalles (posesión, tiros, estadísticas)

Query inicial:
  SELECT p.*, 
         ml.pais as local_pais, ml.codigo as local_codigo,
         mv.pais as visit_pais, mv.codigo as visit_codigo
  FROM partidos p
  LEFT JOIN mercado_selecciones ml ON p.equipo_local_id = ml.id
  LEFT JOIN mercado_selecciones mv ON p.equipo_visitante_id = mv.id
  ORDER BY p.fecha ASC, p.id ASC

Paginación: 20 partidos por página o scroll infinito.

CAMBIO 3 — MEJORAR la sección PRÓXIMO PARTIDO:

El query debe filtrar por fecha >= CURRENT_DATE y mostrar:
- Si hay partidos HOY: muestra todos los de hoy en una lista
- Si no hay hoy: muestra solo el próximo programado

Diseño:
- Card grande con la fecha "HOY · 17 JUN 2026" en font-display
- Lista de 1-N partidos del día
- Cada uno: banderas, nombres, badge de fase, hora aproximada

═══════════════════════════════════════════════════════════════
TAREA V5-6 — APLICAR LAS CINTAS REWORKEADAS EN LANDING
═══════════════════════════════════════════════════════════════

Después de reescribir CintasMundialistas (V5-1), aplícalas en la landing
con sentido arquitectónico, NO como decoración rainbow:

SECCIÓN 1 HERO:
- ELIMINA la cinta rainbow actual entre el subtítulo y los botones
- En su lugar: 2 cintas variant='horizontal-flow' colorScheme='warm'
  con altura 60px cada una, ligeramente desplazadas (overlap parcial)
- Una sola línea horizontal en mundial.lime al 30% opacity como
  separador minimalista

TRANSICIÓN HERO → SECCIÓN 2 (3 PASOS):
- ELIMINA la cinta rainbow gigante que se ve cortada
- En su lugar: variant='horizontal-flow' colorScheme='mixed' con
  height 120px, animated=true
- Wrapper con overflow-x-visible y mask-image fade en los extremos

TRANSICIÓN SECCIÓN 2 → SECCIÓN 3 (6 STATS):
- variant='horizontal-flow' colorScheme='cool', height 80px
- Cintas curvándose en dirección OPUESTA (espejada) a la transición
  anterior para crear ritmo visual

TRANSICIÓN SECCIÓN 3 → SECCIÓN 4 (MERCADO):
- variant='horizontal-flow' colorScheme='warm' (volvemos a cálidos)
- height 100px

TRANSICIÓN SECCIÓN 4 → SECCIÓN 5 (RIESGO):
- variant='horizontal-flow' SOLO en mundial.red (única cinta gruesa)
- height 60px — anuncio visual del peligro

TRANSICIÓN SECCIÓN 5 → SECCIÓN 6 (CTA FINAL):
- variant='radial-explosion' colorScheme='mundial-full'
- height 200px, las cintas emergen del centro hacia arriba
- Animadas con stagger

SECCIÓN 6 (CTA FINAL, fondo negro):
- ELIMINA la cinta vertical actual que se ve fea/cortada
- En su lugar: variant='vertical-block' colorScheme='mixed' pegada
  al borde IZQUIERDO con width 8% del viewport
- Las cintas son BLOQUES gruesos de UN solo color cada uno (no
  gradientes), 3 cintas máximo
- Animación: cintas hacen un loop infinito muy lento de translateY
  sutil (-20px → 0 → -20px en 20s) — sensación de respiración

═══════════════════════════════════════════════════════════════
TAREA V5-7 — INYECCIÓN DE COLOR FINAL EN DASHBOARD
═══════════════════════════════════════════════════════════════

En el dashboard (estando logueado):
- El badge "#N GLOBAL" ya está en verde lima ✅ (mantenerlo)
- El link "VER LLAVES DEL TORNEO" en bg-mundial.blue (no transparente)
- El ícono del sobre cuando está bloqueado: tint mundial.lavender al
  60% opacity (no gris plano)
- El countdown HH:MM:SS: cuando faltan menos de 1 hora, cambiar a
  color mundial.orange con un pulse sutil (efecto de urgencia)
- Cuando faltan menos de 5 minutos: color mundial.red con pulse rápido
- Las cartas del portafolio: aplicar tier system (V5-4)

═══════════════════════════════════════════════════════════════
TAREA V5-8 — VERIFICACIÓN Y LIMPIEZA
═══════════════════════════════════════════════════════════════

Antes de terminar, verifica:

[ ] No queda ninguna referencia a "STAKEHOLDERS" en el código fuente
    (grep -ri "stakeholders" debe devolver 0 resultados o solo
     comentarios histórticos)
[ ] No hay footer en la landing (la página termina en CTA)
[ ] Las CintasMundialistas YA NO se ven como bandera LGBTI
    (son bloques curvos de uno o pocos colores)
[ ] Las transiciones entre secciones no se ven cortadas
[ ] Las cartas tienen 3 tiers visualmente distinguibles
[ ] El historial completo está accesible desde el dashboard
[ ] El dashboard tiene nav por tabs arriba para fácil orientación
[ ] Mobile (375px): cintas reducidas, tabs scrolleable horizontal
[ ] Test end-to-end: logout → landing → register → dashboard con tabs

═══════════════════════════════════════════════════════════════
PRIORIDAD DE EJECUCIÓN
═══════════════════════════════════════════════════════════════

1. PRIMERO V5-3 (eliminar STAKEHOLDERS) — rápido y desbloquea testing
2. V5-1 + V5-2 (cintas y transiciones) — el problema visual #1
3. V5-4 (tiers de cartas) — el cambio más vistoso
4. V5-5 (dashboard + historial) — el más extenso
5. V5-6 + V5-7 (color injection refinada) — pulido
6. V5-8 (limpieza) — al final

EMPIEZA AHORA por V5-3.
```

---

## 🎯 Resumen de qué arregla este V5

| Problema en screenshot | Tarea V5 |
|---|---|
| Cintas se ven como bandera LGBTI | V5-1 (rework completo de CintasMundialistas) |
| Transiciones cortadas entre secciones | V5-2 (overflow + mask fade) |
| Footer truncado "STAKEHOLI" | V5-3 (eliminar footer + branding) |
| Cartas todas iguales sin niveles | V5-4 (tiers Bronce/Plata/Oro) |
| Dashboard no intuitivo, sin historial | V5-5 (tabs + historial completo) |
| Faltan colores Mundial bien aplicados | V5-6 + V5-7 |

## ⚠️ Lo más importante

El cambio #1 más impactante es **V5-1**: las cintas actuales son literalmente un arco iris en franjas (estética PRIDE). El Mundial 2026 usa **bloques curvos masivos de un solo color cada uno**, agrupados en composiciones de 3-5 colores como máximo. Si Claude Code no entiende esta diferencia, dile que mire la imagen del logo Mundial 2026 que ya está en `public/mundial-2026-world-cup.svg` para inspirarse.

¡Pásale el bloque entero a Claude Code y avísame cuando termine V5-3 (el rápido) para que ya puedas testear sin el branding viejo! 🚀
