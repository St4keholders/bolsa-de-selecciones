# 🚀 EXPANSIÓN V2 — LA BOLSA DE SELECCIONES

> Este documento expande el proyecto original con: 48 equipos del Mundial 2026, sistema de partidos, actualización automática de stats, nuevas vistas (brackets, top, historial) y nueva paleta visual.

---

## 📑 ÍNDICE

1. [Resumen de cambios](#1-resumen-de-cambios)
2. [Paso 1 — Correr la migración SQL](#paso-1--correr-la-migración-sql-v2)
3. [Nueva paleta de colores V2](#2-nueva-paleta-de-colores-v2)
4. [Rediseño de cartas](#3-rediseño-de-cartas)
5. [Sistema de partidos y stats automáticas](#4-sistema-de-partidos-y-stats-automáticas)
6. [Nuevas vistas del usuario](#5-nuevas-vistas-del-usuario)
7. [Nuevo panel de administrador](#6-nuevo-panel-de-administrador)
8. [PROMPT FINAL para Claude Code](#7-prompt-final-para-claude-code)

---

## 1. RESUMEN DE CAMBIOS

| Antes (V1) | Ahora (V2) |
|---|---|
| 32 selecciones genéricas | 48 selecciones reales del Mundial 2026 |
| 4 stats (ataque, creación, muralla, reflejos) | **6 stats** (+ posesión, atajadas) |
| Admin edita stats manualmente | Admin registra **resultados de partidos** → stats se actualizan en automático |
| Sin estructura de torneo | **99 partidos** cargados (fase de grupos + eliminatorias) |
| Cartas: solo nombre + banda de color | Cartas: fondo completo con colores de bandera + SVG temático + las 6 stats visibles |
| Sin brackets ni historial | Vista de **brackets**, **top 10**, **top 5 peores**, **historial por selección**, **fixtures próximos** |
| Paleta neutra blanca/negra | Paleta oficial Mundial 2026 (blanco + azul #0055A4 + verde lima #D4ED31 + rojo + morado) |

---

## PASO 1 — CORRER LA MIGRACIÓN SQL V2

> Abre el SQL Editor en Supabase, pega el contenido completo del archivo **`MIGRATION_V2.sql`** (que te entregué junto con este doc) y dale Run.

⚠️ La migración hace lo siguiente:
- Borra los 32 equipos anteriores y todos los portafolios existentes (¡vas a empezar el juego con borrón y cuenta nueva!)
- Agrega columnas `codigo`, `grupo`, `posesion`, `atajadas` a `mercado_selecciones`
- Recalcula `valor_total` para incluir las 6 stats
- Inserta los 48 equipos reales del Mundial 2026 con stats iniciales por tier
- Crea la tabla `partidos` con los 99 partidos del torneo
- Crea 2 nuevos RPCs: `registrar_resultado_partido()` y `asignar_equipos_a_partido()`
- Habilita Realtime en `partidos`
- Marca como deprecada la antigua `actualizar_stats_seleccion()`

### Verificar después de correr

```sql
SELECT COUNT(*) FROM mercado_selecciones;  -- debe dar 48
SELECT COUNT(*) FROM partidos;             -- debe dar 99
SELECT fase, COUNT(*) FROM partidos GROUP BY fase;
-- grupos: 67, dieciseisavos: 16, octavos: 8, cuartos: 4, semis: 2, tercer_puesto: 1, final: 1
```

> 💡 Nota: el Excel original tiene 67 partidos de fase de grupos (no los 72 teóricos = 12 grupos × 6). Si quieres completar los 5 faltantes después, puedes agregarlos manualmente o pedírmelo.

---

## 2. NUEVA PALETA DE COLORES V2

Reemplaza completamente la paleta anterior. En `tailwind.config.ts`:

```ts
colors: {
  // Fondos y estructura
  canvas: '#FFFFFF',        // Blanco principal
  raise:  '#FAFAFA',        // Superficies muy levemente elevadas
  
  // Texto
  ink:    '#000000',        // Texto principal (negro puro)
  ink2:   '#1A1A1A',        // Texto secundario (gris muy oscuro)
  dim:    '#6B6B6B',        // Texto terciario / labels
  dim2:   '#A8A8A8',        // Placeholders / texto desactivado
  
  // Acentos OFICIALES Mundial 2026
  primary: '#0055A4',       // Azul brillante — botones primarios, enlaces
  cta:     '#D4ED31',       // Verde lima — CTAs destacados, conversión
  accent:  '#EE324E',       // Rojo vibrante — notificaciones, alertas, danger
  accent2: '#8A2BE2',       // Morado — etiquetas especiales, badges premium
  
  // Hairlines
  hair:   'rgba(0,0,0,0.08)',
  hair2:  'rgba(0,0,0,0.16)',
  
  // Estados
  success: '#059669',       // Confirmaciones de liquidación
  danger:  '#EE324E',       // mismo que accent — botón de quiebra
}
```

### Reglas de uso

- **Botón primario** (acciones principales tipo "Guardar cambios", "Abrir sobre"): `bg-primary text-canvas`
- **Botón CTA** (acción más destacada de la pantalla, máximo 1 por vista): `bg-cta text-ink`
- **Botón danger** (quiebra, eliminación): `border border-danger text-danger`, hover `bg-danger text-canvas`
- **Badges informativos** especiales: `bg-accent2 text-canvas` (morado, para cosas raras o premium)
- **Notificaciones de error o cooldown**: `text-accent`
- **El verde lima `#D4ED31`** es muy intenso: úsalo solo cuando quieras que el ojo lo encuentre primero. No abuses.

---

## 3. REDISEÑO DE CARTAS

### Estructura visual de cada carta

```
┌────────────────────────────────┐
│ [GRADIENTE COMPLETO DE BANDERA │  ← Toda la carta usa los colores
│  EN TONO PASTEL/SUAVE]         │     del país (no solo una banda)
│                                │     en variante TENUE para no
│        ARG                     │     interferir con la legibilidad
│     ┌─────────┐                │
│     │  SVG    │                │  ← SVG temático único por país
│     │  ART    │                │     (escudo estilizado, símbolo
│     └─────────┘                │     patrio, etc.)
│                                │
│     ARGENTINA                  │  ← Nombre del país en display
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━   │  ← Hairline divisor
│                                │
│  ⚔ ATAQUE      245             │
│  ✨ CREACIÓN    245             │  ← 6 stats con íconos SVG
│  🛡 MURALLA     250             │     y valores en display
│  👁 REFLEJOS    250             │
│  ⚽ POSESIÓN     58             │
│  🧤 ATAJADAS     32             │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                │
│        VALOR TOTAL             │
│           1,180                │
│                                │
│  [   LIQUIDAR   ]              │
└────────────────────────────────┘
```

### Reglas críticas

- **Fondo de la carta:** gradient sutil con los colores REALES de la bandera del país. Por ejemplo, Colombia: gradiente vertical de amarillo claro (#FCD11650) → azul claro (#00389350) → rojo claro (#CE112650), todo con opacidad/saturación reducida para que el texto se lea perfecto.
- **Versión tenue:** los colores deben mezclarse con blanco al ~70% para suavizarlos. No queremos cartas que distraigan, queremos cartas que se sientan emblemáticas.
- **Cuando la carta se revele del sobre:** primero aparece la versión SATURADA (colores completos vibrantes) durante 1 segundo, luego transiciona a la versión tenue final.
- **SVG temático único:** cada país tiene un mini-SVG art representativo. Ejemplos:
  - Argentina: sol de mayo estilizado
  - Brasil: balón con líneas de movimiento (referencia jogo bonito)
  - Inglaterra: león rampante simplificado
  - Alemania: águila estilizada
  - Francia: gallo estilizado
  - Japón: ola estilizada
  - México: águila azteca simplificada
  - Marruecos: estrella de cinco puntas
  - Senegal: estrella verde con palmera
  - Para los que sean menos icónicos: usa el escudo de su federación estilizado o las iniciales en typography muy display.

> 💡 Claude Code: si no tienes inspiración para un país específico, usa las iniciales del código (`ARG`, `BRA`, etc.) en una composición tipográfica fuerte en font-display weight 700 size grande. Lo importante es que **ningún país se vea genérico**.

### Estado de quiebra de carta

- Fondo: gris #E5E5E5 sólido, sin gradiente de bandera (perdió su identidad).
- Todo en grayscale.
- "EN QUIEBRA" en font-mono color accent (#EE324E) sobre el SVG art.
- Valor total: "0 PTS" font-display weight 700 color dim.
- Botón Liquidar: disabled, gris.

---

## 4. SISTEMA DE PARTIDOS Y STATS AUTOMÁTICAS

### Cómo cambian las stats al cerrar un partido

Cuando el admin registra el resultado de un partido, la RPC `registrar_resultado_partido()` aplica estos **deltas** automáticamente a ambos equipos:

| Stat | Equipo Local | Equipo Visitante |
|------|-------------|------------------|
| **Ataque** | `+8` por cada gol anotado; `-4` si no anotó | igual |
| **Creación** | `(posesion_local - 50) × 0.4` (redondeado) | `(posesion_visitante - 50) × 0.4` |
| **Muralla** | `+6` si valla en cero; `-5` por cada gol recibido | igual |
| **Reflejos** | `+10` si ganó, `+3` si empató, `-5` si perdió | igual (inverso) |
| **Posesión** | `(posesion_local - 50) × 0.2` (media móvil) | `(posesion_visitante - 50) × 0.2` |
| **Atajadas** | `+1.5 × atajadas_del_arquero` | igual |

> **Clamp:** ningún stat puede ser negativo (clamp en 0). Posesión también clamp en 100.

### Ejemplo real

Argentina vs Argelia, resultado: Argentina 3 - Argelia 1, posesión 65%/35%, atajadas 2 y 5.

**Argentina (local):**
- Ataque: +24 (3 goles × 8)
- Creación: +6 ((65-50) × 0.4)
- Muralla: -5 (1 gol recibido)
- Reflejos: +10 (ganó)
- Posesión: +3 ((65-50) × 0.2)
- Atajadas: +3 (2 × 1.5)
- **Total cambio: +41**

**Argelia (visitante):**
- Ataque: +8 (1 gol × 8)
- Creación: -6 ((35-50) × 0.4)
- Muralla: -15 (3 goles recibidos, sin valla en cero)
- Reflejos: -5 (perdió)
- Posesión: -3
- Atajadas: +8 (5 × 1.5)
- **Total cambio: -13**

### Lo que ve el usuario en su portafolio

Si el usuario tiene una carta de Argentina en su portafolio:
- Después de finalizar el partido, los stats de su carta aumentan automáticamente (Realtime push)
- El **valor_total** se recalcula solo (es columna GENERATED)
- Una animación sutil indica "+41" sobre la carta durante 2 segundos

---

## 5. NUEVAS VISTAS DEL USUARIO

El dashboard debe extenderse con estas secciones. Mantén las 3 originales (Header, Sobre, Portafolio) y añade scroll vertical para las nuevas.

### Sección D — Top 10 + Próximo partido

Layout: **2 columnas en desktop, apiladas en mobile**.

**Izquierda (60%):** Gráfica horizontal de barras de las 10 selecciones con mayor `valor_total`. Cada barra:
- Color: gradiente sutil con los 2 colores principales de la bandera del país
- Label: código de 3 letras + valor numérico al final de la barra
- Animación: las barras crecen de izquierda a derecha al cargar (stagger 50ms)
- Click en barra: scroll a la Sección E con esa selección filtrada

**Derecha (40%):** Card del **PRÓXIMO PARTIDO** (el partido programado más cercano por fecha):
- Eyebrow mono: "PRÓXIMO PARTIDO" + fecha en formato `28 JUN 2026`
- Banderas de los 2 equipos (SVG art o iniciales) lado a lado, con "VS" en el medio
- Nombres de los equipos en display
- Fase del torneo (badge): "GRUPO A", "DIECISEISAVOS", etc.

### Sección E — Top 5 Peores

Lista compacta de las 5 selecciones con menor `valor_total`. Cada item es una fila con:
- Posición (#48, #47, ...)
- Mini bandera (cuadrado con los colores)
- Nombre del país
- Valor total (en font-display, color dim)
- Click → abre la Sección F con esa selección seleccionada

### Sección F — Historial por Selección

Componente con:

**Header:** Dropdown grande para seleccionar país (de las 48). Estilo Apple: solo border-bottom hair2, padding generoso. Muestra la bandera + nombre seleccionado.

**Cuerpo (al seleccionar):**
1. **Stats actuales** en grid 3x2 (las 6 stats), con su valor total grande arriba.
2. **Historial de partidos jugados** (estado='finalizado' donde participe):
   - Tabla minimalista con hairlines
   - Columnas: Fecha · Rival · Resultado · Δ Valor (con color: verde si subió, rojo si bajó)
   - Ordenada por fecha desc

### Sección G — Próximas Fechas del Mundial

Toggle/tab adicional dentro de Sección F (o sección aparte si prefieres):

**Vista de fixtures:**
- Lista de los próximos 10 partidos programados (estado='programado')
- Agrupados por fecha
- Cada partido: hora (si existe), banderas, nombres, fase
- Si es eliminatorio sin equipo aún definido, muestra la dependencia ("Ganador 73 vs Ganador 75")

### Sección H — Llaves del torneo (Brackets)

Una pantalla aparte (`/llaves` o `/brackets`):

**Layout horizontal scrolleable:**
- 5 columnas: Dieciseisavos | Octavos | Cuartos | Semis | Final
- Cada columna muestra los partidos de esa fase, conectados visualmente con líneas finas (1px hair2) que indican cómo avanza el ganador a la siguiente fase
- Si el partido tiene equipos asignados, muestra banderas + resultado
- Si no, muestra la dependencia ("Ganador 73 vs Ganador 75")
- Partidos finalizados: marcados con check verde sutil
- Mobile: stack vertical con scroll horizontal solo dentro de cada fase

> 💡 Para mobile, las llaves son difíciles de visualizar. Considera presentar una vista alternativa de "fase por fase" con un selector arriba.

---

## 6. NUEVO PANEL DE ADMINISTRADOR

> **Cambio crítico:** el admin YA NO edita stats manualmente. Sus tres responsabilidades nuevas son:
> 1. Registrar resultados de partidos (esto mueve stats en automático)
> 2. Asignar equipos a partidos eliminatorios cuando se determinen
> 3. Declarar quiebras (esta funcionalidad se mantiene de V1)

### Sub-página 1: Panel de Partidos (`/admin-control-panel/partidos`)

Layout editorial con filtros arriba:
- Tabs: `Programados` / `Finalizados` / `Todos`
- Filtros: Fase (dropdown), Fecha (rango)
- Tabla de partidos:
  - ID · Fecha · Fase · Local · Visitante · Resultado · Estado
- Click en una fila → abre un modal/drawer con el formulario de resultado

### Formulario de Resultado de Partido

Modal o drawer lateral con:

**Header:** "Registrar resultado · {fase} · {fecha}"
**Equipos:** mostrados como dos cards lado a lado con las banderas, en el medio un "VS" o el resultado parcial.

**Inputs (en grid 2 columnas, una por equipo):**

```
GOLES                GOLES
[  2  ]              [  1  ]

POSESIÓN (%)         POSESIÓN (%)
[ 58  ]              [ 42  ]

ATAJADAS DEL ARQUERO ATAJADAS DEL ARQUERO
[  3  ]              [  6  ]
```

**Validaciones (lado cliente):**
- Goles no negativos
- Posesión local + visitante = 100
- Atajadas no negativas

**Vista previa de impacto (en vivo):**
Debajo del form, una sección que dice "Cambios que se aplicarán:" y muestra las 6 stats × 2 equipos con los deltas calculados (usando la fórmula del punto 4). Verde si +, rojo si -.

**Botón:** "GUARDAR RESULTADO" → `rpc('registrar_resultado_partido', {...})`.

Después de guardar:
- Modal de confirmación con resumen ("Argentina: +41 puntos totales / Argelia: -13")
- Cierra y refresca la tabla

### Sub-página 2: Asignación de Equipos para Llaves (`/admin-control-panel/llaves`)

Vista similar a la Sección H pero editable:
- Para cada partido eliminatorio con `equipo_local_id IS NULL` o `equipo_visitante_id IS NULL`:
  - Muestra la dependencia ("Ganador 73 vs Ganador 75")
  - Botón "Asignar equipos" → modal con 2 dropdowns
  - Llama a `rpc('asignar_equipos_a_partido', {...})`

### Sub-página 3: Quiebras (`/admin-control-panel/quiebras`)

Igual que la versión V1 — sin cambios. Lista de selecciones con búsqueda + botón danger para `declarar_quiebra()`.

### Botón "Volver al Dashboard"

Mantener el mismo del actual, arriba a la izquierda con flechita.

---

## 7. PROMPT FINAL PARA CLAUDE CODE

> Copia TODO el bloque de abajo y pásaselo a Claude Code en la carpeta `mundial`.

```
═══════════════════════════════════════════════════════════════
EXPANSIÓN V2 — LA BOLSA DE SELECCIONES
═══════════════════════════════════════════════════════════════

Vas a expandir el proyecto que ya está parcialmente construido. Lee primero
estos archivos en la carpeta:

1. DOCUMENTO_DE_REQUERIMIENTOS_TÉCNICOS.docx — PRD original (referencia base)
2. GUIA_SETUP_MUNDIAL.md — setup V1 ya ejecutado
3. PROMPT_CLAUDE_CODE.md — prompt V1 que ya construiste (parcialmente)
4. EXPANSION_V2_MUNDIAL.md — ESTE documento, contiene TODO lo nuevo
5. MIGRATION_V2.sql — ya fue ejecutado en Supabase (NO lo corras de nuevo)
6. .env.local — credenciales sin cambios

═══════════════════════════════════════════════════════════════
ESTADO ACTUAL DEL BACKEND (TODO YA EN SUPABASE, NO MODIFICAR)
═══════════════════════════════════════════════════════════════

✅ Tabla mercado_selecciones expandida:
   - Ahora con 48 equipos del Mundial 2026
   - Nuevas columnas: codigo (3 letras), grupo (A-L), posesion, atajadas
   - valor_total ahora suma las 6 stats: ataque + creacion + muralla +
     reflejos + posesion + atajadas

✅ Nueva tabla partidos con 99 partidos cargados:
   - id (TEXT, ej 'P001', 'P073'), fase, grupo, fecha, equipo_local_id,
     equipo_visitante_id, dependencia_local, dependencia_visitante,
     goles_local, goles_visitante, posesion_local, posesion_visitante,
     atajadas_local, atajadas_visitante, estado, finalizado_at
   - fases: 'grupos', 'dieciseisavos', 'octavos', 'cuartos', 'semis',
     'tercer_puesto', 'final'

✅ Nuevas RPCs (úsalas con supabase.rpc()):
   - registrar_resultado_partido(partido_id_param TEXT,
       goles_local_param INT, goles_visitante_param INT,
       posesion_local_param INT, posesion_visitante_param INT,
       atajadas_local_param INT, atajadas_visitante_param INT)
     → Solo admin. Actualiza stats de ambos equipos según fórmula.
       Retorna { success, partido_id, deltas: { local: {...}, visitante: {...} } }

   - asignar_equipos_a_partido(partido_id_param TEXT,
       equipo_local_id_param INT, equipo_visitante_id_param INT)
     → Solo admin. Para partidos eliminatorios con dependencias.

✅ RPCs que se mantienen del V1:
   - abrir_sobre_diario(), liquidar_carta(), declarar_quiebra()
   - actualizar_stats_seleccion (DEPRECADA — no la uses para nada nuevo)

✅ Realtime habilitado en: usuarios, mercado_selecciones, portafolio, partidos

═══════════════════════════════════════════════════════════════
TUS TAREAS — EN ORDEN
═══════════════════════════════════════════════════════════════

TAREA 1 — Actualizar paleta y tokens visuales
─────────────────────────────────────────────
En tailwind.config.ts, REEMPLAZA la paleta anterior por la del Mundial 2026:
- canvas #FFFFFF, raise #FAFAFA
- ink #000000, ink2 #1A1A1A, dim #6B6B6B, dim2 #A8A8A8
- primary #0055A4 (azul), cta #D4ED31 (verde lima),
  accent #EE324E (rojo), accent2 #8A2BE2 (morado)
- hair rgba(0,0,0,0.08), hair2 rgba(0,0,0,0.16)
- success #059669, danger #EE324E

Reglas: primary para botones principales, cta SOLO para el botón más
importante de cada vista (máx 1), accent para errores/danger,
accent2 para badges especiales.

TAREA 2 — Reescribir lib/countries.ts con las 48 selecciones
────────────────────────────────────────────────────────────
Para cada uno de los 48 equipos del Mundial 2026, define:
{
  id: number,         // 1-48 (coincide con mercado_selecciones.id)
  nombre: string,
  codigo: string,     // 3 letras: ARG, BRA, FRA, etc.
  grupo: string,      // A-L
  colores: {
    primary: string,  // hex del color dominante de la bandera
    secondary: string,
    accent: string,
  },
  gradientTenue: string,   // gradient lineal con los 3 colores mezclados con
                           // blanco al 70% para fondo de cartas
  gradientFull: string,    // gradient con colores saturados (para reveal)
  svgArt: 'tipo'           // identificador del SVG temático (ver TAREA 3)
}

IMPORTANTE — el orden y los IDs deben coincidir con la BD:
1=México, 2=Sudáfrica, 3=Corea del Sur, 4=Chequia, 5=Canadá,
6=Bosnia y Herzegovina, 7=Qatar, 8=Suiza, 9=Brasil, 10=Marruecos,
11=Escocia, 12=Haití, 13=Estados Unidos, 14=Paraguay, 15=Australia,
16=Turquía, 17=Alemania, 18=Curazao, 19=Costa de Marfil, 20=Ecuador,
21=Países Bajos, 22=Japón, 23=Suecia, 24=Túnez, 25=Bélgica,
26=Egipto, 27=Irán, 28=Nueva Zelanda, 29=España, 30=Cabo Verde,
31=Arabia Saudita, 32=Uruguay, 33=Francia, 34=Senegal, 35=Irak,
36=Noruega, 37=Argentina, 38=Argelia, 39=Austria, 40=Jordania,
41=Portugal, 42=RD Congo, 43=Uzbekistán, 44=Colombia, 45=Inglaterra,
46=Croacia, 47=Ghana, 48=Panamá.

Usa colores oficiales de banderas (busca en wikipedia si tienes duda).
Para gradientes tenues: cada color con suffix '40' o '50' en el alpha,
mezclado con blanco. Para gradientes full: colores al 100%.

TAREA 3 — Crear SVGs temáticos por país en components/icons/countries/
─────────────────────────────────────────────────────────────────────
Crea componentes SVG únicos (viewBox 100x100, stroke 1.5, monocromos)
para que cada carta tenga IDENTIDAD VISUAL única. Sugerencias:
- Argentina: sol de mayo (16 rayos rectos + cara)
- Brasil: balón estilizado con líneas de movimiento
- Inglaterra: león rampante simplificado
- Alemania: águila estilizada
- Francia: gallo
- España: castillo o toro
- Japón: ola estilizada (referencia Hokusai)
- México: águila azteca simplificada
- Colombia: cóndor estilizado
- Marruecos: estrella de 5 puntas con detalle
- Portugal: escudo con quinas simplificado
- Países Bajos: tulipán abstracto
- Bélgica: león rampante (variante)
- Italia: NO está en este Mundial (no hagas Italia)
- Para el resto: usa o (a) el escudo de su federación estilizado, o
  (b) las 3 letras del código en font-display weight 700 muy grandes
  como composición tipográfica fuerte.

REGLA: ningún país debe verse genérico. Si dudas entre un símbolo y la
tipografía, prefiere la tipografía con un treatment visual fuerte.

TAREA 4 — Rediseñar CartaSeleccion.tsx
──────────────────────────────────────
Estructura nueva (ver sección 3 del doc EXPANSION_V2):
- Fondo de la carta: gradientTenue del país (NO una banda superior, todo el fondo)
- Header de carta: código (3 letras) en mono uppercase tracking-widest
- SVG art temático del país (centrado, ~80px)
- Nombre del país en font-display weight 600 size 1.5rem
- Hairline divisor
- Grid de 6 stats con íconos SVG (crea IconPossession e IconSaves nuevos):
  Ataque, Creación, Muralla, Reflejos, Posesión, Atajadas
- Hairline divisor
- VALOR TOTAL grande (font-display 3rem weight 700)
- Botón LIQUIDAR (bg-primary text-canvas) o disabled si quiebra

Para realtime: suscríbete a cambios en mercado_selecciones — cuando
cambien las stats del país de una carta, anima los nuevos valores
(número que sube/baja con tween) y muestra un toast pequeño "+41" durante
2s al lado de la carta.

TAREA 5 — Animación de revelación de carta (modificar SobreDiario.tsx)
─────────────────────────────────────────────────────────────────────
Cuando se abra el sobre, la carta que aparece debe usar gradientFull
(colores saturados) durante el primer segundo, luego transicionar al
gradientTenue final. Mantén las 4 fases de animación del V1 pero ahora:
- Las stats COMPLETAS de la carta están visibles desde el inicio
  (las 6 stats, no solo nombre+banda)
- El valor total se cuenta hacia arriba desde 0 con animación tween
  durante 800ms al final

TAREA 6 — Crear las nuevas secciones del Dashboard
──────────────────────────────────────────────────
Sigue el dashboard actual (Header, Sobre, Portafolio) y añade scroll
vertical con estas nuevas secciones (ver detalle visual en secciones 5 del doc):

D. Top 10 + Próximo partido (components/Top10Chart.tsx + ProximoPartido.tsx)
E. Top 5 peores (components/Top5Peores.tsx)
F. Historial por selección (components/HistorialSeleccion.tsx)
G. Próximas fechas (tab dentro de F o componente aparte)

Para Top 10: query
   SELECT id, pais, codigo, valor_total FROM mercado_selecciones
   WHERE estado='activo' ORDER BY valor_total DESC LIMIT 10

Para Top 5 peores:
   SELECT id, pais, codigo, valor_total FROM mercado_selecciones
   WHERE estado='activo' ORDER BY valor_total ASC LIMIT 5

Para Próximo partido:
   SELECT * FROM partidos WHERE estado='programado'
   ORDER BY fecha ASC LIMIT 1

Para Historial:
   SELECT p.*, ml.pais as local_pais, mv.pais as visitante_pais
   FROM partidos p
   LEFT JOIN mercado_selecciones ml ON p.equipo_local_id = ml.id
   LEFT JOIN mercado_selecciones mv ON p.equipo_visitante_id = mv.id
   WHERE p.estado='finalizado'
     AND (p.equipo_local_id = $1 OR p.equipo_visitante_id = $1)
   ORDER BY p.fecha DESC

Para Próximas fechas:
   SELECT * FROM partidos WHERE estado='programado'
   ORDER BY fecha ASC LIMIT 10

TAREA 7 — Crear página de Brackets (app/(protected)/llaves/page.tsx)
────────────────────────────────────────────────────────────────────
Vista de bracket horizontal con 5 columnas (dieciseisavos→final).
- Desktop: scroll horizontal, columnas de ancho fijo, líneas conectoras
- Mobile: selector de fase arriba (segmented control), muestra una fase
  a la vez con scroll vertical

Cada partido es una mini-card con:
- Si tiene equipos: banderas (gradientes), nombres cortos, resultado si finalizado
- Si no tiene equipos: dependencia en font-mono dim ("Ganador 73 vs Ganador 75")
- Si finalizado: check verde sutil arriba a la derecha

Añade link "VER LLAVES" en el header sticky del dashboard para navegar acá.

TAREA 8 — Reescribir el Panel Admin (app/(protected)/admin-control-panel/)
─────────────────────────────────────────────────────────────────────────
ELIMINA el formulario actual de "editar stats". Reemplázalo por 3 secciones
en tabs o sub-rutas:

a) /admin-control-panel/partidos → Panel de Partidos
   - Tabla con filtros (estado, fase, fecha)
   - Click en partido programado → drawer/modal con form de resultado
   - Form: goles_local, goles_visitante, posesion_local, posesion_visitante,
     atajadas_local, atajadas_visitante
   - Validación cliente: goles>=0, posesion suma=100, atajadas>=0
   - Vista previa de deltas calculados EN VIVO mientras el admin teclea
     (usa la fórmula del punto 4 del doc EXPANSION_V2 para previsualizar)
   - Botón "GUARDAR RESULTADO" (variant cta — verde lima) →
     rpc('registrar_resultado_partido', {...})
   - Confirmación con resumen de cambios

b) /admin-control-panel/llaves → Asignación de Equipos
   - Lista de partidos eliminatorios con equipo_local_id NULL o
     equipo_visitante_id NULL
   - Por cada uno: muestra dependencia + botón "Asignar equipos"
   - Modal con 2 dropdowns (todas las 48 selecciones)
   - rpc('asignar_equipos_a_partido', {...})

c) /admin-control-panel/quiebras → Declarar Quiebras
   - Mantén la funcionalidad actual del V1: dropdown + botón danger +
     confirmación con escritura del nombre del país

TAREA 9 — Realtime para partidos
────────────────────────────────
Suscríbete a cambios en la tabla partidos desde el dashboard. Cuando un
partido pasa a 'finalizado':
1. Si el usuario tiene cartas de cualquiera de los 2 equipos, anima sus
   stats (ya implementado en TAREA 4)
2. Muestra una notificación flotante (toast) arriba a la derecha durante
   4 segundos: "{Equipo} {goles} - {goles} {Equipo}" con un mini banner
   bicolor de las banderas
3. Si el partido era el "PRÓXIMO PARTIDO" mostrado, refresca esa sección

TAREA 10 — Limpieza
────────────────────
- Elimina el componente de "editar stats manual" del admin V1
- Actualiza el componente Header para mostrar el ranking sobre 48 (no 32)
- Verifica que todos los componentes funcionen con la nueva paleta
- Verifica responsiveness en mobile (375px), tablet (768px), desktop (1280px)

═══════════════════════════════════════════════════════════════
FORMATO Y ESTILO
═══════════════════════════════════════════════════════════════

- TODO mobile-first. Container max-w-[480px] en mobile, max-w-[1080px] en lg.
- Tipografía: Space Grotesk (display) + Inter (body) + JetBrains Mono (labels)
  - YA están configuradas en app/layout.tsx, no las re-importes.
- Sin glassmorphism. Sin sombras pesadas. Hairlines y whitespace son los
  organizadores principales.
- Animaciones con framer-motion, ease cubic-bezier(0.22, 1, 0.36, 1).
  Respeta prefers-reduced-motion.
- Íconos: SVG propios + lucide-react SOLO para utility (Settings, X, Check,
  ChevronDown). NUNCA emojis.

═══════════════════════════════════════════════════════════════
SEGURIDAD
═══════════════════════════════════════════════════════════════

- NUNCA expongas SUPABASE_SERVICE_ROLE_KEY al cliente
- Verifica es_admin DESDE EL SERVIDOR en /admin-control-panel/* antes de
  renderizar (middleware o server component)
- Toda escritura sensible va por las RPCs SECURITY DEFINER ya existentes
- El usuario común NUNCA debe poder llamar a registrar_resultado_partido
  ni a asignar_equipos_a_partido (las RPCs ya tienen check de es_admin,
  pero ocúltalas también en UI)

═══════════════════════════════════════════════════════════════
AL TERMINAR
═══════════════════════════════════════════════════════════════

Reporta:
1. Lista de archivos creados/modificados
2. Pasos para probar:
   - Registro y login funciona
   - Apertura de sobre revela carta con identidad nacional + 6 stats
   - Top 10 muestra ranking real, Top 5 peores también
   - Historial al seleccionar Argentina muestra sus partidos jugados
   - Brackets se ven correctos
   - Admin puede registrar resultado de un partido y stats se actualizan
     en vivo en el portafolio del user normal
   - Admin puede asignar equipos a partido eliminatorio
   - Quiebra sigue funcionando

EMPIEZA leyendo los archivos del punto 1 y comprende el contexto
completo antes de tocar código.
```

---

## ✅ CHECKLIST FINAL PARA TI

Antes de pegarle el prompt a Claude Code:

- [ ] Corriste `MIGRATION_V2.sql` en Supabase y los conteos cuadran (48 selecciones, 99 partidos)
- [ ] El archivo `EXPANSION_V2_MUNDIAL.md` (este doc) está dentro de la carpeta `mundial`
- [ ] El archivo `MIGRATION_V2.sql` también está dentro de la carpeta `mundial` (para referencia)
- [ ] Detuviste cualquier `npm run dev` que estuviera corriendo
- [ ] Abriste Claude Code dentro de la carpeta `mundial`
- [ ] Pegaste el prompt completo de la sección 7

¡Suerte! Cuando veas los primeros resultados del nuevo flujo (especialmente el formulario admin de partidos y la nueva animación de carta con todas las stats), si quieres una revisión visual o de lógica me avisas. 🏆⚽
