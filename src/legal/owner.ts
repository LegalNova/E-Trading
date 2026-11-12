// Datos del titular del servicio. Los exige la ley en el Aviso legal (LSSI-CE art. 10), la Política de privacidad
// (RGPD art. 13) y las Condiciones de contratación (quién vende y a quién se envía el desistimiento).
//
// ⏳ PENDIENTE DE JOAN (auditoría P0-1 y LEG-13): decidir quién figura como titular (persona, autónomo o sociedad).
// Cuando lo sepa, basta con rellenar aquí estos cuatro campos; los cinco textos legales, en los tres idiomas, los leen
// de este archivo:
//   · name     nombre y apellidos, o razón social
//   · nif      NIF (o NIE / CIF)
//   · address  domicilio completo
//   · email    correo de contacto del proyecto (hoy es uno personal: conviene uno propio, p. ej. hola@<dominio>)
// Mientras `nif` o `address` sigan pendientes, la app NO deja iniciar cobros reales (ver ownerReady más abajo y
// assertCanCharge en src/server/billing/stripe.ts). Los pagos de prueba de Stripe sí funcionan.
export const OWNER_PENDING_TEXT = '[pendiente de completar]'

export const OWNER = {
  name: 'Joan Vidal Almirall',
  nif: OWNER_PENDING_TEXT,
  address: OWNER_PENDING_TEXT,
  email: 'jvidalalmirall@gmail.com',
  site: 'https://e-trading-app.vercel.app',
  brand: 'E-Trading',
}

const filled = (v: string) => v.trim().length > 0 && !/pendiente/i.test(v)

/** Campos obligatorios que faltan para poder vender (lista vacía = todo listo) */
export const ownerMissing = (o: typeof OWNER = OWNER): ('name' | 'nif' | 'address' | 'email')[] => (['name', 'nif', 'address', 'email'] as const).filter(k => !filled(o[k]))

/** Qué impide cobrar de verdad: nada en modo de prueba de Stripe; con claves reales, los campos que falten */
export const chargeBlockedBy = (testMode: boolean, o: typeof OWNER = OWNER) => (testMode ? [] : ownerMissing(o))

/** ¿Están los datos del titular que la ley exige antes de cobrar? */
export const ownerReady = (o: typeof OWNER = OWNER) => ownerMissing(o).length === 0
