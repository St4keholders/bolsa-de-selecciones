-- Corrección de Recompensas de Registro (5 Cartas Gratis)

-- 1. Crear una función segura (RPC) para que los usuarios sin cartas reclamen su paquete
CREATE OR REPLACE FUNCTION public.reclamar_bienvenida()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_count int;
BEGIN
  -- Obtener usuario actual autenticado
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  -- Verificar si el usuario ya tiene cartas
  SELECT count(*) INTO v_count FROM public.portafolio WHERE user_id = v_user_id;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Ya has reclamado tu paquete de bienvenida';
  END IF;

  -- Insertar 5 cartas aleatorias del mercado para este usuario
  INSERT INTO public.portafolio (user_id, seleccion_id)
  SELECT v_user_id, id
  FROM public.mercado_selecciones
  WHERE estado = 'activo'
  ORDER BY random()
  LIMIT 5;

  RETURN true;
END;
$$;
