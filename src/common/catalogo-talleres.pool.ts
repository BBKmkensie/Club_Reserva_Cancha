export interface ProfesorCatalogoSeed {
  nombre: string;
  rut: string;
  email: string;
}

export interface TallerCatalogoSeed {
  /** Nombre canónico del taller */
  tipo: string;
  /** Nombres alternativos ya existentes en BD */
  alias?: string[];
  descripcion: string;
  imagenUrl: string;
  conProfesor: boolean;
  profesor?: ProfesorCatalogoSeed;
}

function img(id: string): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;
}

export const CATALOGO_TALLERES_SEED: TallerCatalogoSeed[] = [
  {
    tipo: 'Futbol',
    alias: ['Fútbol'],
    conProfesor: true,
    descripcion:
      'Taller de fútbol formativo: técnica con balón, juego en espacios reducidos y trabajo físico. ' +
      'Desarrolla coordinación, juego en equipo y hábitos de vida activa.',
    imagenUrl: img('photo-1574629810360-7efbbe195018'),
  },
  {
    tipo: 'Voley',
    alias: ['Vóley', 'Voleibol'],
    conProfesor: true,
    descripcion:
      'Taller de voleibol: fundamentos de saque, recepción, armado y remate. ' +
      'Fomenta el trabajo en equipo, la comunicación y la disciplina deportiva.',
    imagenUrl: img('photo-1612872087720-bb876e2e67d1'),
  },
  {
    tipo: 'Basquet',
    alias: ['Basket', 'Básquetbol'],
    conProfesor: false,
    descripcion:
      'Taller de básquetbol: manejo de balón, pases, tiros y juego posicional. ' +
      'Ideal para mejorar reflejos, coordinación y espíritu de equipo.',
    imagenUrl: img('photo-1546519638-68e109498ffc'),
  },
  {
    tipo: 'Folclore',
    conProfesor: false,
    descripcion:
      'Taller de danza y música folclórica chilena. Aprende cuecas, tonadas y expresión corporal ' +
      'vinculada a las tradiciones del país.',
    imagenUrl: img('photo-1518611012118-696072aa579a'),
  },
  {
    tipo: 'Rodeo',
    conProfesor: false,
    descripcion:
      'Introducción al rodeo escolar y a la chilenidad: conocimiento del caballo, aseo equino ' +
      'y valores de respeto por el animal y la cultura huasa.',
    imagenUrl: img('photo-1578662996442-48f60103fc96'),
  },
  {
    tipo: 'Emprendimiento',
    conProfesor: false,
    descripcion:
      'Desarrolla ideas de negocio, pitch, marketing básico y finanzas personales. ' +
      'Los estudiantes diseñan y presentan un emprendimiento escolar.',
    imagenUrl: img('photo-1556761175-5973dc0f32e7'),
  },
  {
    tipo: 'Construccion',
    alias: ['Construcción'],
    conProfesor: false,
    descripcion:
      'Taller práctico de oficios: lectura de planos simples, uso seguro de herramientas ' +
      'y proyectos de madera o estructuras a escala.',
    imagenUrl: img('photo-1503387762-592deb58ef4e'),
  },
  {
    tipo: 'Teatro',
    conProfesor: true,
    profesor: { nombre: 'Rodrigo Valdes', rut: '23477524-3', email: 'rodrigovaldes@gmail.com' },
    descripcion:
      'Expresión dramática, improvisación y montaje escénico. Trabajo de voz, corporalidad ' +
      'y presentaciones ante público.',
    imagenUrl: img('photo-1514306191717-452ec28c7814'),
  },
  {
    tipo: 'Lectura',
    conProfesor: false,
    descripcion:
      'Club de lectura: comprensión lectora, análisis de textos y hábito de lectura ' +
      'con obras de literatura juvenil y clásicos adaptados.',
    imagenUrl: img('photo-1481627834876-b7833e8f5570'),
  },
  {
    tipo: 'Ludoteca',
    conProfesor: true,
    profesor: { nombre: 'Paula Valdes', rut: '10698275-9', email: 'paulavaldes@gmail.com' },
    descripcion:
      'Juegos de mesa, lógica y resolución de problemas en un ambiente lúdico. ' +
      'Desarrolla estrategia, paciencia y convivencia.',
    imagenUrl: img('photo-1566576912321-d58ddd7a6088'),
  },
  {
    tipo: 'Robotica',
    alias: ['Robótica'],
    conProfesor: false,
    descripcion:
      'Programación y armado de robots educativos. Introducción a sensores, motores ' +
      'y pensamiento computacional con desafíos por equipos.',
    imagenUrl: img('photo-1485827404703-89b55fcc595e'),
  },
  {
    tipo: 'Musica',
    alias: ['Música'],
    conProfesor: true,
    profesor: { nombre: 'Paula Gonzalez', rut: '23920319-1', email: 'paulagonzalez@gmail.com' },
    descripcion:
      'Iniciación musical: ritmo, canto, lectura básica y ensamble con instrumentos. ' +
      'Explora distintos estilos y prepara presentaciones.',
    imagenUrl: img('photo-1493225457124-a3eb161ffa5f'),
  },
  {
    tipo: 'Diseño',
    alias: ['Diseño gráfico'],
    conProfesor: true,
    profesor: { nombre: 'Camilo Nunez', rut: '16174171-K', email: 'camilonunez@gmail.com' },
    descripcion:
      'Diseño gráfico digital: composición, color, tipografía y proyectos con herramientas ' +
      'de edición para afiches, logos y piezas escolares.',
    imagenUrl: img('photo-1561070791-2526d30994b5'),
  },
  {
    tipo: 'Tejido',
    conProfesor: false,
    descripcion:
      'Técnicas de tejido y crochet: puntos básicos, lectura de patrones y confección ' +
      'de prendas o accesorios artesanales.',
    imagenUrl: img('photo-1584464491033-06628f3a6b7b'),
  },
  {
    tipo: 'Cristiano',
    conProfesor: true,
    profesor: { nombre: 'Ignacio Fuentes', rut: '11123761-1', email: 'ignaciofuentes@gmail.com' },
    descripcion:
      'Grupo de reflexión y servicio con enfoque cristiano: valores, voluntariado escolar ' +
      'y actividades comunitarias.',
    imagenUrl: img('photo-1529156069898-49953e39b3ac'),
  },
  {
    tipo: 'Videojuego',
    alias: ['Videojuegos'],
    conProfesor: false,
    descripcion:
      'Diseño y análisis de videojuegos: mecánicas, narrativa, balance y prototipado ' +
      'con motores educativos. Promueve el juego responsable.',
    imagenUrl: img('photo-1542751371-adc38448a05e'),
  },
  {
    tipo: 'Huerta',
    conProfesor: false,
    descripcion:
      'Agricultura urbana escolar: siembra, compost, riego y cosecha. Conecta ciencias ' +
      'con alimentación saludable y cuidado del medio ambiente.',
    imagenUrl: img('photo-1416879595882-3373a0480b5b'),
  },
  {
    tipo: 'Tenis de mesa',
    conProfesor: false,
    descripcion:
      'Técnica de drive, revés, servicio y juego de dobles. Mejora reflejos, concentración ' +
      'y fair play en torneos internos.',
    imagenUrl: img('photo-1626224583764-f87db24ac4ea'),
  },
  {
    tipo: 'Musculacion',
    alias: ['Musculación'],
    conProfesor: true,
    profesor: {
      nombre: 'Patricia Herrera',
      rut: '17845392-4',
      email: 'patriciaherrera@gmail.com',
    },
    descripcion:
      'Entrenamiento de fuerza con técnica segura: calentamiento, máquinas, peso libre ' +
      'y rutinas progresivas supervisadas.',
    imagenUrl: img('photo-1534438327276-14e5300c3a48'),
  },
  {
    tipo: 'Defensa personal',
    conProfesor: true,
    profesor: {
      nombre: 'Sebastian Morales',
      rut: '19562847-1',
      email: 'sebastianmorales@gmail.com',
    },
    descripcion:
      'Artes marciales y defensa personal: coordinación, disciplina, autocontrol ' +
      'y técnicas de protección en situaciones de riesgo.',
    imagenUrl: img('photo-1555597673-b21d5c935865'),
  },
];

export function normalizarNombreTaller(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}
