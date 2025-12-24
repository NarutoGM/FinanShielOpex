import { IconPaint, IconArmchair, IconWall, IconHammer } from "@tabler/icons-react";

export const services = [
  {
    id: 1,
    title: 'Servicio de Pintura',
    description: 'Empastado y pintura profesional para interiores y exteriores. Acabados de alta calidad y renovación de fachadas.',
    // Imagen de pintura de paredes
    imageUrl: '/images/servicios/pintura.avif', 
    link: '/services/pintura',
    icon: <IconPaint size={20} />,
    projects: [
      '/images/servicios/pintura/1.png', 
      '/images/servicios/pintura/2.png', 
      '/images/servicios/pintura/3.jpg', 
    ]
  },
  {
    id: 2,
    title: 'Muebles Melamina',
    description: 'Diseño y fabricación de muebles a medida: cocinas, closets, escritorios y centros de entretenimiento modernos.',
    // Imagen de cocina/muebles modernos
    imageUrl: '/images/servicios/muebles.jpeg', 
    link: '/services/melamina',
    icon: <IconArmchair size={20} />,
    projects: [
      '/images/servicios/muebles/1.jpg', 
      '/images/servicios/muebles/2.jpg', 
      '/images/servicios/muebles/3.jpg', 
    ]
  },
  {
    id: 3,
    title: 'Construcciones en Drywall',
    description: 'Divisiones, cielos rasos, figuras decorativas y ampliaciones rápidas con sistema drywall acústico y térmico.',
    // Imagen de estructura drywall/construcción
    imageUrl: '/images/servicios/drywall.jpg', 
    link: '/services/drywall',
    icon: <IconWall size={20} />,
    projects: [
      '/images/servicios/drywall/1.jpg', 
      '/images/servicios/drywall/2.jpg', 
      '/images/servicios/drywall/3.jpg', 
    ]
  },
  {
    id: 4,
    title: 'Remodelaciones',
    description: 'Renovación integral de espacios, cambio de pisos, enchapados, demoliciones y acabados generales.',
    // Imagen de remodelación/herramientas
    imageUrl: '/images/servicios/remodelacion.jpg', 
    link: '/services/remodelacion',
    icon: <IconHammer size={20} />,
    projects: [
      '/images/servicios/remodelacion/1.jpg', 
      '/images/servicios/remodelacion/2.jpg', 
      '/images/servicios/remodelacion/3.jpg', 
    ]
  }
];