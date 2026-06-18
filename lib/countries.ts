export type CountryTheme = {
  id: number;
  nombre: string;
  codigo: string;
  grupo: string;
  colores: {
    primary: string;
    secondary: string;
    accent: string;
  };
  gradientTenue: string;
  gradientFull: string;
  svgArt: string;
};

// Generador de gradientes auxiliares
const createGradient = (c1: string, c2: string, c3: string, isTenue: boolean = false) => {
  if (isTenue) {
    // Mezclado visual con blanco para tenue (~40% de opacidad sobre fondo blanco)
    return `linear-gradient(135deg, ${c1}40 0%, ${c2}40 50%, ${c3}40 100%)`;
  }
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
};

// Datos base simplificados para las 48 selecciones del Mundial 2026
const rawData = [
  { id: 1, pais: 'México', codigo: 'MEX', grupo: 'A', c1: '#006847', c2: '#FFFFFF', c3: '#CE1126', svg: 'Eagle' },
  { id: 2, pais: 'Sudáfrica', codigo: 'RSA', grupo: 'A', c1: '#007749', c2: '#FFB81C', c3: '#001489', svg: 'Text' },
  { id: 3, pais: 'Corea del Sur', codigo: 'KOR', grupo: 'A', c1: '#FFFFFF', c2: '#CD2E3A', c3: '#0F64CD', svg: 'Text' },
  { id: 4, pais: 'Chequia', codigo: 'CZE', grupo: 'A', c1: '#11457E', c2: '#D7141A', c3: '#FFFFFF', svg: 'Text' },
  { id: 5, pais: 'Canadá', codigo: 'CAN', grupo: 'B', c1: '#FF0000', c2: '#FFFFFF', c3: '#FF0000', svg: 'Text' },
  { id: 6, pais: 'Bosnia y Herzegovina', codigo: 'BIH', grupo: 'B', c1: '#002395', c2: '#FECB00', c3: '#FFFFFF', svg: 'Text' },
  { id: 7, pais: 'Qatar', codigo: 'QAT', grupo: 'B', c1: '#8A1538', c2: '#FFFFFF', c3: '#8A1538', svg: 'Text' },
  { id: 8, pais: 'Suiza', codigo: 'SUI', grupo: 'B', c1: '#FF0000', c2: '#FFFFFF', c3: '#FF0000', svg: 'Text' },
  { id: 9, pais: 'Brasil', codigo: 'BRA', grupo: 'C', c1: '#009739', c2: '#FEDD00', c3: '#012169', svg: 'Ball' },
  { id: 10, pais: 'Marruecos', codigo: 'MAR', grupo: 'C', c1: '#C1272D', c2: '#006233', c3: '#C1272D', svg: 'Star' },
  { id: 11, pais: 'Escocia', codigo: 'SCO', grupo: 'C', c1: '#0065BD', c2: '#FFFFFF', c3: '#0065BD', svg: 'Text' },
  { id: 12, pais: 'Haití', codigo: 'HAI', grupo: 'C', c1: '#00209F', c2: '#D21034', c3: '#FFFFFF', svg: 'Text' },
  { id: 13, pais: 'Estados Unidos', codigo: 'USA', grupo: 'D', c1: '#B31942', c2: '#FFFFFF', c3: '#0A3161', svg: 'Text' },
  { id: 14, pais: 'Paraguay', codigo: 'PAR', grupo: 'D', c1: '#D52B1E', c2: '#FFFFFF', c3: '#0038A8', svg: 'Text' },
  { id: 15, pais: 'Australia', codigo: 'AUS', grupo: 'D', c1: '#012169', c2: '#FFFFFF', c3: '#E4002B', svg: 'Text' },
  { id: 16, pais: 'Turquía', codigo: 'TUR', grupo: 'D', c1: '#E30A17', c2: '#FFFFFF', c3: '#E30A17', svg: 'Text' },
  { id: 17, pais: 'Alemania', codigo: 'GER', grupo: 'E', c1: '#000000', c2: '#FFCE00', c3: '#DD0000', svg: 'Eagle' },
  { id: 18, pais: 'Curazao', codigo: 'CUW', grupo: 'E', c1: '#002B7F', c2: '#F9E814', c3: '#FFFFFF', svg: 'Text' },
  { id: 19, pais: 'Costa de Marfil', codigo: 'CIV', grupo: 'E', c1: '#FF8200', c2: '#FFFFFF', c3: '#009A44', svg: 'Text' },
  { id: 20, pais: 'Ecuador', codigo: 'ECU', grupo: 'E', c1: '#FFDD00', c2: '#034EA2', c3: '#ED1C24', svg: 'Text' },
  { id: 21, pais: 'Países Bajos', codigo: 'NED', grupo: 'F', c1: '#AE1C28', c2: '#FFFFFF', c3: '#21468B', svg: 'Tulip' },
  { id: 22, pais: 'Japón', codigo: 'JPN', grupo: 'F', c1: '#FFFFFF', c2: '#BC002D', c3: '#FFFFFF', svg: 'Wave' },
  { id: 23, pais: 'Suecia', codigo: 'SWE', grupo: 'F', c1: '#004B87', c2: '#FFCD00', c3: '#004B87', svg: 'Text' },
  { id: 24, pais: 'Túnez', codigo: 'TUN', grupo: 'F', c1: '#E70013', c2: '#FFFFFF', c3: '#E70013', svg: 'Text' },
  { id: 25, pais: 'Bélgica', codigo: 'BEL', grupo: 'G', c1: '#000000', c2: '#FDDA24', c3: '#EF3340', svg: 'Lion' },
  { id: 26, pais: 'Egipto', codigo: 'EGY', grupo: 'G', c1: '#CE1126', c2: '#FFFFFF', c3: '#000000', svg: 'Text' },
  { id: 27, pais: 'Irán', codigo: 'IRN', grupo: 'G', c1: '#239F40', c2: '#FFFFFF', c3: '#DA0000', svg: 'Text' },
  { id: 28, pais: 'Nueva Zelanda', codigo: 'NZL', grupo: 'G', c1: '#00247D', c2: '#FFFFFF', c3: '#CC142B', svg: 'Text' },
  { id: 29, pais: 'España', codigo: 'ESP', grupo: 'H', c1: '#AA151B', c2: '#F1BF00', c3: '#AA151B', svg: 'Castle' },
  { id: 30, pais: 'Cabo Verde', codigo: 'CPV', grupo: 'H', c1: '#003893', c2: '#FFFFFF', c3: '#CF2027', svg: 'Text' },
  { id: 31, pais: 'Arabia Saudita', codigo: 'KSA', grupo: 'H', c1: '#006C35', c2: '#FFFFFF', c3: '#006C35', svg: 'Text' },
  { id: 32, pais: 'Uruguay', codigo: 'URU', grupo: 'H', c1: '#0038A8', c2: '#FFFFFF', c3: '#FCD116', svg: 'Sun' },
  { id: 33, pais: 'Francia', codigo: 'FRA', grupo: 'I', c1: '#002395', c2: '#FFFFFF', c3: '#ED2939', svg: 'Rooster' },
  { id: 34, pais: 'Senegal', codigo: 'SEN', grupo: 'I', c1: '#00853F', c2: '#FDEF42', c3: '#E31B23', svg: 'Star' },
  { id: 35, pais: 'Irak', codigo: 'IRQ', grupo: 'I', c1: '#CE1126', c2: '#FFFFFF', c3: '#000000', svg: 'Text' },
  { id: 36, pais: 'Noruega', codigo: 'NOR', grupo: 'I', c1: '#BA0C2F', c2: '#FFFFFF', c3: '#00205B', svg: 'Text' },
  { id: 37, pais: 'Argentina', codigo: 'ARG', grupo: 'J', c1: '#74ACDF', c2: '#FFFFFF', c3: '#74ACDF', svg: 'Sun' },
  { id: 38, pais: 'Argelia', codigo: 'ALG', grupo: 'J', c1: '#006233', c2: '#FFFFFF', c3: '#D21034', svg: 'Text' },
  { id: 39, pais: 'Austria', codigo: 'AUT', grupo: 'J', c1: '#ED2939', c2: '#FFFFFF', c3: '#ED2939', svg: 'Text' },
  { id: 40, pais: 'Jordania', codigo: 'JOR', grupo: 'J', c1: '#000000', c2: '#FFFFFF', c3: '#CE1126', svg: 'Text' },
  { id: 41, pais: 'Portugal', codigo: 'POR', grupo: 'K', c1: '#046A38', c2: '#DA291C', c3: '#F1B434', svg: 'Shield' },
  { id: 42, pais: 'RD Congo', codigo: 'COD', grupo: 'K', c1: '#007FFF', c2: '#F7D618', c3: '#CE1021', svg: 'Text' },
  { id: 43, pais: 'Uzbekistán', codigo: 'UZB', grupo: 'K', c1: '#0099B5', c2: '#FFFFFF', c3: '#1EB53A', svg: 'Text' },
  { id: 44, pais: 'Colombia', codigo: 'COL', grupo: 'K', c1: '#FCD116', c2: '#003893', c3: '#CE1126', svg: 'Condor' },
  { id: 45, pais: 'Inglaterra', codigo: 'ENG', grupo: 'L', c1: '#FFFFFF', c2: '#CE1124', c3: '#FFFFFF', svg: 'Lion' },
  { id: 46, pais: 'Croacia', codigo: 'CRO', grupo: 'L', c1: '#FF0000', c2: '#FFFFFF', c3: '#0000FF', svg: 'Text' },
  { id: 47, pais: 'Ghana', codigo: 'GHA', grupo: 'L', c1: '#CE1126', c2: '#FCD116', c3: '#006B3F', svg: 'Star' },
  { id: 48, pais: 'Panamá', codigo: 'PAN', grupo: 'L', c1: '#002A8F', c2: '#FFFFFF', c3: '#CE1126', svg: 'Text' },
];

export const COUNTRIES: Record<number, CountryTheme> = {};

rawData.forEach(d => {
  COUNTRIES[d.id] = {
    id: d.id,
    nombre: d.pais,
    codigo: d.codigo,
    grupo: d.grupo,
    colores: {
      primary: d.c1,
      secondary: d.c2,
      accent: d.c3,
    },
    gradientTenue: createGradient(d.c1, d.c2, d.c3, true),
    gradientFull: createGradient(d.c1, d.c2, d.c3, false),
    svgArt: d.svg,
  };
});
