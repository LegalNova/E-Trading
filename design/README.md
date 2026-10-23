# E-Trading · Diseño para el backend

Mockups HTML de todas las pantallas. Ábrelos en el navegador. Debajo de cada pantalla hay una nota técnica (fuente monoespaciada) con los datos que pinta y los endpoints que necesita. **Esas notas son el contrato frontend ↔ backend.** Los valores visibles (Laura, 10.482,35 €, etc.) son ejemplos; en producción todo sale de BD o del proveedor de mercado.

## Archivos

| Archivo | Capas | Pantallas |
|---|---|---|
| 01 Landing.dc.html | 1 Landing | 01.1 escritorio, 01.2 móvil + estados waitlist |
| 02 Acceso y Onboarding.dc.html | 2 Log in | 02.1–02.5 auth · 02.6–02.13 onboarding (7 pasos + consentimiento tutor) |
| 03 Inicio y Clases.dc.html | 4 Interfaz, 5 Clases, 6 Quizzes | 03.1 Inicio · 03.2 camino · 03.3–03.4 pasos de lección · 03.5–03.6 quiz · 03.7 resultado · 03.8 sin vidas |
| 04 Mercado.dc.html | 7 Mercado | 04.1 lista · 04.2 ficha · 04.3 orden · 04.4 aviso de riesgo · 04.5 ejecutada/pendiente · 04.6 cartera · 04.7 órdenes, historial, alertas |
| 05 Progreso y Personaje.dc.html | 8 Gamificación, 9 Personaje, 10 Notificaciones | 05.1 racha · 05.2 logros · 05.3 liga · 05.4 perfil y hábitos · 05.5 avisos · 05.6 catálogo de estados de Lumi |
| 06 Premium y Ajustes.dc.html | 3 Pagos, RGPD | 06.1 planes · 06.2 vuelta de Checkout · 06.3 ajustes · 06.4 cuenta, reinicio, exportar/borrar |
| 07 Admin.dc.html | 11 Admin | 07.1 métricas · 07.2 contenido · 07.3 usuarios, ajustes globales, auditoría |

## Navegación de la app

Barra inferior: **Inicio · Clases · Mercado · Liga · Perfil**. Cartera y Órdenes cuelgan de Mercado. Racha, Logros, Avisos y Ajustes se abren desde Inicio o Perfil. Premium (06.1) se abre desde cualquier función bloqueada.

## Decisiones de diseño que afectan al backend

- **Personaje**: se llama Lumi por defecto (renombrable). Moods: `HAPPY, CELEBRATE, WORRIED, CALM, SAD, SLEEPY, THINKING`. El frontend dibuja la cara; el backend devuelve `{ text, mood, cta? }`.
- **Funciones bloqueadas**: las órdenes límite, stop loss y take profit se desbloquean con la lección «Gestión del riesgo» **o** con Premium. Responder `{ locked, unlockBy }`.
- **Riesgo**: si una compra deja un activo por encima de `Settings.riskThresholdPct` (20 %), `preview.risk.flagged=true` y se muestra 04.4 antes de confirmar.
- **Racha**: cuenta una lección, un quiz o una operación al día, en la zona horaria del usuario.
- **Liga**: 5 divisiones (Novato, Aprendiz, Analista, Estratega, Experto) en grupos de 30. Suben los 7 primeros y bajan desde el puesto 26.
- **Planes**: Free y Premium (7,99 €/mes o 59,99 €/año, con 7 días de prueba). Los precios salen de Stripe/Settings, no del código.
- **Saldo inicial**: 10.000 € en Free y 50.000 € en Premium. Al pasar a Premium se suma la diferencia.
- **Precios sin conexión**: si el proveedor falla, se usa el último precio en caché con `stale: true, asOf`, y el frontend muestra un banner ámbar.
- **Estados vacíos**: las estadísticas públicas y las métricas del admin muestran 0 o «—» si no hay datos. Nunca inventar.
- **Idiomas**: es, ca, en. Moneda de referencia: EUR o USD.
- **Errores**: siempre `{ error: { code, message } }`. Códigos usados en los mockups: `EMAIL_IN_USE, WEAK_PASSWORD, INVALID_CREDENTIALS, ACCOUNT_BLOCKED, TOKEN_EXPIRED, UNDER_MIN_AGE, GUARDIAN_CONSENT_REQUIRED, EMAIL_NOT_VERIFIED, NO_LIVES, INSUFFICIENT_FUNDS, MARKET_CLOSED, FEATURE_LOCKED, RESET_LIMIT, RATE_LIMITED`.

## Tokens visuales (solo referencia)

Fuente Manrope (cifras `tabular-nums`). Fondo `#F5F5F7`, superficie `#FFFFFF`, borde `#E5E5EA`, texto `#1D1D1F` / `#6E6E73`, acento `#0071E3` (oscuro `#2997FF`), subida `#248A3D` (`#30D158`), bajada `#D70015` (`#FF453A`). Modo oscuro: fondo `#000000`, superficies `#1C1C1E`/`#2C2C2E`. Identidad completa en `Identidad E-Trading.dc.html` (versión 3a).
