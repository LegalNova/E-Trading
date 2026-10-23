# 10 · Seguridad y antiexplotación

> 24-10-2026. Se comprueba con `scripts/attack.sh <url>` (15 ataques) y `scripts/e2e.sh <url>` (recorrido completo). Ambos crean cuentas `@ejemplo.com` y las borran al terminar.

## 1. Agujeros encontrados en la auditoría y cómo se cerraron

| # | Ataque | Riesgo | Defensa | Prueba |
|---|---|---|---|---|
| 1 | Lanzar muchas compras a la vez | Gastar el mismo saldo varias veces | Cada acción bloquea la fila del usuario (`SELECT … FOR UPDATE`) dentro de una transacción: sus peticiones van de una en una | 10 × 2.500 € con 10.000 € → 3 ejecutadas, saldo nunca negativo |
| 2 | Registrarse con el email del admin | Robar el panel de administración | `ADMIN` solo si el email está **verificado** (Google); si no, a mano con `scripts/promote-admin.ts` | Cuenta con ese email y contraseña → 403 |
| 3 | Abrir una lección bloqueada por URL | Desbloquear el stop loss sin estudiar | El servidor exige que la lección esté disponible | 403 `LESSON_LOCKED` |
| 4 | Repetir el mismo quiz | XP infinita | XP como mucho 2 veces al día por lección (base y bonus) | 76 · 48 · 0 · 0 |
| 5 | Falsear el tiempo de respuesta | Bonus de rapidez gratis | El tiempo se mide con la hora del servidor | — |
| 6 | Repetir la prueba Premium | Premium gratis para siempre | Una prueba por cuenta; caduca sola a los 7 días | 403 `TRIAL_USED` |
| 7 | Reutilizar la clave antiduplicados de otro | Ver la orden de otra persona | La clave se guarda con el id del usuario | Órdenes distintas |
| 8 | Petición desde otra web (CSRF) | Operar en nombre del usuario | Las escrituras exigen el mismo origen; cookie SameSite=Lax | 403 |
| 9 | Spam en formularios públicos | Llenar la BD | Límite por IP (5/10 min), campo trampa y validación | 6.ª → 429 |
| 10 | Peticiones enormes | Agotar memoria | Máximo 32 KB por petición | 413 |
| 11 | Fuerza bruta de contraseñas | Entrar en cuentas | Límites de Better Auth guardados en BD (10 intentos / 5 min); contraseña ≥ 8 y con número | 400 sin número |
| 12 | Menores | Contratar sin permiso | 14+ para registrarse; Premium para 14–17 solo con consentimiento | 403 |
| 13 | Tareas programadas | Ejecutarlas a voluntad | `Authorization: Bearer CRON_SECRET` | 401 |
| 14 | Saturar la API | Caída o coste | Límite por IP: 600 lecturas y 90 escrituras por minuto | — |

## 2. Defensas generales

- **Cabeceras:** CSP (solo recursos propios, sin `eval` en producción, `frame-ancestors 'none'`), HSTS con preload, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` (sin cámara, micro, ubicación ni pagos) y COOP. Sin cabecera `X-Powered-By`.
- **Entradas:** todo se valida con Zod en el servidor (formatos, longitudes y listas cerradas); importes como texto decimal.
- **Precios y ejecución:** siempre los del servidor (F3); el navegador nunca envía un precio.
- **Soluciones de los quizzes:** solo en el servidor; se revela la de cada pregunta tras responderla.
- **Sesión:** cookie HttpOnly, Secure y SameSite=Lax; 30 días.
- **Datos separados:** producción en el esquema `v2`, desarrollo en `v2_dev` (D-033).
- **Secretos:** solo en las variables de entorno de Vercel y `.env.local` (fuera de git).

## 3. Límites conocidos (aceptados por ahora)

- `script-src 'unsafe-inline'`: Next.js genera scripts en línea en páginas estáticas; un CSP con *nonce* obligaría a renderizar cada página en el servidor. Mitigado: React escapa todo el contenido y no hay HTML de usuarios.
- Sin verificación de email (D-035): una persona podría registrarse con un email ajeno. No da acceso a nada de esa persona, pero impide el admin por email.
- Las órdenes pendientes se revisan cada hora (Vercel gratis) y al abrir la app; cada minuto con cron-job.org (D-036).
