export type Broker = {
  id:          string
  name:        string
  tagline:     string
  logo:        string       // emoji
  color:       string
  rating:      number       // 1-5
  commission:  string
  minDeposit:  string
  pros:        string[]
  cons:        string[]
  bestFor:     string
  badge?:      string
  url:         string       // env var key
}

export const BROKERS: Broker[] = [
  {
    id:         'degiro',
    name:       'DEGIRO',
    tagline:    'El bróker de bajo coste líder en Europa',
    logo:       '🟢',
    color:      '#00D47A',
    rating:     4.5,
    commission: 'Desde 2€ + 0,038% por operación',
    minDeposit: 'Sin mínimo',
    pros: [
      'Comisiones muy bajas en Europa',
      'Amplia selección de activos globales',
      'Plataforma intuitiva para principiantes',
      'Sin comisión de custodia en ETFs',
    ],
    cons: [
      'Sin cuenta demo',
      'Atención al cliente solo digital',
      'Sin criptomonedas',
    ],
    bestFor:  'Principiantes e inversores a largo plazo',
    badge:    'Recomendado',
    url:      process.env.NEXT_PUBLIC_AFFILIATE_DEGIRO ?? 'https://www.degiro.es',
  },
  {
    id:         'trading212',
    name:       'Trading 212',
    tagline:    'Opera acciones y ETFs sin comisiones',
    logo:       '🔵',
    color:      '#42A5F5',
    rating:     4.3,
    commission: '0€ comisión en acciones y ETFs',
    minDeposit: '1€',
    pros: [
      'Sin comisiones en acciones y ETFs',
      'Acciones fraccionadas desde 1€',
      'Cuenta demo ilimitada incluida',
      'App móvil muy valorada',
    ],
    cons: [
      'Spread ligeramente más alto',
      'Menor variedad de productos',
      'Sin productos apalancados avanzados',
    ],
    bestFor:  'Inversores con poco capital inicial',
    url:      process.env.NEXT_PUBLIC_AFFILIATE_TRADING212 ?? 'https://www.trading212.com',
  },
  {
    id:         'etoro',
    name:       'eToro',
    tagline:    'La plataforma social de inversión más grande',
    logo:       '🟣',
    color:      '#9945FF',
    rating:     4.0,
    commission: 'Sin comisión. Spread variable.',
    minDeposit: '50€',
    pros: [
      'Copy trading: copia a inversores expertos',
      'Acciones, ETFs y criptomonedas en un lugar',
      'Gran comunidad social de traders',
      'Cuenta demo de 100.000$',
    ],
    cons: [
      'Spread más alto que competidores',
      'Comisión de retirada de 5$',
      'Plataforma más compleja para principiantes',
    ],
    bestFor:  'Quien quiere aprender copiando a expertos',
    url:      process.env.NEXT_PUBLIC_AFFILIATE_ETORO ?? 'https://www.etoro.com',
  },
  {
    id:         'ib',
    name:       'Interactive Brokers',
    tagline:    'El bróker de los profesionales',
    logo:       '🟡',
    color:      '#FFD700',
    rating:     4.6,
    commission: 'Desde 0,05% con mínimo 1€',
    minDeposit: 'Sin mínimo',
    pros: [
      'Acceso a todos los mercados del mundo',
      'Tasas de interés competitivas',
      'Herramientas profesionales de análisis',
      'Producto más completo del mercado',
    ],
    cons: [
      'Plataforma compleja para principiantes',
      'Curva de aprendizaje pronunciada',
      'Interfaz anticuada en desktop',
    ],
    bestFor:  'Inversores avanzados y traders activos',
    url:      process.env.NEXT_PUBLIC_AFFILIATE_IB ?? 'https://www.interactivebrokers.com',
  },
]
