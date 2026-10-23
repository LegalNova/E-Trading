# 07 · Contrato de API

> Fuente: las notas monoespaciadas de cada pantalla de `design/`. **Si este documento y una nota del diseño se contradicen, manda el diseño**, y la diferencia se apunta en `DECISIONES.md`.
> Marcado con **(+)**: endpoints que no aparecen en el diseño y añadimos nosotros.

## 0. Reglas comunes

- **Error:** siempre `{ "error": { "code": "…", "message": "…" } }`, con el `message` traducido al idioma del usuario (es/ca/en).
- **Códigos del diseño:** `EMAIL_IN_USE`, `WEAK_PASSWORD`, `INVALID_CREDENTIALS`, `ACCOUNT_BLOCKED`, `TOKEN_EXPIRED`, `UNDER_MIN_AGE`, `GUARDIAN_CONSENT_REQUIRED`, `EMAIL_NOT_VERIFIED`, `NO_LIVES`, `INSUFFICIENT_FUNDS`, `MARKET_CLOSED`, `FEATURE_LOCKED`, `RESET_LIMIT`, `RATE_LIMITED`.
- **Códigos que añadimos (+):** `VALIDATION_ERROR` (422), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `INSUFFICIENT_GEMS` (402), `CONFLICT` (409).
- **Dinero en JSON:** importes y cantidades viajan como **texto decimal** (`"10482.35"`, `"0.03100000"`) para no perder precisión. El frontend los formatea en español (`10.482,35 €`).
- **Fechas:** ISO 8601 en UTC. La zona horaria del usuario está en su perfil.
- **Listas:** paginación por cursor (`?cursor=…` → `{ items, nextCursor }`).
- **Recompensas comunes (`effects`):** las respuestas que generan progreso incluyen `{ xp, goalsCompleted[], achievementsUnlocked[], levelUp?, unlockedFeatures[], companion? { message, mood } }`.
- **Idempotencia:** `POST /api/orders` exige la cabecera `Idempotency-Key`.

## 1. Landing (01)

| Método y ruta | Entrada | Salida | Errores |
|---|---|---|---|
| POST `/api/waitlist` | `{ email }` | 201 | 409 duplicado · 422 email inválido · 429 |
| POST `/api/contact` | `{ name, email, reason: SCHOOL\|PRESS\|SUPPORT\|OTHER, message }` | 201 | 422 · 429 |
| GET `/api/public/ticker` | — | `[{ symbol, name, changePct, stale }]` (desde caché) | — |
| GET `/api/public/stats` | — | `{ activeUsers, lessonsCompleted, simulatedTrades }` (siempre de BD; 0 si no hay datos) | — |
| GET `/api/public/plans` | — | Planes y precios (de Stripe/Settings) | — |

## 2. Acceso y onboarding (02)

| Método y ruta | Entrada | Salida | Errores |
|---|---|---|---|
| POST `/api/auth/register` | `{ email, password, locale }` | 201 + email de verificación. Rol `USER` | 409 `EMAIL_IN_USE` · 422 `WEAK_PASSWORD` |
| POST `/api/auth/login` | `{ email, password }` | Sesión | 401 `INVALID_CREDENTIALS` · 423 `ACCOUNT_BLOCKED` · 429 tras 5 intentos |
| GET `/api/auth/verify?token=` | — | Marca el email como verificado (un solo uso, 24 h) | 410 `TOKEN_EXPIRED` |
| POST `/api/auth/verify/resend` | — | 200 (espera de 60 s) | 429 |
| POST `/api/auth/email/change` (+) | `{ email }` | 200 + nuevo email de verificación | 409 `EMAIL_IN_USE` |
| POST `/api/auth/password/forgot` | `{ email }` | **Siempre 200** (no revela si existe) | — |
| POST `/api/auth/password/reset` | `{ token, password }` | 200 (un solo uso, 1 h) | 410 `TOKEN_EXPIRED` · 422 `WEAK_PASSWORD` |
| POST `/api/auth/password/change` | `{ current, password }` | 200 | 401 · 422 |
| POST `/api/auth/logout` | — | 200 | — |
| GET `/api/onboarding` | — | Paso pendiente, para retomarlo | — |
| PUT `/api/onboarding/profile` | `{ name, gender: F\|M\|N (+), birthDate, timezone }` | 200 · `requiresGuardianConsent` si es menor de 18 | 403 `UNDER_MIN_AGE` |
| PUT `/api/onboarding/experience` | `{ level: NONE\|SOME\|EXPERIENCED }` | 200 | — |
| PUT `/api/onboarding/goals` | `{ goals: string[], dailyGoalMinutes: 5\|10\|15\|20 }` | 200 | — |
| GET `/api/companion/skins` | — | `[{ id, name, color, unlocked, unlockRule }]` | — |
| PUT `/api/onboarding/companion` | `{ skinId, name }` | 200 | — |
| PUT `/api/onboarding/disclaimer` | `{ accepted: true, version }` | 200 (guarda la aceptación) | — |
| POST `/api/onboarding/complete` | — | Crea cartera (saldo de Settings), Lumi y racha | — |
| POST `/api/guardian-consent` | `{ guardianEmail }` | 200 + email al adulto | — |
| GET `/api/guardian-consent/confirm?token=` | — | Estado `CONFIRMED` (estados `NONE\|PENDING\|CONFIRMED\|REJECTED`) | 410 |

**Reglas:** sin email verificado se puede hacer el onboarding y las clases, pero **no operar ni pagar** (403 `EMAIL_NOT_VERIFIED`). Una cuenta bloqueada no entra. `/admin` y `/api/admin/**` son solo para `ADMIN`.

## 3. Clases (03.2–03.4)

| Método y ruta | Entrada | Salida |
|---|---|---|
| GET `/api/courses` (+) | — | Cursos disponibles (en el MVP, «Trading desde cero») |
| GET `/api/courses/:id/path` | — | `units[{ id, order, title, progressPct, premiumOnly, unlocksFeature?, lessons[{ id, title, status: LOCKED\|AVAILABLE\|COMPLETED, stars 0–3, minutes, xp }] }]` (traducido) |
| GET `/api/lessons/:id` | — | `{ title, steps[{ id, order, type: TEXT\|IMAGE\|VIDEO\|INTERACTIVE_CHART\|SIMULATOR_TASK\|QUIZ, content, companionTip? }] }` |
| POST `/api/lessons/:id/progress` | `{ stepId }` | 200 (para retomar) |
| POST `/api/lessons/steps/:id/check` | `{ candleIndex }` | `{ correct, explanation }`. **La solución solo vive en el servidor** |

## 4. Quiz y vidas (02.9–02.10, 03.5–03.8)

| Método y ruta | Entrada | Salida | Errores |
|---|---|---|---|
| POST `/api/quiz/:quizId/start` | — | `{ attemptId, questions[{ id, type: SINGLE\|MULTIPLE\|TRUE_FALSE\|ORDER\|FILL_BLANK\|CHART_POINT\|CHART_TREND, prompt, options[], chart? }] }` **sin soluciones** | 409 `NO_LIVES` |
| POST `/api/quiz/attempts/:id/answer` | `{ questionId, answer, elapsedMs }` | `{ correct, correctAnswer, explanation, livesLeft, xpGained }` | 409 `NO_LIVES` · 409 si ya está respondida |
| POST `/api/quiz/attempts/:id/finish` | — | `{ correct, total, stars, durationMs, xp{ base, perfectBonus, speedBonus, total }, streak{ days, extendedToday }, …effects }` (idempotente) | — |
| POST `/api/quiz/placement/start` | — | Como `start`, sin vidas ni feedback | — |
| (finish del test de nivel) | — | `{ correct, total, startUnitId, skippedUnitIds[], initialLevel }` | — |
| GET `/api/me/lives` | — | `{ current, max, nextRegenAt \| null (Premium), regenHours }` | — |
| POST `/api/me/lives/refill` | `{ method: GEMS }` | 200 | 402 `INSUFFICIENT_GEMS` |
| GET `/api/quiz/mistakes` | — | Preguntas falladas para repasar | — |
| POST `/api/quiz/mistakes/review/start` (+) | — | Intento de repaso que **no quita vidas** | — |

**Formatos de respuesta:** `CHART_POINT` admite `{ x: candleIndex }` o `{ price }`, con tolerancia calculada en el servidor. `CHART_TREND` admite `UP|DOWN|SIDEWAYS`.

## 5. Mercado y simulador (04)

| Método y ruta | Entrada | Salida | Errores |
|---|---|---|---|
| GET `/api/market/assets?type&q` | — | `[{ symbol, name, type, exchange, isOpen, price, currency, changePct, sparkline[], stale?, asOf? }]` | — |
| GET `/api/market/assets/:symbol` | — | `{ …, opensAt, closesAt, change, priceInUserCurrency }` | 404 |
| GET `/api/market/assets/:symbol/candles?interval=1m\|5m\|1h\|1d\|1w&from&to` | — | `OHLC[]` | — |
| GET `/api/market/stream?symbols=` | — | SSE: `{ symbol, price, ts }` | — |
| GET/POST/DELETE `/api/watchlist(/:symbol)` | — | Lista de seguimiento | — |
| POST `/api/orders/preview` | `{ symbol, side: BUY\|SELL, type: MARKET\|LIMIT\|STOP_LOSS\|TAKE_PROFIT, amount \| qty, limitPrice? }` | `{ estPrice, qty, fee, cashAfter, weightPct, risk{ flagged, reason, thresholdPct }, allowedTypes[] }` · tipos bloqueados: `{ locked, unlockBy: "LESSON:<id>" \| "PREMIUM" }` | 422 `FEATURE_LOCKED` |
| POST `/api/orders` | Lo mismo + `riskAcknowledged?` · cabecera `Idempotency-Key` | `{ order{ id, status: FILLED\|PENDING\|REJECTED, fillPrice, qty, fee, filledAt, executesAt? }, …effects }` | 422 `INSUFFICIENT_FUNDS` · 422 `FEATURE_LOCKED` · 403 `EMAIL_NOT_VERIFIED` |
| GET `/api/orders?status=PENDING` · DELETE `/api/orders/:id` | — | Órdenes pendientes / cancelar | — |
| GET `/api/trades?cursor=` | — | `[{ side, type, symbol, qty, price, fee, total, realizedPnl?, status, createdAt, rejectReason? }]` | — |
| GET `/api/portfolio` | — | `{ totalValue, cash, dayChange, dayChangePct, totalReturnPct, realizedPnl, unrealizedPnl, positions[{ symbol, qty, avgPrice, marketValue, pnlPct, weightPct }] }` | — |
| GET `/api/portfolio/positions/:symbol` | — | `{ qty, avgPrice, unrealizedPnl, pnlPct, weightPct } \| null` | — |
| GET `/api/portfolio/history?range=1W\|1M\|3M\|ALL` | — | Fotos diarias | — |
| POST `/api/portfolio/reset` | — | Vuelve al saldo inicial; conserva XP, racha y logros | 429 `RESET_LIMIT` |
| GET/POST/PATCH/DELETE `/api/alerts` | `{ symbol, condition: ABOVE\|BELOW, price, active }` | Alertas de precio | — |
| GET `/api/me/trading-stats` | — | `{ tradesPerDay, winRatePct, maxDrawdownPct, insights[] }` | — |

**Mercado cerrado:** una orden a mercado se crea `PENDING` con `executesAt`, con respuesta **201**. El diseño habla de «409 MARKET_CLOSED → PENDING»; ver `DECISIONES.md` D-013. **Si el proveedor falla:** último precio con `{ stale: true, asOf }` y el frontend muestra el banner ámbar.

## 6. Gamificación (03.1, 05.1–05.4)

| Método y ruta | Salida |
|---|---|
| GET `/api/home` | `{ user{name}, streak{days, todayDone}, gems, lives{current, max, nextRegenAt\|null}, companion{message, mood}, nextLesson{id, title, unitTitle, minutes, progressPct}, dailyGoals[{id, label, progress, target, xp, done}], portfolio{totalValue, dayChange, dayChangePct, sparkline[]} }` |
| GET `/api/me` | `{ id, name, plan: FREE\|PREMIUM, planRenewsAt, level{ n, title, xp, xpForNext }, streak, gems, lives, lessonsCompleted, achievementsCount, companion{ name, skinId, mood } }` |
| GET `/api/streak?month=YYYY-MM` | `{ current, best, todayDone, timezone, freezes, days[{ date, status: ACTIVE\|FROZEN\|MISSED\|NONE }] }` |
| POST `/api/shop/streak-freeze` | 200 · 402 `INSUFFICIENT_GEMS` (precio: 200 gemas) |
| GET `/api/achievements` | `[{ id, code, title, description, icon, category: LEARNING\|TRADING\|STREAK, unlocked, unlockedAt?, progress, target, reward{ gems, xp } }]` |
| GET `/api/league/current` | `{ division{ id, name, order }, endsAt, promoteTop, demoteFrom, members[{ rank, userId, displayName, weeklyXp, riskAdjReturnPct, score, isMe }] }` |
| GET `/api/me/gems` (+) | Historial de gemas |

## 7. Lumi (05.6)

| Método y ruta | Salida |
|---|---|
| GET `/api/companion/message?context=EVENT&vars…` | `{ text, mood: HAPPY\|CELEBRATE\|WORRIED\|CALM\|SAD\|SLEEPY\|THINKING, animation?, cta?{ label, deepLink }, suggestedAmount? (en RISKY_TRADE) }` |

## 8. Premium (06.1–06.2)

| Método y ruta | Entrada | Salida | Errores |
|---|---|---|---|
| GET `/api/billing/plans` | — | `[{ id, interval: MONTH\|YEAR, price, currency, trialDays, stripePriceId }]` | — |
| POST `/api/billing/checkout` | `{ planId }` | `{ url }` | 403 `EMAIL_NOT_VERIFIED` · 403 `GUARDIAN_CONSENT_REQUIRED` |
| GET `/api/billing/status` | — | Plan actual (la pantalla de vuelta de Checkout hace *polling*) | — |
| POST `/api/billing/portal` | — | `{ url }` | — |
| POST `/api/webhooks/stripe` | Eventos de Stripe | Verificación de firma, sin duplicados (`ProcessedWebhookEvent`) | 400 |

## 9. Avisos, ajustes y RGPD (05.5, 06.3, 06.4)

| Método y ruta | Entrada | Salida |
|---|---|---|
| GET `/api/notifications?cursor=` | — | `[{ id, type: STREAK_RISK\|ORDER_FILLED\|PRICE_ALERT\|ACHIEVEMENT\|LEAGUE_RESULT\|NEW_LESSON, title, body, deepLink, readAt, createdAt }]` |
| POST `/api/notifications/read` | `{ ids[] }` o `{ all: true }` | 200 |
| GET/PATCH `/api/me/settings` | `{ locale: es\|ca\|en, currency: EUR\|USD, dailyGoalMinutes, theme: AUTO\|LIGHT\|DARK, gender (+), notificationPrefs{ [type]: { inApp, email, push } } }` | Ajustes |
| POST/DELETE `/api/push/subscribe` | `{ endpoint, keys }` | 200 (DELETE es (+)) |
| GET `/api/me/export` | — | JSON con todos los datos del usuario |
| DELETE `/api/me` | Confirmación por contraseña o email | Cancela Stripe, anonimiza lo que haya que conservar y borra el resto |

## 10. Admin (07)

| Método y ruta | Uso |
|---|---|
| GET `/api/admin/metrics?range=7d\|30d\|90d` | `{ dau, mau, retentionD7, premiumConversion, simulatedTrades, funnel{…} }`. Los «—» son vacíos reales, nunca datos falsos |
| GET `/api/admin/metrics/series` · GET `/api/admin/providers/health` | Gráfica diaria · estado de los proveedores de datos |
| CRUD `/api/admin/{courses, units, lessons, lessons/:id/steps, quizzes, questions, companion-templates}` | Contenido con `translations[locale]` y estados `DRAFT\|PUBLISHED` |
| GET `/api/admin/users?q&cursor` · GET `/api/admin/users/:id` · POST `…/block { reason }` · POST `…/unblock` · POST `…/portfolio/reset` | Gestión de usuarios |
| GET/PATCH `/api/admin/settings` · CRUD `/api/admin/assets` | Ajustes globales y catálogo de activos |
| GET `/api/admin/leagues` (+) · POST `/api/admin/leagues/close` (+) | Ver grupos y forzar un cierre |
| GET `/api/admin/audit?cursor` | `AuditLog { actorId, action, entity, entityId, before, after, createdAt }`. **Cada escritura del admin crea uno** en la misma transacción |

## 11. Tareas programadas (+)

`/api/cron/{prices, orders, day-rollover, snapshots, league-close, trial-reminder, lumi-weekly}`. Todas protegidas con `CRON_SECRET`, idempotentes y con bloqueo en Redis.
