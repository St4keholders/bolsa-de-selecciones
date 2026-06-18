-- ============================================================================
-- MIGRATION V2 — LA BOLSA DE SELECCIONES
-- Expansión 32 → 48 equipos, 2 nuevas stats, sistema de partidos,
-- auto-actualización de stats basada en resultados.
-- ============================================================================
-- ⚠️ EJECUTAR EN UNA SOLA CORRIDA EN EL SQL EDITOR DE SUPABASE
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. LIMPIAR DATOS EXISTENTES
-- (Borramos portafolios y selecciones para reseed con el roster de 48 equipos)
-- ============================================================================
DELETE FROM public.portafolio;
DELETE FROM public.mercado_selecciones;

-- ============================================================================
-- 2. MODIFICAR mercado_selecciones — añadir grupo, codigo, posesion, atajadas
-- ============================================================================
ALTER TABLE public.mercado_selecciones DROP COLUMN IF EXISTS valor_total;
ALTER TABLE public.mercado_selecciones ADD COLUMN IF NOT EXISTS codigo TEXT;
ALTER TABLE public.mercado_selecciones ADD COLUMN IF NOT EXISTS grupo TEXT;
ALTER TABLE public.mercado_selecciones ADD COLUMN IF NOT EXISTS posesion INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.mercado_selecciones ADD COLUMN IF NOT EXISTS atajadas INTEGER NOT NULL DEFAULT 0;

-- Recrear valor_total ahora con 6 stats sumadas
ALTER TABLE public.mercado_selecciones
  ADD COLUMN valor_total INTEGER GENERATED ALWAYS AS
  (ataque + creacion + muralla + reflejos + posesion + atajadas) STORED;

-- ============================================================================
-- 3. INSERTAR LAS 48 SELECCIONES DEL MUNDIAL 2026
-- Tier-based initial stats: S=top8, A=strong8, B=mid16, C=lower12, D=weakest4
-- ============================================================================
INSERT INTO public.mercado_selecciones (id, pais, codigo, grupo, ataque, creacion, muralla, reflejos, posesion, atajadas) VALUES
  (1,  'México',               'MEX', 'A', 195, 195, 190, 190, 53, 30),
  (2,  'Sudáfrica',             'RSA', 'A', 110, 110, 110, 110, 43, 25),
  (3,  'Corea del Sur',         'KOR', 'A', 155, 155, 150, 150, 48, 28),
  (4,  'Chequia',               'CZE', 'A', 110, 110, 110, 110, 43, 25),
  (5,  'Canadá',                'CAN', 'B', 155, 155, 150, 150, 48, 28),
  (6,  'Bosnia y Herzegovina',  'BIH', 'B', 110, 110, 110, 110, 43, 25),
  (7,  'Qatar',                 'QAT', 'B', 110, 110, 110, 110, 43, 25),
  (8,  'Suiza',                 'SUI', 'B', 155, 155, 150, 150, 48, 28),
  (9,  'Brasil',                'BRA', 'C', 230, 230, 220, 220, 58, 32),
  (10, 'Marruecos',             'MAR', 'C', 195, 195, 190, 190, 53, 30),
  (11, 'Escocia',               'SCO', 'C', 155, 155, 150, 150, 48, 28),
  (12, 'Haití',                 'HAI', 'C',  75,  75,  75,  75, 38, 22),
  (13, 'Estados Unidos',        'USA', 'D', 195, 195, 190, 190, 53, 30),
  (14, 'Paraguay',              'PAR', 'D', 110, 110, 110, 110, 43, 25),
  (15, 'Australia',             'AUS', 'D', 155, 155, 150, 150, 48, 28),
  (16, 'Turquía',               'TUR', 'D', 155, 155, 150, 150, 48, 28),
  (17, 'Alemania',              'GER', 'E', 230, 230, 220, 220, 58, 32),
  (18, 'Curazao',               'CUW', 'E',  75,  75,  75,  75, 38, 22),
  (19, 'Costa de Marfil',       'CIV', 'E', 155, 155, 150, 150, 48, 28),
  (20, 'Ecuador',               'ECU', 'E', 155, 155, 150, 150, 48, 28),
  (21, 'Países Bajos',          'NED', 'F', 230, 230, 220, 220, 58, 32),
  (22, 'Japón',                 'JPN', 'F', 155, 155, 150, 150, 48, 28),
  (23, 'Suecia',                'SWE', 'F', 155, 155, 150, 150, 48, 28),
  (24, 'Túnez',                 'TUN', 'F', 155, 155, 150, 150, 48, 28),
  (25, 'Bélgica',               'BEL', 'G', 195, 195, 190, 190, 53, 30),
  (26, 'Egipto',                'EGY', 'G', 155, 155, 150, 150, 48, 28),
  (27, 'Irán',                  'IRN', 'G', 110, 110, 110, 110, 43, 25),
  (28, 'Nueva Zelanda',         'NZL', 'G', 110, 110, 110, 110, 43, 25),
  (29, 'España',                'ESP', 'H', 230, 230, 220, 220, 58, 32),
  (30, 'Cabo Verde',            'CPV', 'H', 110, 110, 110, 110, 43, 25),
  (31, 'Arabia Saudita',        'KSA', 'H', 110, 110, 110, 110, 43, 25),
  (32, 'Uruguay',               'URU', 'H', 195, 195, 190, 190, 53, 30),
  (33, 'Francia',               'FRA', 'I', 230, 230, 220, 220, 58, 32),
  (34, 'Senegal',               'SEN', 'I', 195, 195, 190, 190, 53, 30),
  (35, 'Irak',                  'IRQ', 'I',  75,  75,  75,  75, 38, 22),
  (36, 'Noruega',               'NOR', 'I', 155, 155, 150, 150, 48, 28),
  (37, 'Argentina',             'ARG', 'J', 230, 230, 220, 220, 58, 32),
  (38, 'Argelia',               'ALG', 'J', 155, 155, 150, 150, 48, 28),
  (39, 'Austria',               'AUT', 'J', 155, 155, 150, 150, 48, 28),
  (40, 'Jordania',              'JOR', 'J',  75,  75,  75,  75, 38, 22),
  (41, 'Portugal',              'POR', 'K', 230, 230, 220, 220, 58, 32),
  (42, 'RD Congo',              'COD', 'K', 110, 110, 110, 110, 43, 25),
  (43, 'Uzbekistán',            'UZB', 'K', 110, 110, 110, 110, 43, 25),
  (44, 'Colombia',              'COL', 'K', 195, 195, 190, 190, 53, 30),
  (45, 'Inglaterra',            'ENG', 'L', 230, 230, 220, 220, 58, 32),
  (46, 'Croacia',               'CRO', 'L', 195, 195, 190, 190, 53, 30),
  (47, 'Ghana',                 'GHA', 'L', 155, 155, 150, 150, 48, 28),
  (48, 'Panamá',                'PAN', 'L', 110, 110, 110, 110, 43, 25);

-- ============================================================================
-- 4. CREAR TABLA partidos — TODA la estructura del torneo
-- ============================================================================
CREATE TABLE public.partidos (
  id TEXT PRIMARY KEY,
  fase TEXT NOT NULL CHECK (fase IN (
    'grupos','dieciseisavos','octavos','cuartos','semis','tercer_puesto','final'
  )),
  grupo TEXT,
  fecha DATE NOT NULL,
  equipo_local_id INTEGER REFERENCES public.mercado_selecciones(id),
  equipo_visitante_id INTEGER REFERENCES public.mercado_selecciones(id),
  dependencia_local TEXT,
  dependencia_visitante TEXT,
  goles_local INTEGER,
  goles_visitante INTEGER,
  posesion_local INTEGER,
  posesion_visitante INTEGER,
  atajadas_local INTEGER,
  atajadas_visitante INTEGER,
  estado TEXT NOT NULL DEFAULT 'programado'
    CHECK (estado IN ('programado','finalizado')),
  finalizado_at TIMESTAMPTZ
);

CREATE INDEX idx_partidos_fecha ON public.partidos(fecha);
CREATE INDEX idx_partidos_estado ON public.partidos(estado);
CREATE INDEX idx_partidos_fase ON public.partidos(fase);
CREATE INDEX idx_partidos_local ON public.partidos(equipo_local_id);
CREATE INDEX idx_partidos_visitante ON public.partidos(equipo_visitante_id);

-- ============================================================================
-- 5. INSERTAR LOS 99 PARTIDOS DEL TORNEO
-- (67 fase de grupos + 16 dieciseisavos + 8 octavos + 4 cuartos + 2 semis +
--  tercer puesto + gran final)
-- ============================================================================
INSERT INTO public.partidos (id, fase, grupo, fecha, equipo_local_id, equipo_visitante_id, dependencia_local, dependencia_visitante) VALUES
  ('P001', 'grupos', 'A', '2026-06-11', 1, 2, NULL, NULL),
  ('P002', 'grupos', 'A', '2026-06-11', 3, 4, NULL, NULL),
  ('P003', 'grupos', 'B', '2026-06-12', 5, 6, NULL, NULL),
  ('P004', 'grupos', 'D', '2026-06-12', 13, 14, NULL, NULL),
  ('P005', 'grupos', 'B', '2026-06-13', 7, 8, NULL, NULL),
  ('P006', 'grupos', 'C', '2026-06-13', 9, 10, NULL, NULL),
  ('P007', 'grupos', 'C', '2026-06-13', 11, 12, NULL, NULL),
  ('P008', 'grupos', 'D', '2026-06-13', 15, 16, NULL, NULL),
  ('P009', 'grupos', 'E', '2026-06-14', 17, 18, NULL, NULL),
  ('P010', 'grupos', 'F', '2026-06-14', 21, 22, NULL, NULL),
  ('P011', 'grupos', 'E', '2026-06-14', 19, 20, NULL, NULL),
  ('P012', 'grupos', 'F', '2026-06-14', 23, 24, NULL, NULL),
  ('P013', 'grupos', 'H', '2026-06-15', 29, 30, NULL, NULL),
  ('P014', 'grupos', 'G', '2026-06-15', 25, 26, NULL, NULL),
  ('P015', 'grupos', 'H', '2026-06-15', 31, 32, NULL, NULL),
  ('P016', 'grupos', 'G', '2026-06-15', 27, 28, NULL, NULL),
  ('P017', 'grupos', 'I', '2026-06-16', 33, 34, NULL, NULL),
  ('P018', 'grupos', 'I', '2026-06-16', 35, 36, NULL, NULL),
  ('P019', 'grupos', 'J', '2026-06-16', 37, 38, NULL, NULL),
  ('P020', 'grupos', 'J', '2026-06-16', 39, 40, NULL, NULL),
  ('P021', 'grupos', 'K', '2026-06-17', 41, 42, NULL, NULL),
  ('P022', 'grupos', 'K', '2026-06-17', 43, 44, NULL, NULL),
  ('P023', 'grupos', 'L', '2026-06-17', 45, 46, NULL, NULL),
  ('P024', 'grupos', 'L', '2026-06-17', 47, 48, NULL, NULL),
  ('P025', 'grupos', 'A', '2026-06-18', 4, 2, NULL, NULL),
  ('P026', 'grupos', 'A', '2026-06-18', 1, 3, NULL, NULL),
  ('P027', 'grupos', 'B', '2026-06-18', 8, 6, NULL, NULL),
  ('P028', 'grupos', 'B', '2026-06-18', 5, 7, NULL, NULL),
  ('P029', 'grupos', 'C', '2026-06-19', 11, 10, NULL, NULL),
  ('P030', 'grupos', 'C', '2026-06-19', 9, 12, NULL, NULL),
  ('P031', 'grupos', 'D', '2026-06-19', 13, 15, NULL, NULL),
  ('P032', 'grupos', 'D', '2026-06-19', 16, 14, NULL, NULL),
  ('P033', 'grupos', 'E', '2026-06-20', 17, 19, NULL, NULL),
  ('P034', 'grupos', 'E', '2026-06-20', 20, 18, NULL, NULL),
  ('P035', 'grupos', 'F', '2026-06-20', 21, 23, NULL, NULL),
  ('P036', 'grupos', 'F', '2026-06-20', 24, 22, NULL, NULL),
  ('P037', 'grupos', 'G', '2026-06-21', 25, 27, NULL, NULL),
  ('P038', 'grupos', 'G', '2026-06-21', 28, 26, NULL, NULL),
  ('P039', 'grupos', 'H', '2026-06-21', 29, 31, NULL, NULL),
  ('P040', 'grupos', 'H', '2026-06-21', 32, 30, NULL, NULL),
  ('P041', 'grupos', 'I', '2026-06-22', 33, 35, NULL, NULL),
  ('P042', 'grupos', 'I', '2026-06-22', 36, 34, NULL, NULL),
  ('P043', 'grupos', 'J', '2026-06-22', 37, 39, NULL, NULL),
  ('P044', 'grupos', 'J', '2026-06-22', 40, 38, NULL, NULL),
  ('P045', 'grupos', 'K', '2026-06-23', 41, 43, NULL, NULL),
  ('P046', 'grupos', 'K', '2026-06-23', 44, 42, NULL, NULL),
  ('P047', 'grupos', 'L', '2026-06-23', 45, 47, NULL, NULL),
  ('P048', 'grupos', 'L', '2026-06-23', 48, 46, NULL, NULL),
  ('P049', 'grupos', 'B', '2026-06-24', 8, 5, NULL, NULL),
  ('P050', 'grupos', 'B', '2026-06-24', 7, 6, NULL, NULL),
  ('P051', 'grupos', 'A', '2026-06-24', 1, 4, NULL, NULL),
  ('P052', 'grupos', 'A', '2026-06-24', 2, 3, NULL, NULL),
  ('P053', 'grupos', 'E', '2026-06-25', 20, 17, NULL, NULL),
  ('P054', 'grupos', 'E', '2026-06-25', 18, 19, NULL, NULL),
  ('P055', 'grupos', 'F', '2026-06-25', 22, 23, NULL, NULL),
  ('P056', 'grupos', 'D', '2026-06-25', 13, 16, NULL, NULL),
  ('P057', 'grupos', 'D', '2026-06-25', 14, 15, NULL, NULL),
  ('P058', 'grupos', 'I', '2026-06-26', 36, 33, NULL, NULL),
  ('P059', 'grupos', 'I', '2026-06-26', 34, 35, NULL, NULL),
  ('P060', 'grupos', 'H', '2026-06-26', 32, 29, NULL, NULL),
  ('P061', 'grupos', 'H', '2026-06-26', 30, 31, NULL, NULL),
  ('P062', 'grupos', 'G', '2026-06-26', 28, 25, NULL, NULL),
  ('P063', 'grupos', 'G', '2026-06-26', 26, 27, NULL, NULL),
  ('P064', 'grupos', 'L', '2026-06-27', 48, 45, NULL, NULL),
  ('P065', 'grupos', 'L', '2026-06-27', 46, 47, NULL, NULL),
  ('P066', 'grupos', 'K', '2026-06-27', 44, 41, NULL, NULL),
  ('P067', 'grupos', 'K', '2026-06-27', 42, 43, NULL, NULL),
  ('P073', 'dieciseisavos', NULL, '2026-06-28', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P074', 'dieciseisavos', NULL, '2026-06-29', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P075', 'dieciseisavos', NULL, '2026-06-29', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P076', 'dieciseisavos', NULL, '2026-06-29', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P077', 'dieciseisavos', NULL, '2026-06-30', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P078', 'dieciseisavos', NULL, '2026-06-30', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P079', 'dieciseisavos', NULL, '2026-06-30', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P080', 'dieciseisavos', NULL, '2026-07-01', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P081', 'dieciseisavos', NULL, '2026-07-01', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P082', 'dieciseisavos', NULL, '2026-07-01', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P083', 'dieciseisavos', NULL, '2026-07-02', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P084', 'dieciseisavos', NULL, '2026-07-02', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P085', 'dieciseisavos', NULL, '2026-07-02', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P086', 'dieciseisavos', NULL, '2026-07-03', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P087', 'dieciseisavos', NULL, '2026-07-03', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P088', 'dieciseisavos', NULL, '2026-07-03', NULL, NULL, 'Por definir (grupos)', 'Por definir (grupos)'),
  ('P089', 'octavos', NULL, '2026-07-04', NULL, NULL, 'Ganador 74', 'Ganador 77'),
  ('P090', 'octavos', NULL, '2026-07-04', NULL, NULL, 'Ganador 73', 'Ganador 75'),
  ('P091', 'octavos', NULL, '2026-07-05', NULL, NULL, 'Ganador 76', 'Ganador 78'),
  ('P092', 'octavos', NULL, '2026-07-05', NULL, NULL, 'Ganador 79', 'Ganador 80'),
  ('P093', 'octavos', NULL, '2026-07-06', NULL, NULL, 'Ganador 83', 'Ganador 84'),
  ('P094', 'octavos', NULL, '2026-07-06', NULL, NULL, 'Ganador 81', 'Ganador 82'),
  ('P095', 'octavos', NULL, '2026-07-07', NULL, NULL, 'Ganador 86', 'Ganador 88'),
  ('P096', 'octavos', NULL, '2026-07-07', NULL, NULL, 'Ganador 85', 'Ganador 87'),
  ('P097', 'cuartos', NULL, '2026-07-09', NULL, NULL, 'Ganador 89', 'Ganador 90'),
  ('P098', 'cuartos', NULL, '2026-07-10', NULL, NULL, 'Ganador 93', 'Ganador 94'),
  ('P099', 'cuartos', NULL, '2026-07-11', NULL, NULL, 'Ganador 91', 'Ganador 92'),
  ('P100', 'cuartos', NULL, '2026-07-11', NULL, NULL, 'Ganador 95', 'Ganador 96'),
  ('P101', 'semis', NULL, '2026-07-14', NULL, NULL, 'Ganador 97', 'Ganador 98'),
  ('P102', 'semis', NULL, '2026-07-15', NULL, NULL, 'Ganador 99', 'Ganador 100'),
  ('P103', 'tercer_puesto', NULL, '2026-07-18', NULL, NULL, 'Perdedor 101', 'Perdedor 102'),
  ('P104', 'final', NULL, '2026-07-19', NULL, NULL, 'Ganador 101', 'Ganador 102');

-- ============================================================================
-- 6. RPC: registrar_resultado_partido
-- Admin registra resultado → la función actualiza automáticamente las stats
-- de ambos equipos según fórmula definida abajo.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.registrar_resultado_partido(
  partido_id_param TEXT,
  goles_local_param INTEGER,
  goles_visitante_param INTEGER,
  posesion_local_param INTEGER,
  posesion_visitante_param INTEGER,
  atajadas_local_param INTEGER,
  atajadas_visitante_param INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partido RECORD;
  v_d_ataque_l INT; v_d_creacion_l INT; v_d_muralla_l INT;
  v_d_reflejos_l INT; v_d_posesion_l INT; v_d_atajadas_l INT;
  v_d_ataque_v INT; v_d_creacion_v INT; v_d_muralla_v INT;
  v_d_reflejos_v INT; v_d_posesion_v INT; v_d_atajadas_v INT;
BEGIN
  -- Solo admin
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND es_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: requiere admin';
  END IF;

  -- Validaciones de entrada
  IF goles_local_param < 0 OR goles_visitante_param < 0 THEN
    RAISE EXCEPTION 'Los goles no pueden ser negativos';
  END IF;
  IF posesion_local_param + posesion_visitante_param <> 100 THEN
    RAISE EXCEPTION 'Las posesiones deben sumar 100 (recibido: % + %)',
      posesion_local_param, posesion_visitante_param;
  END IF;

  -- Obtener partido
  SELECT * INTO v_partido FROM public.partidos WHERE id = partido_id_param;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partido no encontrado';
  END IF;
  IF v_partido.estado = 'finalizado' THEN
    RAISE EXCEPTION 'Partido ya finalizado. Para corregir, contacta soporte.';
  END IF;
  IF v_partido.equipo_local_id IS NULL OR v_partido.equipo_visitante_id IS NULL THEN
    RAISE EXCEPTION 'Asigna ambos equipos antes de registrar resultado';
  END IF;

  -- ============================================
  -- FÓRMULA DE ACTUALIZACIÓN DE STATS
  -- ============================================
  -- ATAQUE: +8 por gol anotado, -4 si no anota
  v_d_ataque_l := (goles_local_param * 8) - CASE WHEN goles_local_param = 0 THEN 4 ELSE 0 END;
  v_d_ataque_v := (goles_visitante_param * 8) - CASE WHEN goles_visitante_param = 0 THEN 4 ELSE 0 END;

  -- CREACIÓN: depende de posesión (cada 10% sobre 50% = +2; bajo 50% = -2)
  v_d_creacion_l := ROUND((posesion_local_param - 50) * 0.4)::INT;
  v_d_creacion_v := ROUND((posesion_visitante_param - 50) * 0.4)::INT;

  -- MURALLA: +6 por valla en cero, -5 por cada gol recibido
  v_d_muralla_l := CASE WHEN goles_visitante_param = 0 THEN 6 ELSE 0 END
                   - (goles_visitante_param * 5);
  v_d_muralla_v := CASE WHEN goles_local_param = 0 THEN 6 ELSE 0 END
                   - (goles_local_param * 5);

  -- REFLEJOS: +10 ganar, +3 empatar, -5 perder
  IF goles_local_param > goles_visitante_param THEN
    v_d_reflejos_l := 10; v_d_reflejos_v := -5;
  ELSIF goles_local_param < goles_visitante_param THEN
    v_d_reflejos_l := -5; v_d_reflejos_v := 10;
  ELSE
    v_d_reflejos_l := 3;  v_d_reflejos_v := 3;
  END IF;

  -- POSESIÓN: media móvil simple — acercarse al valor del partido
  v_d_posesion_l := ROUND((posesion_local_param - 50) * 0.2)::INT;
  v_d_posesion_v := ROUND((posesion_visitante_param - 50) * 0.2)::INT;

  -- ATAJADAS: +1.5 por cada atajada del arquero del partido
  v_d_atajadas_l := ROUND(atajadas_local_param * 1.5)::INT;
  v_d_atajadas_v := ROUND(atajadas_visitante_param * 1.5)::INT;

  -- Aplicar deltas al equipo LOCAL (clamp en 0 para no negativos)
  UPDATE public.mercado_selecciones SET
    ataque   = GREATEST(0, ataque + v_d_ataque_l),
    creacion = GREATEST(0, creacion + v_d_creacion_l),
    muralla  = GREATEST(0, muralla + v_d_muralla_l),
    reflejos = GREATEST(0, reflejos + v_d_reflejos_l),
    posesion = GREATEST(0, LEAST(100, posesion + v_d_posesion_l)),
    atajadas = GREATEST(0, atajadas + v_d_atajadas_l)
  WHERE id = v_partido.equipo_local_id AND estado = 'activo';

  -- Aplicar deltas al equipo VISITANTE
  UPDATE public.mercado_selecciones SET
    ataque   = GREATEST(0, ataque + v_d_ataque_v),
    creacion = GREATEST(0, creacion + v_d_creacion_v),
    muralla  = GREATEST(0, muralla + v_d_muralla_v),
    reflejos = GREATEST(0, reflejos + v_d_reflejos_v),
    posesion = GREATEST(0, LEAST(100, posesion + v_d_posesion_v)),
    atajadas = GREATEST(0, atajadas + v_d_atajadas_v)
  WHERE id = v_partido.equipo_visitante_id AND estado = 'activo';

  -- Guardar resultado en el partido
  UPDATE public.partidos SET
    goles_local = goles_local_param,
    goles_visitante = goles_visitante_param,
    posesion_local = posesion_local_param,
    posesion_visitante = posesion_visitante_param,
    atajadas_local = atajadas_local_param,
    atajadas_visitante = atajadas_visitante_param,
    estado = 'finalizado',
    finalizado_at = NOW()
  WHERE id = partido_id_param;

  RETURN json_build_object(
    'success', true,
    'partido_id', partido_id_param,
    'deltas', json_build_object(
      'local', json_build_object(
        'ataque', v_d_ataque_l, 'creacion', v_d_creacion_l,
        'muralla', v_d_muralla_l, 'reflejos', v_d_reflejos_l,
        'posesion', v_d_posesion_l, 'atajadas', v_d_atajadas_l
      ),
      'visitante', json_build_object(
        'ataque', v_d_ataque_v, 'creacion', v_d_creacion_v,
        'muralla', v_d_muralla_v, 'reflejos', v_d_reflejos_v,
        'posesion', v_d_posesion_v, 'atajadas', v_d_atajadas_v
      )
    )
  );
END;
$$;

-- ============================================================================
-- 7. RPC: asignar_equipos_a_partido (para llaves eliminatorias)
-- Admin define qué equipos jugarán un partido eliminatorio
-- ============================================================================
CREATE OR REPLACE FUNCTION public.asignar_equipos_a_partido(
  partido_id_param TEXT,
  equipo_local_id_param INTEGER,
  equipo_visitante_id_param INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND es_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Acceso denegado: requiere admin';
  END IF;

  UPDATE public.partidos
  SET equipo_local_id = equipo_local_id_param,
      equipo_visitante_id = equipo_visitante_id_param
  WHERE id = partido_id_param AND estado = 'programado';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partido no encontrado o ya finalizado';
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- ============================================================================
-- 8. RLS para partidos — todos los autenticados pueden VER
-- (Escritura solo vía RPCs admin)
-- ============================================================================
ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partidos_select_all_auth" ON public.partidos
  FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- 9. REALTIME — añadir partidos al canal de updates en vivo
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.partidos;

-- ============================================================================
-- 10. DEPRECAR actualizar_stats_seleccion (admin ya no edita stats manualmente)
-- La dejamos por si necesitas hacer ajustes de emergencia.
-- ============================================================================
COMMENT ON FUNCTION public.actualizar_stats_seleccion IS
  'DEPRECATED en V2. Stats se actualizan vía registrar_resultado_partido. Usar solo para ajustes manuales de emergencia.';

COMMIT;

-- ============================================================================
-- ✅ FIN DE MIGRACIÓN V2
-- ============================================================================
-- Para verificar:
--   SELECT COUNT(*) FROM mercado_selecciones;  -- debe dar 48
--   SELECT COUNT(*) FROM partidos;             -- debe dar 99
--   SELECT fase, COUNT(*) FROM partidos GROUP BY fase ORDER BY fase;
-- ============================================================================
