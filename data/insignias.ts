export type InsigniaRareza = 'comun' | 'rara' | 'epica' | 'legendaria'

export interface Insignia {
  id: string
  emoji: string
  nombre: string
  rareza: InsigniaRareza
  descripcion: string
  trigger: string // qué acción la desbloquea
}

export const INSIGNIAS: Insignia[] = [
  // Comunes
  { id: 'primera-semilla', emoji: '🌱', nombre: 'Primera semilla', rareza: 'comun', descripcion: 'Completaste tu primera clase', trigger: 'clase_completada_1' },
  { id: 'estudiante', emoji: '📚', nombre: 'Estudiante', rareza: 'comun', descripcion: 'Completaste 5 clases', trigger: 'clases_completadas_5' },
  { id: 'primera-inversion', emoji: '💰', nombre: 'Primera inversión', rareza: 'comun', descripcion: 'Ejecutaste tu primera operación en el simulador', trigger: 'primera_operacion' },
  { id: 'analista-junior', emoji: '🎯', nombre: 'Analista junior', rareza: 'comun', descripcion: 'Completaste 10 retos', trigger: 'retos_completados_10' },
  { id: 'amigo-ia', emoji: '🤖', nombre: 'Amigo de la IA', rareza: 'comun', descripcion: 'Enviaste 20 mensajes a E-AI', trigger: 'ia_mensajes_20' },
  // Raras
  { id: 'trader-practicas', emoji: '📊', nombre: 'Trader en prácticas', rareza: 'rara', descripcion: 'Ejecutaste 10 operaciones en el simulador', trigger: 'operaciones_10' },
  { id: 'diversificador', emoji: '🌈', nombre: 'Diversificador', rareza: 'rara', descripcion: 'Tienes posiciones en 5 activos diferentes', trigger: 'posiciones_5_activos' },
  { id: 'racha-fuego', emoji: '🔥', nombre: 'Racha de fuego', rareza: 'rara', descripcion: 'Mantuviste una racha de 7 días consecutivos', trigger: 'racha_7_dias' },
  { id: 'en-positivo', emoji: '📈', nombre: 'En positivo', rareza: 'rara', descripcion: 'Tu portafolio tiene +5% de rentabilidad', trigger: 'rentabilidad_5' },
  { id: 'gestor-riesgo', emoji: '⚖️', nombre: 'Gestor de riesgo', rareza: 'rara', descripcion: 'Completaste todos los retos de gestión de riesgo', trigger: 'retos_riesgo_completados' },
  // Épicas
  { id: 'mente-maestra', emoji: '🧠', nombre: 'Mente maestra', rareza: 'epica', descripcion: 'Completaste 30 retos', trigger: 'retos_completados_30' },
  { id: 'diamante', emoji: '💎', nombre: 'Diamante', rareza: 'epica', descripcion: 'Mantuviste una racha de 30 días consecutivos', trigger: 'racha_30_dias' },
  { id: 'al-infinito', emoji: '🚀', nombre: 'Al infinito', rareza: 'epica', descripcion: 'Tu portafolio superó los 15.000€', trigger: 'portfolio_15000' },
  { id: 'mercado-global', emoji: '🌍', nombre: 'Mercado global', rareza: 'epica', descripcion: 'Operaste con activos de 4 categorías diferentes', trigger: 'categorias_4' },
  { id: 'rey-simulador', emoji: '👑', nombre: 'Rey del simulador', rareza: 'epica', descripcion: 'Llegaste al top 3 de tu liga semanal', trigger: 'liga_top3' },
  // Legendarias
  { id: 'campeon', emoji: '🏆', nombre: 'Campeón', rareza: 'legendaria', descripcion: 'Ganaste una liga semanal', trigger: 'liga_primer_puesto' },
  { id: 'estrella-oro', emoji: '⭐', nombre: 'Estrella de oro', rareza: 'legendaria', descripcion: 'Alcanzaste el nivel 5 (Maestro)', trigger: 'nivel_5' },
  { id: 'maestro-inversor', emoji: '🎖️', nombre: 'Maestro inversor', rareza: 'legendaria', descripcion: 'Completaste todas las 12 clases', trigger: 'clases_completadas_12' },
  { id: 'mentalidad-elite', emoji: '🦁', nombre: 'Mentalidad Elite', rareza: 'legendaria', descripcion: 'Mantuviste una racha de 100 días consecutivos', trigger: 'racha_100_dias' },
  { id: 'easytrading-pro', emoji: '💫', nombre: 'E-Trading Pro', rareza: 'legendaria', descripcion: 'Completaste los 50 retos', trigger: 'retos_completados_50' },
]
