export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  puntos_permanentes: number;
  es_admin: boolean;
  created_at: string;
};

export type MercadoSeleccion = {
  id: number;
  pais: string;
  codigo: string;
  grupo: string;
  ataque: number;
  creacion: number;
  muralla: number;
  reflejos: number;
  posesion: number;
  eficiencia: number;
  valor_total: number;
  estado: "activo" | "eliminado";
};

export type PortafolioCarta = {
  id: string;
  user_id: string;
  seleccion_id: number;
  estado_carta: "activa" | "liquidada";
  fecha_obtencion: string;
  fecha_liquidacion?: string;
  puntos_obtenidos?: number;
};

export type CartaConSeleccion = PortafolioCarta & {
  seleccion: MercadoSeleccion;
};

export type Partido = {
  id: string;
  fase: "grupos" | "dieciseisavos" | "octavos" | "cuartos" | "semis" | "tercer_puesto" | "final";
  grupo?: string;
  fecha: string;
  equipo_local_id?: number;
  equipo_visitante_id?: number;
  dependencia_local?: string;
  dependencia_visitante?: string;
  goles_local?: number;
  goles_visitante?: number;
  posesion_local?: number;
  posesion_visitante?: number;
  tiros_local?: number;
  tiros_visitante?: number;
  estado: "programado" | "finalizado";
  finalizado_at?: string;
  fecha_actualizada_at?: string;
};
