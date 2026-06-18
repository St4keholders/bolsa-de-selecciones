-- Función para obtener la tabla de posiciones (Ranking de Jugadores)
CREATE OR REPLACE FUNCTION public.obtener_ranking()
RETURNS TABLE (
  usuario_id uuid,
  nombre text,
  total_cartas bigint,
  posicion bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH Conteo AS (
    SELECT 
      u.id as usuario_id, 
      u.nombre, 
      count(c.id) as total_cartas
    FROM public.usuarios u
    LEFT JOIN public.cartas c ON c.usuario_id = u.id AND c.estado = 'activa'
    GROUP BY u.id, u.nombre
  )
  SELECT 
    c.usuario_id, 
    c.nombre, 
    c.total_cartas,
    row_number() OVER (ORDER BY c.total_cartas DESC) as posicion
  FROM Conteo c;
END;
$$;
