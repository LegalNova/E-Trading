# 06 · Arquitectura

> Estado: **base para aprobar** (etapa 1). Versiones comprobadas en npm en octubre de 2026.

## 1. Stack

| Pieza | Elección | Motivo / nota |
|---|---|---|
| Framework | **Next.js 16** (App Router) + React 19 + TypeScript estricto | Versión estable actual. El prompt original decía 15 porque se escribió antes; la 16 es compatible con todo lo pedido |
| Estilos | Tailwind CSS 4 con los **tokens de la identidad 3a** (Manrope, `tabular-nums`, claro y oscuro) | Fiel al diseño y rápido de mantener |
| Idiomas | `next-intl`: castellano, catalán e inglés en archivos de traducción | Añadir un idioma = añadir archivos |
| Datos en cliente | TanStack Query | Caché, reintentos y estados de carga |
| Validación | Zod 4, con esquemas **compartidos** entre la API y el frontend | Un solo contrato tipado |
| Base de datos | **PostgreSQL en Neon** + Prisma 7 (con `@prisma/adapter-neon`) | Ya integrado con Vercel; ramas de base de datos por entorno |
| Autenticación | Auth.js v5 (email + contraseña con argon2, Google; Apple más adelante). Cookie httpOnly | v5 sigue oficialmente en *beta*, pero es la recomendada para el App Router. Si diera problemas, la alternativa es Better Auth |
| Caché y límites | Upstash Redis (plan gratuito): precios, *rate limiting* y bloqueos de tareas | Una llamada al proveedor de datos sirve a todos los usuarios |
| Precios en vivo | SSE (`/api/market/stream`) con reconexión automática; *polling* de respaldo | En Vercel las conexiones largas se cortan, así que el cliente se reconecta solo |
| Pagos | Stripe (Checkout, Customer Portal, webhooks), en modo test hasta lanzar | — |
| Email y avisos | Resend (emails en los 3 idiomas) · web push con VAPID (después del MVP) | — |
| IA | API de Claude solo para el análisis semanal de Lumi (Premium), con plantillas de respaldo | Coste acotado |
| Tests | Vitest (unitarios e integración, contra una rama de test de Neon) · Playwright (e2e) | Docker no es necesario |
| Registros | pino con `requestId`. Sentry cuando haya cuenta | — |
| Despliegue | Vercel: la rama `v2` genera previews y `main` va a producción tras el corte | — |

## 2. Estructura del repositorio (rama `v2`)

```
src/
  app/                    Rutas: (public) landing · (app) app móvil · admin · api/**
  server/<dominio>/       service · repository · schemas · events
    auth  onboarding  learning  quiz  market  trading
    gamification  companion  billing  notifications  admin  public
  shared/                 Esquemas Zod y tipos compartidos con el frontend
  ui/                     Componentes del sistema de diseño 3a
  i18n/                   Traducciones es · ca · en
content/                  Lecciones y quizzes en archivos (fuente para el seed)
prisma/                   schema.prisma · migraciones · seed
design/                   Diseño de Claude Design (contrato visual y de API)
docs/                     Estos documentos
```

**Reglas del código:**
- Los *route handlers* solo validan, llaman al servicio y responden.
- La lógica vive en `server/<dominio>/service`.
- Sin `any`; ESLint y Prettier sin avisos.

## 3. Eventos de dominio

Los efectos secundarios (XP, racha, objetivos, logros, Lumi, avisos y liga) se disparan con **eventos** desde un único bus, guardados en la base de datos en la misma transacción (patrón *outbox*) y con oyentes idempotentes. Así terminar un quiz y ejecutar una orden devuelven las recompensas con la misma forma y nunca se dan dos veces.

**Eventos principales:**
- Aprendizaje: `LessonCompleted`, `QuizAnswered`, `QuizFinished`, `PlacementFinished`.
- Mercado: `OrderFilled`, `OrderRejected`, `RiskyOrderAcknowledged`, `PriceAlertTriggered`.
- Progreso: `XpGained`, `AchievementUnlocked`, `StreakExtended`, `StreakAtRisk`, `StreakLost`, `StreakFrozen`.
- Sistema: `PlanChanged`, `DayRolledOver`, `LeagueClosed`, `LessonPublished`, `UserInactive`, `PortfolioReset`.

## 4. Datos (resumen del modelo)

- **Cuenta:** User (con `gender` F/M/N para los títulos), cuentas OAuth, tokens de email, onboarding, aceptación del aviso legal, consentimiento del tutor, ajustes, suscripciones push.
- **Aprendizaje:** Course → Unit → Lesson → LessonStep (con traducciones), progreso, Quiz → Question → Option, intentos, respuestas, fallos, vidas.
- **Mercado:** Asset, Exchange, MarketHoliday, Candle (velas fijas de lecciones), QuoteCache (última cotización real).
- **Simulador:** Portfolio, Position, Order, Trade, PortfolioSnapshot, Watchlist, PriceAlert.
- **Gamificación:** XpEvent, LevelTitle, GemTransaction, Streak y StreakDay, DailyGoal, Achievement y UserAchievement, LeagueDivision, LeagueGroup, LeagueMember.
- **Lumi:** Companion, CompanionSkin, CompanionTemplate.
- **Pagos y avisos:** Subscription, ProcessedWebhookEvent, Notification.
- **Plataforma:** Setting (clave-valor validada con Zod), AuditLog, DomainEvent, Waitlist, ContactMessage.

**Dinero:** `Decimal` en la base de datos y `decimal.js` en el código. Nunca `float`. 2 decimales en EUR y USD; 8 en cantidades.

## 5. Entornos

| Entorno | Rama de código | Rama de base de datos (Neon) | URL |
|---|---|---|---|
| Local | cualquiera | `dev` | localhost |
| Preview | `v2` | `preview` | URL de preview de Vercel |
| Test (CI) | — | `test` | — |
| Producción | `main` (tras el corte) | `main` | e-trading-six.vercel.app (hasta tener dominio) |

## 6. Tareas programadas

| Tarea | Frecuencia | Cómo, gratis |
|---|---|---|
| Refrescar precios | Cada minuto con mercados abiertos | Cron externo gratuito (cron-job.org) que llama a un endpoint protegido con `CRON_SECRET`; además, al pedirlos los usuarios |
| Ejecutar órdenes pendientes y alertas | Cada minuto | Ídem |
| Cierre de día por zona horaria (racha, objetivos, aviso de racha en peligro) | Cada hora | Ídem |
| Foto diaria de la cartera | Cada hora, por zona horaria | Ídem |
| Cierre de liga | Lunes 00:00 UTC | Vercel Cron (1 al día permitido en el plan gratuito) |
| Recordatorio de fin de prueba | Diario | Vercel Cron |

Todas son **idempotentes**: si se ejecutan dos veces, el resultado es el mismo. Se protegen con un bloqueo en Redis.

## 7. Seguridad

- Autorización comprobada en el servidor en cada endpoint; nadie puede leer ni tocar datos de otro usuario.
- *Rate limiting* en acceso, quizzes, órdenes y endpoints públicos.
- Cabeceras de seguridad y CSP. CSRF cubierto por Auth.js.
- Las claves solo viven en el servidor (variables de entorno de Vercel); nunca en el código ni en el navegador.
- Las soluciones de quizzes y ejercicios nunca se envían al cliente antes de responder.
