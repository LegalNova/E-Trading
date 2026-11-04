// Iconos que puede usar el contenido de las clases (nada de emojis en la interfaz: quedan poco profesionales).
// Cada clave se dibuja con un icono de línea de Lucide (src/client/play/glyph.tsx).
export const GLYPHS = [
  'bread', 'fish', 'cherry', 'carrot', 'milk', 'apple', 'pasta', 'egg', 'chicken', 'pizza', 'oil', 'coffee', 'soda', 'food', 'popcorn',
  'bank', 'wallet', 'piggy', 'cash', 'coins', 'card', 'receipt', 'document', 'percent', 'up', 'down', 'chart',
  'candles', 'pie', 'bars', 'scale', 'shield', 'alert', 'lock', 'key', 'bitcoin', 'gem', 'company', 'building',
  'factory', 'store', 'briefcase', 'globe', 'exchange', 'repeat', 'gauge', 'pulse', 'layers', 'plane', 'car', 'train',
  'bus', 'bike', 'truck', 'ship', 'anchor', 'fuel', 'mining', 'home', 'phone', 'call', 'laptop', 'clothes',
  'game', 'movie', 'tv', 'music', 'gym', 'study', 'book', 'doctor', 'pharma', 'repair', 'tools', 'power',
  'haircut', 'cart', 'basket', 'gift', 'umbrella', 'package', 'ticket', 'tag', 'family', 'person', 'baby', 'pet',
  'heart', 'message', 'mail', 'news', 'megaphone', 'video', 'camera', 'bot', 'chip', 'server', 'database', 'wifi',
  'warning', 'verified', 'siren', 'rocket', 'flame', 'snowflake', 'mountain', 'target', 'timer', 'hourglass', 'calendar', 'clock',
  'bell', 'search', 'eye', 'brain', 'deal', 'idea', 'award', 'crown', 'star', 'dice', 'sparkles', 'leaf',
  'sprout', 'sun', 'cloud', 'flag', 'cpu',
] as const
export type Glyph = (typeof GLYPHS)[number]
