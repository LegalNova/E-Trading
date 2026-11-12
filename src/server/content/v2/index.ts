import 'server-only'
// Curso v2 (docs/curso-v2): 14 secciones → 38 unidades, más el vocabulario aparte.
// Cada sección acaba en un reto final (80 %) que abre las secciones que dependen de ella.
// Orden desde noviembre de 2026: primero «Invierte desde hoy» (06-enganche-y-progresion.md).
import { section, unit, type ContentUnit } from '../dsl'
import u01 from './u01'
import u02 from './u02'
import u03 from './u03'
import u04 from './u04'
import u05 from './u05'
import u06 from './u06'
import u07 from './u07'
import u08 from './u08'
import u09 from './u09'
import u10 from './u10'
import u11 from './u11'
import u12 from './u12'
import u13 from './u13'
import u14 from './u14'
import u15 from './u15'
import u16 from './u16'
import u17 from './u17'
import u18 from './u18'
import u19 from './u19'
import u20 from './u20'
import u21 from './u21'
import u22 from './u22'
import u23 from './u23'
import u24 from './u24'
import u25 from './u25'
import u26 from './u26'
import u27 from './u27'
import u28 from './u28'
import u29 from './u29'
import u30 from './u30'
import u31 from './u31'
import u32 from './u32'
import u33 from './u33'
import u34 from './u34'
import u35 from './u35'
import vocab from './vocab'
import h1 from './h1'
import h2 from './h2'
import h3 from './h3'

// Sección 0 «Invierte desde hoy» (docs/curso-v2/06-enganche-y-progresion.md): lo más práctico del curso primero.
// Sus clases se movieron desde otras unidades (h1.ts, h2.ts, h3.ts): conservan su id, el progreso y las traducciones.
const hook = (id: string, title: string, description: string, lessons: ContentUnit['lessons']) => unit({ id, order: 0, title, description, lessons })

const units: ContentUnit[] = [
  ...section('s0', 'Invierte desde hoy', [], [
    hook('h1', 'Tu primera inversión', 'Compra tu primera acción, entiende por qué se mueve y por qué invertir pronto lo cambia todo', h1),
    hook('h2', 'Invertir como los que ganan', 'Índices, ETFs, diversificar y aportar cada mes: la cartera sencilla que funciona a largo plazo', h2),
    // Aprobar «La regla del 1 %» (u24l3, en esta unidad) desbloquea las órdenes límite, stop y take profit del Mercado
    { ...hook('h3', 'Tu primer análisis', 'Mira una empresa, un gráfico y tu propio miedo con criterio antes de comprar', h3), unlocksFeature: 'STOP_LOSS' },
  ]),
  // (quien aprobó «El stop loss», u6l4, antes de este cambio también las tiene: RISK_LESSONS en catalog.ts)
  ...section('s2', 'Cómo funcionan los mercados', ['s0'], [u05, u06, u07]),
  ...section('s3', 'Productos de inversión', ['s2'], [u08, u09, u10, u11]),
  ...section('s4', 'Criptomonedas y blockchain', ['s2'], [u12, u13]),
  ...section('s5', 'Divisas y materias primas', ['s3'], [u14, u15]),
  ...section('s6', 'Análisis fundamental', ['s3'], [u16, u17, u18]),
  ...section('s7', 'Análisis técnico', ['s2'], [u19, u20, u21, u22, u23]),
  ...section('s8', 'Riesgo, estrategias y trading', ['s7'], [u24, u25, u26]),
  ...section('s9', 'Psicología del inversor', ['s2'], [u27, u28]),
  ...section('s10', 'Construir tu cartera', ['s3', 's9'], [u29, u30]),
  // Finanzas personales: útiles pero opcionales; se abren al terminar la sección 0 y no bloquean nada
  ...section('s1', 'Tu dinero en orden', ['s0'], [u01, u02, u03, u04]),
  ...section('s11', 'España: impuestos y estafas', ['s3'], [u31, u32, u33]),
  ...section('s12', 'Historia de crisis y burbujas', ['s9'], [u34]),
  ...section('s13', 'Laboratorio de mercado', ['s7', 's8'], [u35]),
]
/** Número de unidad en el orden en que se muestran */
export const V2_UNITS: ContentUnit[] = [...units.map((u, i) => ({ ...u, order: i + 1 })), vocab]
