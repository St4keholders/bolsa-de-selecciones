-- ============================================================================
-- MIGRATION V3 — LA BOLSA DE SELECCIONES
-- 1) Renombrar atajadas → eficiencia (goles/tiros %)
-- 2) Renombrar atajadas_local/visitante → tiros_local/visitante
-- 3) Actualizar registrar_resultado_partido con nueva fórmula de eficiencia
-- 4) Cargar los 20 resultados actuales del Mundial 2026
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. RENOMBRAR atajadas → eficiencia en mercado_selecciones
-- ============================================================================
ALTER TABLE public.mercado_selecciones RENAME COLUMN atajadas TO eficiencia;

-- ============================================================================
-- 2. RENOMBRAR atajadas_X → tiros_X en partidos
--    Ahora capturamos TIROS A ARCO (no atajadas del arquero)
-- ============================================================================
ALTER TABLE public.partidos RENAME COLUMN atajadas_local TO tiros_local;
ALTER TABLE public.partidos RENAME COLUMN atajadas_visitante TO tiros_visitante;

-- ============================================================================
-- 3. RECREAR registrar_resultado_partido con nueva firma + fórmula
--    Eficiencia = (goles / tiros) × 100  → % de conversión
--    El delta mueve la stat hacia la eficiencia del partido (media móvil)
-- ============================================================================
DROP FUNCTION IF EXISTS public.registrar_resultado_partido(TEXT,INT,INT,INT,INT,INT,INT);

CREATE OR REPLACE FUNCTION public.registrar_resultado_partido(
  partido_id_param TEXT,
  goles_local_param INTEGER,
  goles_visitante_param INTEGER,
  posesion_local_param INTEGER,
  posesion_visitante_param INTEGER,
  tiros_local_param INTEGER,
  tiros_visitante_param INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partido RECORD;
  v_efic_l NUMERIC; v_efic_v NUMERIC;
  v_d_ataque_l INT; v_d_creacion_l INT; v_d_muralla_l INT;
  v_d_reflejos_l INT; v_d_posesion_l INT; v_d_eficiencia_l INT;
  v_d_ataque_v INT; v_d_creacion_v INT; v_d_muralla_v INT;
  v_d_reflejos_v INT; v_d_posesion_v INT; v_d_eficiencia_v INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND es_admin = TRUE) THEN
    RAISE EXCEPTION 'Acceso denegado: requiere admin';
  END IF;
  IF goles_local_param < 0 OR goles_visitante_param < 0 THEN
    RAISE EXCEPTION 'Goles no pueden ser negativos';
  END IF;
  IF posesion_local_param + posesion_visitante_param <> 100 THEN
    RAISE EXCEPTION 'Las posesiones deben sumar 100';
  END IF;
  IF tiros_local_param < goles_local_param OR tiros_visitante_param < goles_visitante_param THEN
    RAISE EXCEPTION 'Los tiros deben ser >= goles anotados';
  END IF;

  SELECT * INTO v_partido FROM public.partidos WHERE id = partido_id_param;
  IF NOT FOUND THEN RAISE EXCEPTION 'Partido no encontrado'; END IF;
  IF v_partido.estado = 'finalizado' THEN RAISE EXCEPTION 'Partido ya finalizado'; END IF;
  IF v_partido.equipo_local_id IS NULL OR v_partido.equipo_visitante_id IS NULL THEN
    RAISE EXCEPTION 'Asigna ambos equipos antes';
  END IF;

  -- EFICIENCIA del partido (goles / tiros como %)
  v_efic_l := CASE WHEN tiros_local_param > 0
    THEN (goles_local_param::NUMERIC / tiros_local_param) * 100 ELSE 0 END;
  v_efic_v := CASE WHEN tiros_visitante_param > 0
    THEN (goles_visitante_param::NUMERIC / tiros_visitante_param) * 100 ELSE 0 END;

  -- Deltas
  v_d_ataque_l := (goles_local_param * 8) - CASE WHEN goles_local_param = 0 THEN 4 ELSE 0 END;
  v_d_ataque_v := (goles_visitante_param * 8) - CASE WHEN goles_visitante_param = 0 THEN 4 ELSE 0 END;
  v_d_creacion_l := ROUND((posesion_local_param - 50) * 0.4)::INT;
  v_d_creacion_v := ROUND((posesion_visitante_param - 50) * 0.4)::INT;
  v_d_muralla_l := CASE WHEN goles_visitante_param = 0 THEN 6 ELSE 0 END - (goles_visitante_param * 5);
  v_d_muralla_v := CASE WHEN goles_local_param = 0 THEN 6 ELSE 0 END - (goles_local_param * 5);
  IF goles_local_param > goles_visitante_param THEN
    v_d_reflejos_l := 10; v_d_reflejos_v := -5;
  ELSIF goles_local_param < goles_visitante_param THEN
    v_d_reflejos_l := -5; v_d_reflejos_v := 10;
  ELSE
    v_d_reflejos_l := 3;  v_d_reflejos_v := 3;
  END IF;
  v_d_posesion_l := ROUND((posesion_local_param - 50) * 0.2)::INT;
  v_d_posesion_v := ROUND((posesion_visitante_param - 50) * 0.2)::INT;
  -- Eficiencia: media móvil hacia eficiencia del partido (centro 50%)
  v_d_eficiencia_l := ROUND((v_efic_l - 50) * 0.3)::INT;
  v_d_eficiencia_v := ROUND((v_efic_v - 50) * 0.3)::INT;

  UPDATE public.mercado_selecciones SET
    ataque   = GREATEST(0, ataque + v_d_ataque_l),
    creacion = GREATEST(0, creacion + v_d_creacion_l),
    muralla  = GREATEST(0, muralla + v_d_muralla_l),
    reflejos = GREATEST(0, reflejos + v_d_reflejos_l),
    posesion = GREATEST(0, LEAST(100, posesion + v_d_posesion_l)),
    eficiencia = GREATEST(0, LEAST(100, eficiencia + v_d_eficiencia_l))
  WHERE id = v_partido.equipo_local_id AND estado = 'activo';

  UPDATE public.mercado_selecciones SET
    ataque   = GREATEST(0, ataque + v_d_ataque_v),
    creacion = GREATEST(0, creacion + v_d_creacion_v),
    muralla  = GREATEST(0, muralla + v_d_muralla_v),
    reflejos = GREATEST(0, reflejos + v_d_reflejos_v),
    posesion = GREATEST(0, LEAST(100, posesion + v_d_posesion_v)),
    eficiencia = GREATEST(0, LEAST(100, eficiencia + v_d_eficiencia_v))
  WHERE id = v_partido.equipo_visitante_id AND estado = 'activo';

  UPDATE public.partidos SET
    goles_local = goles_local_param,
    goles_visitante = goles_visitante_param,
    posesion_local = posesion_local_param,
    posesion_visitante = posesion_visitante_param,
    tiros_local = tiros_local_param,
    tiros_visitante = tiros_visitante_param,
    estado = 'finalizado',
    finalizado_at = NOW()
  WHERE id = partido_id_param;

  RETURN json_build_object(
    'success', true,
    'partido_id', partido_id_param,
    'eficiencia_local', ROUND(v_efic_l, 1),
    'eficiencia_visitante', ROUND(v_efic_v, 1)
  );
END;
$$;

-- ============================================================================
-- 4. APLICAR LOS 20 RESULTADOS ACTUALES (12-17 junio 2026)
--    Helpers temporales que bypassen el check de admin
-- ============================================================================

-- Helper 1: aplica deltas a un partido por su ID
CREATE OR REPLACE FUNCTION _temp_aplicar_resultado(
  pid TEXT, gl INT, gv INT, pl INT, pv INT, tl INT, tv INT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_partido RECORD;
  v_efic_l NUMERIC; v_efic_v NUMERIC;
  v_d_ataque_l INT; v_d_creacion_l INT; v_d_muralla_l INT;
  v_d_reflejos_l INT; v_d_posesion_l INT; v_d_eficiencia_l INT;
  v_d_ataque_v INT; v_d_creacion_v INT; v_d_muralla_v INT;
  v_d_reflejos_v INT; v_d_posesion_v INT; v_d_eficiencia_v INT;
BEGIN
  SELECT * INTO v_partido FROM partidos WHERE id = pid;
  IF NOT FOUND THEN RAISE NOTICE 'Partido % no encontrado', pid; RETURN; END IF;
  IF v_partido.estado = 'finalizado' THEN RAISE NOTICE 'Partido % ya finalizado', pid; RETURN; END IF;

  v_efic_l := CASE WHEN tl > 0 THEN (gl::NUMERIC / tl) * 100 ELSE 0 END;
  v_efic_v := CASE WHEN tv > 0 THEN (gv::NUMERIC / tv) * 100 ELSE 0 END;

  v_d_ataque_l := (gl * 8) - CASE WHEN gl = 0 THEN 4 ELSE 0 END;
  v_d_ataque_v := (gv * 8) - CASE WHEN gv = 0 THEN 4 ELSE 0 END;
  v_d_creacion_l := ROUND((pl - 50) * 0.4)::INT;
  v_d_creacion_v := ROUND((pv - 50) * 0.4)::INT;
  v_d_muralla_l := CASE WHEN gv = 0 THEN 6 ELSE 0 END - (gv * 5);
  v_d_muralla_v := CASE WHEN gl = 0 THEN 6 ELSE 0 END - (gl * 5);
  IF gl > gv THEN v_d_reflejos_l := 10; v_d_reflejos_v := -5;
  ELSIF gl < gv THEN v_d_reflejos_l := -5; v_d_reflejos_v := 10;
  ELSE v_d_reflejos_l := 3; v_d_reflejos_v := 3; END IF;
  v_d_posesion_l := ROUND((pl - 50) * 0.2)::INT;
  v_d_posesion_v := ROUND((pv - 50) * 0.2)::INT;
  v_d_eficiencia_l := ROUND((v_efic_l - 50) * 0.3)::INT;
  v_d_eficiencia_v := ROUND((v_efic_v - 50) * 0.3)::INT;

  UPDATE mercado_selecciones SET
    ataque = GREATEST(0, ataque + v_d_ataque_l),
    creacion = GREATEST(0, creacion + v_d_creacion_l),
    muralla = GREATEST(0, muralla + v_d_muralla_l),
    reflejos = GREATEST(0, reflejos + v_d_reflejos_l),
    posesion = GREATEST(0, LEAST(100, posesion + v_d_posesion_l)),
    eficiencia = GREATEST(0, LEAST(100, eficiencia + v_d_eficiencia_l))
  WHERE id = v_partido.equipo_local_id AND estado = 'activo';

  UPDATE mercado_selecciones SET
    ataque = GREATEST(0, ataque + v_d_ataque_v),
    creacion = GREATEST(0, creacion + v_d_creacion_v),
    muralla = GREATEST(0, muralla + v_d_muralla_v),
    reflejos = GREATEST(0, reflejos + v_d_reflejos_v),
    posesion = GREATEST(0, LEAST(100, posesion + v_d_posesion_v)),
    eficiencia = GREATEST(0, LEAST(100, eficiencia + v_d_eficiencia_v))
  WHERE id = v_partido.equipo_visitante_id AND estado = 'activo';

  UPDATE partidos SET
    goles_local = gl, goles_visitante = gv,
    posesion_local = pl, posesion_visitante = pv,
    tiros_local = tl, tiros_visitante = tv,
    estado = 'finalizado', finalizado_at = NOW()
  WHERE id = pid;
END $$;

-- Helper 2: busca partido por pareja de equipos (cualquier orden) y aplica
CREATE OR REPLACE FUNCTION _temp_resultado_equipos(
  team_a INT, team_b INT, ga INT, gb INT, pa INT, pb INT, sa INT, sb INT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_pid TEXT;
  v_local_id INT;
BEGIN
  SELECT id, equipo_local_id INTO v_pid, v_local_id
  FROM partidos
  WHERE fase='grupos' AND estado='programado'
    AND ((equipo_local_id=team_a AND equipo_visitante_id=team_b)
      OR (equipo_local_id=team_b AND equipo_visitante_id=team_a))
  LIMIT 1;
  IF v_pid IS NULL THEN
    RAISE NOTICE 'No se encontró partido entre % y %', team_a, team_b;
    RETURN;
  END IF;
  IF v_local_id = team_a THEN
    PERFORM _temp_aplicar_resultado(v_pid, ga, gb, pa, pb, sa, sb);
  ELSE
    PERFORM _temp_aplicar_resultado(v_pid, gb, ga, pb, pa, sb, sa);
  END IF;
END $$;

-- ============================================================================
-- LOS 20 RESULTADOS REALES (posesion y tiros son estimaciones razonables)
-- ============================================================================
-- VIE 12 JUN
SELECT _temp_resultado_equipos(13,14, 4,1, 60,40, 11,5);   -- USA 4-1 PAR

-- SAB 13 JUN
SELECT _temp_resultado_equipos(7, 8,  1,1, 45,55,  6,8);   -- QAT 1-1 SUI
SELECT _temp_resultado_equipos(9, 10, 1,1, 55,45,  9,7);   -- BRA 1-1 MAR
SELECT _temp_resultado_equipos(12,11, 0,1, 40,60,  3,7);   -- HAI 0-1 SCO
SELECT _temp_resultado_equipos(15,16, 2,0, 55,45,  8,4);   -- AUS 2-0 TUR

-- DOM 14 JUN
SELECT _temp_resultado_equipos(17,18, 7,1, 72,28, 16,4);   -- GER 7-1 CUW
SELECT _temp_resultado_equipos(21,22, 2,2, 53,47,  9,8);   -- NED 2-2 JPN
SELECT _temp_resultado_equipos(19,20, 1,0, 50,50,  6,5);   -- CIV 1-0 ECU
SELECT _temp_resultado_equipos(23,24, 5,1, 60,40, 12,4);   -- SWE 5-1 TUN

-- LUN 15 JUN
SELECT _temp_resultado_equipos(29,30, 0,0, 65,35,  8,3);   -- ESP 0-0 CPV
SELECT _temp_resultado_equipos(25,26, 1,1, 55,45,  8,6);   -- BEL 1-1 EGY
SELECT _temp_resultado_equipos(31,32, 1,1, 40,60,  5,8);   -- KSA 1-1 URU
SELECT _temp_resultado_equipos(27,28, 2,2, 52,48,  7,7);   -- IRN 2-2 NZL

-- MAR 16 JUN
SELECT _temp_resultado_equipos(33,34, 3,1, 60,40, 10,6);   -- FRA 3-1 SEN
SELECT _temp_resultado_equipos(35,36, 1,4, 45,55,  6,12);  -- IRQ 1-4 NOR
SELECT _temp_resultado_equipos(37,38, 3,0, 65,35, 12,5);   -- ARG 3-0 ALG
SELECT _temp_resultado_equipos(39,40, 3,1, 60,40, 10,5);   -- AUT 3-1 JOR

-- MIE 17 JUN (hoy)
SELECT _temp_resultado_equipos(41,42, 1,1, 58,42,  9,5);   -- POR 1-1 COD
SELECT _temp_resultado_equipos(45,46, 4,2, 55,45, 13,9);   -- ENG 4-2 CRO
SELECT _temp_resultado_equipos(47,48, 1,0, 55,45,  7,4);   -- GHA 1-0 PAN

-- CLEANUP
DROP FUNCTION _temp_resultado_equipos(INT,INT,INT,INT,INT,INT,INT,INT);
DROP FUNCTION _temp_aplicar_resultado(TEXT,INT,INT,INT,INT,INT,INT);

COMMIT;

-- ============================================================================
-- VERIFICAR
-- ============================================================================
-- Cantidad de partidos finalizados (esperado: 20)
-- SELECT COUNT(*) FROM partidos WHERE estado='finalizado';
--
-- Top 10 actual del mercado
-- SELECT pais, codigo, ataque, creacion, muralla, reflejos, posesion, eficiencia, valor_total
-- FROM mercado_selecciones ORDER BY valor_total DESC LIMIT 10;
--
-- Argentina (debería haber subido +41 puntos sobre el baseline de 1000)
-- SELECT * FROM mercado_selecciones WHERE codigo='ARG';
