# Prompt para Claude Code: backend completo de E-trading

## 1. Contexto / Rol

Actúa como un ingeniero full-stack senior con experiencia en apps educativas gamificadas (estilo Duolingo) y en plataformas fintech con datos de mercado en tiempo real. Vas a construir el backend completo de **E-trading**, una app para aprender trading desde cero de forma sencilla y divertida.

Cómo funciona el producto:
- El usuario se registra, hace un test de nivel y sigue un camino de **clases** cortas (qué es una acción, velas japonesas, soportes y resistencias, gestión del riesgo, psicología del trader, cripto, etc.).
- Después de cada clase hay **quizzes** para comprobar lo aprendido.
- En el **Mercado** practica con **dinero virtual** sobre precios reales: compra y vende acciones, cripto, índices y divisas, ve su cartera y su rentabilidad. Nunca se opera con dinero real.
- Mantiene una **racha** diaria, gana XP, sube de nivel y compite en ligas semanales según rentabilidad y aprendizaje.
- Le acompaña **un personaje mascota** (tipo el búho de Duolingo) que le guía en las clases, le avisa de la racha, comenta sus operaciones y le frena cuando arriesga demasiado.
- Hay un plan gratuito y un plan **Premium** de pago.

El frontend ya está diseñado. Los archivos del diseño están en `/design` (HTML/mockups). **Léelos todos antes de escribir una sola línea de backend** y deduce de ellos cada dato, acción y estado que necesita la interfaz. Si algo del diseño contradice este documento, manda el diseño y apúntalo en `DECISIONES.md`.

## 2. Consulta / Tarea

Genera el backend completo de E-trading, con todas sus capas, listo para conectar al frontend del diseño y desplegar en Vercel. Trabaja por fases y no pases a la siguiente hasta que la anterior compile y sus tests pasen:

1. Modelo de datos y migraciones
2. Autenticación (pasarela de log in)
3. Pagos (pasarela de pago, suscripción Premium)
4. Clases y lecciones
5. Quizzes
6. Mercado: datos de precios + simulador de trading con dinero virtual
7. Gamificación: XP, niveles, racha, logros, ligas
8. Personaje mascota
9. Notificaciones
10. Panel de administración
11. Landing (endpoints públicos)

## 3. Especificaciones

### Stack
- **Next.js 15 (App Router) + TypeScript** con Route Handlers y Server Actions.
- **PostgreSQL** en Supabase con **Prisma** como ORM.
- **Supabase Auth** o **Auth.js (NextAuth v5)**. Elige uno y justifícalo en `DECISIONES.md`.
- **Stripe** para la suscripción Premium (Checkout + Customer Portal + webhooks).
- **Proveedor de datos de mercado** detrás de una interfaz propia (`MarketDataProvider`) para poder cambiarlo: Twelve Data o Finnhub para acciones, índices y divisas; Crypto.com o CoinGecko para cripto.
- **Redis (Upstash)** como caché de precios y para rate limiting.
- **Supabase Realtime** o Server-Sent Events para precios en vivo en la app.
- **Resend** para emails, **Web Push** para notificaciones.
- **Zod** para validar todas las entradas.
- **Vercel Cron** para tareas programadas (racha, ligas, órdenes pendientes, snapshots de cartera).

### Capa 1. Landing
- `POST /api/waitlist`: guarda email. Evita duplicados.
- `POST /api/contact`: formulario de contacto.
- `GET /api/public/stats`: números reales (usuarios, lecciones completadas, operaciones simuladas). Nunca datos inventados; si no hay datos, devuelve 0.
- `GET /api/public/ticker`: unos cuantos precios en vivo para la cinta de la landing (desde caché).
- Rate limiting en todos los endpoints públicos.

### Capa 2. Pasarela de log in
- Registro con email + contraseña, Google y Apple.
- Verificación de email.
- Recuperar contraseña con enlace de un solo uso que caduca en 1 hora.
- Roles: `USER` y `ADMIN`, con middleware de permisos por ruta.
- Onboarding guardado por pasos: nombre, fecha de nacimiento, experiencia previa, objetivos, test de nivel, elección del personaje y saldo virtual inicial.
- Edad mínima configurable. Si el usuario es menor, guarda el consentimiento de padre/madre/tutor para el pago de Premium.

### Capa 3. Pasarela de pago
- Planes **Free** y **Premium** (mensual y anual). Ajusta precios y ventajas a lo que muestre el diseño.
- Premium da, por ejemplo: todas las clases, vidas ilimitadas en quizzes, más dinero virtual, órdenes avanzadas (stop loss, take profit, límite), análisis de cartera del personaje y acceso a ligas premium.
- Stripe Checkout para pagar, Customer Portal para gestionar o cancelar.
- Prueba gratuita configurable.
- Webhooks en `/api/webhooks/stripe` con verificación de firma e idempotencia (tabla `ProcessedWebhookEvent`).
- El estado del plan se lee siempre de la base de datos, actualizada por los webhooks. Nunca del cliente.
- Nunca guardes datos de tarjeta. Solo IDs de Stripe.

### Capa 4. Interfaz (API que consume la app)
Deduce del diseño cada pantalla y crea sus endpoints. Como mínimo:
- `GET /api/me`: perfil, plan, XP, nivel, racha, gemas, vidas, saldo virtual, estado del personaje.
- `GET /api/home`: todo lo que muestra la pantalla principal en una sola llamada (siguiente lección, racha, objetivos del día, resumen de cartera, mensaje del personaje).
- `PATCH /api/me/settings`: idioma (catalán, castellano, inglés), moneda de referencia, notificaciones, objetivo diario.

### Capa 5. Clases y lecciones
- Estructura: `Course` → `Unit` → `Lesson` → `LessonStep`.
- Tipos de paso: texto, imagen o gráfico, vídeo, gráfico interactivo con datos históricos reales (por ejemplo, "señala el soporte en esta vela"), ejercicio práctico en el simulador y quiz.
- Progreso por usuario: bloqueada / disponible / completada, y porcentaje por unidad.
- Las lecciones se desbloquean en orden. El test de nivel puede saltar unidades.
- Algunas lecciones desbloquean funciones del Mercado (por ejemplo, no puedes poner un stop loss hasta hacer la lección de gestión del riesgo).
- Contenido en tres idiomas.

### Capa 6. Quizzes
- Tipos de pregunta: opción única, opción múltiple, verdadero/falso, ordenar, rellenar hueco, y "lee el gráfico" (el usuario marca un punto o elige una tendencia sobre un gráfico).
- Corrección **siempre en el servidor**. El cliente nunca recibe la respuesta correcta antes de contestar.
- Sistema de **vidas**: fallar resta una vida, se regeneran con el tiempo (configurable). Premium = vidas ilimitadas.
- XP por respuesta correcta, bonus por quiz perfecto y por velocidad.
- Guarda cada intento (`QuizAttempt`, `QuizAnswer`) para estadísticas y para repasar los fallos.

### Capa 7. Mercado (simulador con dinero virtual)
**Datos de mercado**
- Catálogo de activos (`Asset`): acciones, ETFs, índices, cripto y divisas, con símbolo, nombre, tipo, mercado y horario de apertura.
- `GET /api/market/assets`, `GET /api/market/assets/:symbol`, buscador.
- Precio actual, variación diaria y velas OHLC por intervalo (1m, 5m, 1h, 1d, 1w) para los gráficos.
- Precios cacheados en Redis con TTL corto. Nunca pidas al proveedor una vez por usuario.
- Precios en vivo por SSE o Realtime para los activos que el usuario está mirando.
- Respeta horarios de mercado: fuera de horario las órdenes de acciones quedan pendientes hasta la apertura. Cripto opera 24/7.

**Simulador**
- Cada usuario tiene una `Portfolio` con saldo virtual inicial (configurable, más alto en Premium).
- Tipos de orden: mercado, límite, stop loss y take profit (las avanzadas solo en Premium o tras la lección correspondiente).
- Solo largos al principio. Deja preparado el modelo para cortos más adelante, pero desactivado.
- Comisión simulada configurable para que sea realista.
- La ejecución usa **el precio del servidor en ese momento**, nunca un precio enviado por el cliente.
- Todas las operaciones se hacen en una transacción de base de datos con bloqueo, para que no se pueda gastar el mismo saldo dos veces.
- Cron que revisa las órdenes pendientes (límite, stop, take profit) y las ejecuta cuando toca.
- Posiciones abiertas, historial de operaciones, P&L realizado y no realizado, rentabilidad total y diaria.
- Snapshot diario del valor de la cartera para el gráfico de evolución.
- Botón para reiniciar la cartera (con límite de veces).
- Lista de seguimiento (watchlist) y alertas de precio.

**Gestión del riesgo**
- Si una operación supera un porcentaje de la cartera (configurable), el backend la marca como arriesgada y el personaje avisa antes de confirmar.
- Estadísticas de hábitos: operaciones por día, porcentaje de aciertos, pérdida máxima. Las usa el personaje para dar consejos.

**Aviso legal**
- La app es educativa. No se opera con dinero real, no se conecta a ningún broker y no da recomendaciones de inversión personalizadas. Guarda la aceptación de este aviso en el onboarding y devuélvelo en los endpoints que lo necesite el frontend.

### Capa 8. Racha y gamificación
- **Racha**: se suma un día si el usuario completa al menos una lección, un quiz o una operación simulada ese día, según **su zona horaria**.
- Protector de racha (se compra con gemas o viene con Premium). Se consume automáticamente si falla un día.
- Cron diario que cierra el día, actualiza rachas y lanza recordatorios a quien aún no ha hecho nada.
- XP, niveles (curva configurable), gemas, logros (`Achievement`, `UserAchievement`) y objetivos diarios.
- Logros de trading: primera operación, primera operación con stop loss, cartera en positivo una semana, diversificar en 3 tipos de activo...
- **Ligas semanales**: grupos de 30 usuarios. Puntuación = XP de la semana + rentabilidad de la cartera ajustada por riesgo (no premies apostarlo todo a una sola operación). Suben y bajan de división cada lunes.

### Capa 9. Personaje mascota
- Tabla `Companion` con nombre, aspecto elegido, estado de ánimo y accesorios desbloqueados.
- Reacciona a eventos: lección completada, quiz perfecto, racha en peligro, racha perdida, primera operación, operación con mucho riesgo, gran ganancia, gran pérdida, inactividad.
- `GET /api/companion/message?context=...`: devuelve el mensaje y la animación o estado de ánimo que debe mostrar el frontend.
- Los mensajes salen de una tabla de plantillas por evento e idioma, con variables (`{nombre}`, `{dias_racha}`, `{activo}`, `{porcentaje}`).
- Deja preparado un hook para que en Premium el personaje analice la cartera con la API de Claude, pero todo tiene que funcionar sin ella.
- Tono: cercano y motivador, nunca culpabilizador. Mensajes cortos y claros (pensado también para usuarios con TDAH o dislexia). Cuando pierde dinero, el personaje explica qué pasó y qué aprender, no le riñe.
- El personaje nunca dice "compra X" ni "vende Y". Explica conceptos, no da recomendaciones.

### Capa 10. Notificaciones
- Tabla `Notification` + preferencias por tipo.
- Canales: in-app, email y web push.
- Eventos: racha en peligro, orden ejecutada, alerta de precio, logro desbloqueado, resultado de la liga, nueva lección disponible.
- Límite de recordatorios al día (configurable).

### Capa 11. Panel de administración
- CRUD de cursos, unidades, lecciones, quizzes y plantillas del personaje.
- Gestión de activos disponibles en el Mercado.
- Gestión de usuarios (bloquear, reiniciar cartera, ver plan).
- Ajustes globales en tabla `Settings`: saldo inicial, comisión simulada, vidas, curva de niveles, límites de riesgo.
- Métricas: usuarios activos, retención, conversión a Premium, operaciones simuladas.
- Todas las acciones de admin quedan en un log de auditoría.

### Seguridad y transversal
- Validación con Zod en todas las entradas.
- Autorización comprobada en el servidor en cada endpoint (nadie puede ver ni tocar la cartera de otro).
- Rate limiting en auth, quizzes, órdenes y endpoints públicos.
- Las claves de los proveedores de datos y de Stripe solo en el servidor. Documentadas en `.env.example`.
- RGPD: exportar y borrar cuenta (`GET /api/me/export`, `DELETE /api/me`).
- Errores con formato consistente (`{ error: { code, message } }`) y logs estructurados.
- Datos de ejemplo con `prisma db seed`: 1 curso con 3 unidades y 10 lecciones, quizzes de cada tipo, 20 activos, 3 usuarios (nuevo, avanzado con cartera y operaciones, admin) y una liga con usuarios de prueba.

## 4. Criterios de calidad

- Nada de datos inventados en producción. Precios del proveedor y estadísticas de la base de datos.
- Cada pantalla del diseño tiene sus endpoints. Al acabar, haz una tabla en `COBERTURA.md`: pantalla del diseño → endpoints que usa. Si falta alguna, no has terminado.
- TypeScript estricto, sin `any`. Dinero con `Decimal`, nunca con `float`.
- Tests con **Vitest** para la lógica crítica: ejecución de órdenes (mercado, límite, stop, take profit), saldo insuficiente, operaciones simultáneas, cálculo de P&L y comisiones, horarios de mercado, racha (cambio de zona horaria y protector), corrección de quizzes, vidas, puntuación de ligas y webhooks de Stripe.
- Todo el flujo de pago probado en modo test de Stripe.
- Si el proveedor de datos falla, la app sigue funcionando con el último precio en caché y lo indica.
- Código organizado por dominio (`/src/server/auth`, `/payments`, `/learning`, `/quiz`, `/market`, `/trading`, `/gamification`, `/companion`, `/notifications`, `/admin`).
- `npm run build`, `npm run test` y `npx prisma migrate dev` tienen que pasar sin errores al final de cada fase.

## 5. Formato de respuesta

1. Antes de programar, devuélveme un **plan corto**: lista de modelos de Prisma, lista de endpoints agrupados por capa, proveedor de datos elegido y decisiones tomadas. Espera a que lo apruebe.
2. Después, ve fase por fase. Al acabar cada una, dime en pocas líneas qué has hecho, qué archivos has creado y si hay algo pendiente.
3. Al final entrega:
   - El código en el repo
   - `README.md` con cómo arrancarlo en local y desplegarlo en Vercel
   - `.env.example`
   - `DECISIONES.md`
   - `COBERTURA.md`
   - Documentación de la API en `API.md` (o `openapi.yaml`)
4. Si algo del diseño no está claro, pregunta antes de inventártelo.
