# E-Trading v2 · Plan de trabajo

> Documento vivo. Es la referencia para saber **qué hacemos, en qué orden, cómo sabemos que algo está terminado y quién hace qué**. Se actualiza al cerrar cada etapa.

---

## 1. Dónde estamos

| Qué | Estado |
|---|---|
| Diseño (rebranding 3a + 47 pantallas con contrato de API) | ✅ Hecho en Claude Design |
| Demo interactiva para enseñar | ✅ Hecha · https://claude.ai/artifact/JYmqiqbhzNFTFG86PFzGLp |
| App actual en producción (v1) | Funciona, pero se sustituirá. No se toca hasta el corte final |
| Infraestructura disponible | GitHub, Vercel (gratuito), Neon (gratuito), claves de Finnhub, Stripe (test), Anthropic y Resend |

**Qué es la demo y qué no:** sirve para enseñar el producto y recoger opiniones. Los datos son de ejemplo y no hay servidor ni base de datos detrás. No es la app final.

---

## 2. Cómo trabajamos (el sistema)

### 2.1 Reglas

1. **Una sola fuente de verdad:** todo lo decidido vive en la carpeta `docs/` del proyecto. Si no está escrito, no está decidido.
2. **Cada decisión importante se apunta** en `DECISIONES.md`: qué, por qué y alternativas descartadas. Así no volvemos a discutir lo mismo.
3. **Una etapa a la vez.** No se empieza la siguiente sin cumplir el *criterio de salida* de la actual.
4. **Siempre algo que probar.** Cada etapa termina con un enlace que puedes abrir en el móvil.
5. **Sinceridad:** si algo no funciona, falla o no se puede hacer gratis, se dice tal cual, con la causa y las opciones.
6. **Nada de datos inventados en producción**, ni precios ni estadísticas.

### 2.2 Quién hace qué

| Joan (fundador) | Claude |
|---|---|
| Decide el producto y aprueba cada etapa | Propone, investiga, diseña la solución técnica y la construye |
| Prueba en el móvil y da feedback | Documenta, prueba y despliega en enlaces de prueba |
| Crea cuentas y claves secretas en servicios externos (no puedo hacerlo por seguridad) | Te dice exactamente qué crear y para qué, paso a paso |
| Revisa el contenido educativo (o busca quien lo revise) | Escribe el contenido con fuentes y lo traduce |

### 2.3 Cómo es cada sesión de trabajo

1. **Inicio (2 min):** repaso del estado y del objetivo concreto de la sesión.
2. **Trabajo:** construyo y te aviso si aparece algo que necesite tu decisión.
3. **Cierre (5 min):** qué está hecho, cómo probarlo (enlace), qué queda pendiente y cuál es el siguiente paso.

### 2.4 Tablero de tareas

`TAREAS.md` con cuatro columnas: **Por hacer · En curso · Bloqueado (y por qué) · Hecho**. Cada tarea lleva la etapa a la que pertenece y su criterio de "hecho".

### 2.5 Definición de "hecho" para cualquier pieza de código

- Funciona en el enlace de prueba, en móvil y escritorio, en claro y oscuro.
- Tiene sus estados: cargando, vacío y error.
- Tiene tests si toca dinero, puntos, vidas o rachas.
- Está documentado lo que haga falta, y la build y los tests pasan.

---

## 3. Documentos del proyecto (`docs/`)

| Documento | Contenido | Se escribe en |
|---|---|---|
| `01-producto.md` | Visión, para quién es, problema, propuesta de valor, *core loop* diario, qué NO es | Etapa 1 |
| `02-gamificacion.md` | Estudio de Duolingo aplicado: XP, vidas, racha, gemas, logros, liga, Lumi, límites éticos | Etapa 1 (base) y Etapa 4 (detalle) |
| `03-mercado.md` | Qué significa "replicar el mercado real": fuentes por activo, retrasos, horarios, comisiones, tipos de orden, criterios de fidelidad | Etapa 1 (base) y Etapa 3 (detalle) |
| `04-contenido.md` | Plan de estudios: unidades, objetivos de aprendizaje, cómo se escriben clases y quizzes juntos, fuentes, revisión | Etapa 1 (base) y Etapa 5 (detalle) |
| `05-negocio.md` | Free y Premium, precios, colegios y academias, afiliación, métricas de éxito | Etapa 1 |
| `06-arquitectura.md` | Stack, estructura del código, base de datos, servicios externos, costes y límites | Etapa 1 |
| `07-contrato-api.md` | Las notas del diseño convertidas en el contrato definitivo frontend ↔ backend | Etapa 1 |
| `DECISIONES.md` · `TAREAS.md` · `GLOSARIO.md` | Registro de decisiones, tablero y términos | Siempre |

---

## 4. Etapas

> Las duraciones son orientativas y se miden en **sesiones de trabajo largas**. Las fechas dependen de tu disponibilidad para revisar.

### Etapa 0 · Demo ✅
- **Resultado:** demo interactiva publicada.
- **Úsala ahora:** enséñala a 5–10 personas de tu público (18–45 años, sin experiencia) y apunta qué entienden, qué no y qué les gustaría. Vale más que cualquier suposición.

### Etapa 1 · Fundamentos (1–2 sesiones)
- **Objetivo:** escribir la "constitución" del proyecto, es decir, los 7 documentos de la sección 3 en versión base.
- **Cómo:** yo redacto cada documento, tú lo lees y respondes con cambios. Son cortos (1–2 páginas), con decisiones y no con relleno.
- **Criterio de salida:** los 7 documentos aprobados por ti y las dudas abiertas listadas con fecha.

### Etapa 2 · Frontend completo (4–6 sesiones)
- **Objetivo:** la app entera navegable con el diseño nuevo, con datos simulados que siguen exactamente el contrato de API.
- **Incluye:**
  - Proyecto nuevo (rama `v2`, Next.js 15 + TypeScript).
  - Sistema de diseño 3a (claro y oscuro).
  - Las pantallas de 01 a 07.
  - Idiomas castellano, catalán e inglés.
  - App instalable en el móvil (PWA).
- **Criterio de salida:**
  - Todas las pantallas del diseño existen con sus estados.
  - Cambiar de idioma y de tema funciona.
  - Enlace de prueba en el móvil.
  - Tu visto bueno visual.

### Etapa 3 · Núcleo funcional (4–6 sesiones)
- **Objetivo:** que la app funcione de verdad en lo básico.
- **Incluye:**
  - Base de datos (Neon + Prisma).
  - Cuentas: email y Google.
  - Onboarding, con la pregunta de género.
  - Mercado con fuentes reales gratuitas: Finnhub para EE. UU., Binance y CoinGecko para cripto, BCE y Twelve Data para divisas, y velas guardadas para las lecciones.
  - Órdenes (mercado, límite, stop y take profit), cartera, riesgo, comisiones y tipo de cambio.
- **Primero, prueba de fuentes:** una tabla de activos con su fuente y si queda en tiempo real, con retraso o fuera. Me la apruebas antes de construir el simulador.
- **Criterio de salida:**
  - Te registras, compras y vendes a precio real, y la cartera cuadra al céntimo.
  - Tests de órdenes, comisiones y concurrencia en verde.
  - Ningún precio inventado.

### Etapa 4 · Gamificación (3–4 sesiones)
- **Objetivo:** el hábito diario.
- **Pasos:** primero el estudio de cómo lo hace Duolingo, con datos públicos y qué copiar y qué no. Después, reglas cerradas en `02-gamificacion.md`. Por último, la implementación: XP, niveles con género, vidas, racha por zona horaria, gemas, objetivos diarios, 32 logros, liga semanal y mensajes de Lumi.
- **Criterio de salida:** un día completo de uso real da XP, racha y objetivos coherentes. La liga no premia arriesgarlo todo. Tests de racha (zona horaria y cambio de hora) en verde.

### Etapa 5 · Contenido (continuo, empieza con las unidades 1–3)
- **Objetivo:** clases y quizzes profesionales.
- **Cómo:**
  - El plan de estudios define, para cada lección, qué sabrá hacer el alumno al terminar.
  - Clase y quiz se escriben juntos, con fuentes contrastadas.
  - Se traducen a catalán e inglés.
  - Tú revisas (o alguien con formación financiera).
  - Se publican desde el panel.
- **Criterio de salida (por unidad):** objetivos cumplidos, quiz alineado con la clase, revisión hecha y publicada en los 3 idiomas.

### Etapa 6 · Prueba con usuarios reales (2–3 semanas de calendario)
- **Objetivo:** que 20–50 personas usen la app de verdad.
- **Mediremos:** cuántos terminan el onboarding, hacen la primera lección y la primera operación, y vuelven al día siguiente y a la semana.
- **Criterio de salida:** informe con datos y la lista priorizada de cambios.

### Etapa 7 · Retención e ingresos (cuando la etapa 6 lo justifique)
- **Incluye:**
  - Premium con Stripe.
  - Notificaciones (racha, órdenes, alertas).
  - Panel de administración completo.
  - Oferta para colegios y academias.
  - Ajustes de hábito según los datos.
- **Cuándo pasar a planes de pago:** Vercel Pro y datos de mercado de pago cuando haya usuarios o cobros. Vercel gratuito no permite uso comercial.
- **Criterio de salida:** primer pago real procesado y métricas de conversión medidas.

**Corte a producción:** al final de la etapa 3 o de la 4, cuando la v2 sea mejor que la v1, se sustituye la app actual. Tengo tu permiso y hoy no hay usuarios que migrar.

---

## 5. Cosas que dependen de ti (sin prisa, se necesitan a partir de la etapa 3)

| Qué | Para qué | Cuándo |
|---|---|---|
| Credenciales de Google OAuth (Client ID y Secret) | Entrar con Google | Etapa 3 |
| Cuenta gratuita en cron-job.org | Ejecutar órdenes pendientes y alertas cada pocos minutos sin pagar Vercel Pro | Etapa 3 |
| Confirmar el dominio e-trading.com (comprobaré si está libre; si no, buscamos alternativa) | Emails y web definitiva | Etapa 3 |
| Revisión del contenido financiero | Calidad y seguridad legal | Etapa 5 |
| Personas para la prueba | Validar el producto | Etapa 6 |

---

## 6. Riesgos principales y cómo los controlamos

| Riesgo | Control |
|---|---|
| Construir mucho sin que nadie lo use | Demo ya hoy y prueba con usuarios en la etapa 6, antes de escribir las 50 clases |
| Datos de mercado gratuitos insuficientes (bolsa española en tiempo real) | Retraso avisado o activo fuera del catálogo; plan de pago cuando haya ingresos |
| Contenido financiero con errores | Fuentes contrastadas y revisión humana antes de publicar |
| Mecánicas que rocen el juego o presionen a menores | Límites éticos escritos en `02-gamificacion.md` desde el principio |
| Topes de los planes gratuitos | Caché compartida y arquitectura que gasta poco; vigilancia de consumo |

---

## 7. Siguiente paso

**Etapa 1, sesión 1:** redacto `01-producto.md` (visión, usuario, *core loop*, qué NO es) y `05-negocio.md`, porque condicionan todo lo demás. Tú los revisas y seguimos con mercado, gamificación, contenido, arquitectura y contrato de API.
