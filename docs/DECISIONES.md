# Registro de decisiones

> Cada decisión: **qué**, **por qué** y **alternativas descartadas**. Estados: ✅ decidida · ⏳ pendiente · 🔁 revisable con datos.

| ID | Decisión | Por qué | Descartado | Estado | Fecha |
|---|---|---|---|---|---|
| D-001 | Base de datos **Neon** (PostgreSQL) | El proyecto de Supabase se borró; Neon ya está integrado con Vercel | Supabase | ✅ Joan | 2026-10-23 |
| D-002 | **Todo gratis** hasta validar con usuarios reales | Minimizar coste antes de saber si funciona | Vercel Pro y datos de pago desde el inicio | ✅ Joan | 2026-10-23 |
| D-003 | Mercado con **fuentes gratuitas** y sin precios inventados (ver `03-mercado.md`) | Fidelidad real sin coste | Precios simulados (v1) | ✅ Joan | 2026-10-23 |
| D-004 | Acceso con **email y Google**. Apple, más adelante | Apple exige cuenta de desarrollador (99 €/año) | Apple desde el inicio | ✅ Joan | 2026-10-23 |
| D-005 | Dominio. **e-trading.com está registrado** desde 1997 y en venta en Afternic (precio de reventa). **e-trading.app** y **etradingapp.com** parecen libres (~10–20 €/año) | — | — | ⏳ Joan | 2026-10-23 |
| D-006 | Admin inicial: **jvidalalmirall@gmail.com**; la contraseña la pone Joan | — | — | ✅ Joan | 2026-10-23 |
| D-007 | El onboarding **pregunta el tratamiento** (femenino, masculino o neutro) para los títulos de nivel; se puede cambiar en Ajustes | Evitar títulos mal dirigidos | Neutro por defecto sin preguntar | ✅ Joan | 2026-10-23 |
| D-008 | Idiomas **es, ca, en**, preparado para añadir más sin tocar código | Público de España; ampliable | Solo castellano | ✅ Joan | 2026-10-23 |
| D-009 | La v2 **sustituye a la v1** en producción cuando esté lista (hoy, 0 usuarios) | Producto nuevo | Mantener las dos | ✅ Joan | 2026-10-23 |
| D-010 | Identidad visual **3a**: Manrope, negro, blanco, grises y un único azul `#0071E3`/`#2997FF`; verde y rojo solo para subidas y bajadas | Elegida en Claude Design | 1a, 1b, 1c, 2a | ✅ Joan | 2026-10-23 |
| D-011 | Barra inferior **Inicio · Clases · Mercado · Liga · Perfil**. La maqueta de Inicio de `Identidad` (Inicio · Mercado · Aprender · IA · Más) es anterior y no se sigue | Mandan el README y las pantallas | — | ✅ | 2026-10-23 |
| D-012 | Protector de racha = **200 gemas** (aparece en la pantalla 05.1; el prompt decía que faltaba) | Manda el diseño | — | ✅ | 2026-10-23 |
| D-013 | Orden a mercado con el mercado cerrado: **201 con `status: PENDING`** y `executesAt`, en vez del «409 MARKET_CLOSED» de la nota de 04.5 | La orden sí se crea; un 409 indicaría que falló | 409 | ✅ | 2026-10-23 |
| D-014 | **Límite, stop loss y take profit** bloqueados hasta la lección «Gestión del riesgo» o Premium. La maqueta 04.3 muestra «Límite» sin candado, pero el README incluye las tres | Manda el README, que es explícito | Límite libre | ✅ | 2026-10-23 |
| D-015 | **Next.js 16** en lugar de 15 | Es la versión estable actual; el prompt se escribió antes | Next.js 15 | ✅ | 2026-10-23 |
| D-016 | En el MVP, el **contenido vive en archivos del repo** y se carga a la base de datos; el editor del admin llega después | Revisión y traducción más fáciles, versionado | Editor del admin desde el día 1 | ✅ | 2026-10-23 |
| D-017 | El XP por operar tiene **tope: 3 operaciones al día** | No incentivar operar compulsivamente | XP ilimitado por operación | 🔁 | 2026-10-23 |
| D-018 | **Sin dividendos ni *spread*** en el MVP (limitación documentada) | Simplicidad; las fuentes gratuitas no los dan fiables | — | 🔁 | 2026-10-23 |
| D-019 | **Sin usuarios falsos en la liga.** Con pocos usuarios, grupos más pequeños | Nunca inventar datos | Bots (como en la v1) | ✅ | 2026-10-23 |
| D-020 | Tareas cada minuto con **cron-job.org** (gratis) llamando a endpoints protegidos | Vercel gratuito solo permite crons diarios | Vercel Pro ahora | ✅ | 2026-10-23 |
| D-021 | Dinero en JSON como **texto decimal** | Precisión | Números en coma flotante | ✅ | 2026-10-23 |
| D-022 | Se empieza con **50 gemas** | Que se pueda probar la tienda pronto | 0 | 🔁 | 2026-10-23 |
| D-023 | Lección «Stop loss y take profit» **gratis** dentro de la unidad 3 «Gestión del riesgo» (Premium) | Que un usuario Free pueda desbloquear las órdenes avanzadas estudiando | Unidad 3 entera de pago | ✅ Joan | 2026-10-23 |
| D-024 | Construir las pantallas de cada capa a medida que se termina su backend, sobre un **frontend completo con datos simulados** (etapa 2) | Ver y probar pronto sin rehacer nada | Todo el frontend al final | ✅ Joan | 2026-10-23 |
| D-025 | En la etapa 2 los datos simulados viven **en el navegador** (localStorage) detrás de la misma interfaz `Api` que usará la versión HTTP | Probar todo sin backend; en la etapa 3 solo se cambia la implementación | Servidor de pruebas | ✅ | 2026-10-23 |
| D-026 | La interfaz está en **es/ca/en**; el **contenido** (lecciones, preguntas, frases de Lumi, logros, títulos de nivel) sigue solo en castellano hasta la etapa 5, donde se traduce con el resto del temario | El temario aún no es definitivo | Traducir contenido provisional | ✅ | 2026-10-23 |
| D-027 | Añadidos al contrato: `PathLesson.requiresPremium` (lección bloqueada por plan, no por orden) y `Level.xpLevelStart` (barra de nivel) | La pantalla los necesita y no se podían deducir | Calcularlos en el cliente | ✅ | 2026-10-23 |
| D-028 | La liga ordena por **puntos** y la tabla los muestra (la XP va debajo del nombre) | Con XP en la columna principal el orden parecía incorrecto | Columna de XP como en la maqueta | ✅ | 2026-10-23 |
| D-029 | En inglés el símbolo de moneda va delante (€10,482.35); en castellano y catalán, detrás | Convención de cada idioma | Siempre detrás | ✅ | 2026-10-23 |
| D-030 | Acceso con **Better Auth** (email + contraseña, Google, sesiones en nuestra base de datos) en lugar de Auth.js v5 | Auth.js v5 sigue en beta; Better Auth es estable y era la alternativa prevista en `06-arquitectura.md` | Auth.js v5 | ✅ | 2026-10-23 |
| D-031 | Fuentes de mercado: Finnhub (EE. UU.), Binance (cripto), **Yahoo no oficial** (España, Xetra, índices, divisas y todas las velas), BCE de respaldo. Ver `03-mercado.md` §2 bis | Es la única vía gratuita para la bolsa española y los gráficos; sin ella habría que quitar SAN, ITX, BBVA, VWCE e IBEX | Quitar esos activos · proveedor de pago | ✅ Joan | 2026-10-23 |
| D-032 | Sin Redis por ahora: la caché de precios es la tabla `Quote` + la CDN de Vercel | Upstash pediría otra cuenta; con pocos usuarios no hace falta | Upstash Redis | ✅ | 2026-10-23 |
| D-033 | Las tablas de la v2 viven en el esquema **`v2`** de la misma base de Neon; la v1 sigue en `public` hasta el cambio | No tocar la v1 en producción | Base nueva | ✅ | 2026-10-23 |
| D-034 | Proyecto de Vercel propio **e-trading-app** (rama `v2` = producción, enlace público) → https://e-trading-app.vercel.app | Enlace propio y fácil de compartir | Previews del proyecto de la v1 | ✅ Joan | 2026-10-23 |
