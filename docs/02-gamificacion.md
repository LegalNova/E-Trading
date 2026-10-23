# 02 · Gamificación

> Estado: **base para aprobar** (etapa 1). El estudio detallado de Duolingo y el ajuste fino de números se hacen en la etapa 4.
> Todos los valores numéricos viven en la tabla `Settings` y se pueden cambiar desde el panel de admin sin tocar código.

## 1. Qué tomamos de Duolingo y qué no

Duolingo ha documentado públicamente (blog de producto y entrevistas) que su retención se apoya en unas pocas mecánicas.

| Mecánica de Duolingo | En E-Trading | Por qué |
|---|---|---|
| **Racha** con protector | Sí | Es el motor del hábito diario |
| **Ligas semanales** de 30 personas con ascenso y descenso | Sí, pero la puntuación incluye rentabilidad **ajustada por riesgo** | Competir sin empujar a arriesgar |
| **XP y niveles** | Sí, con títulos según el tratamiento elegido | Progreso visible |
| **Vidas** (corazones, luego "energía") | Sí: 5 vidas, se pierden en los quizzes | Que pensar antes de responder tenga peso |
| **Gemas** como moneda interna | Sí, solo se ganan jugando y **nunca se compran con dinero** | Evitar la economía de pago |
| **Misiones diarias** | Sí: 3 objetivos al día | Una meta pequeña y concreta cada día |
| **Mascota** que acompaña y avisa | Sí: Lumi | Cercanía y avisos con tono humano |
| Notificaciones con culpa ("me pones triste") | **No** | Nunca culpabilizamos |
| Recompensas aleatorias o cofres | **No** | Es una mecánica de azar y nuestro público incluye menores |

## 2. Economía

### XP

| Acción | XP |
|---|---|
| Completar una lección | La XP de la lección (25–50, según su duración) |
| Quiz | 10 por acierto · **+50 %** si es perfecto · **+10 %** si la media es menor de 15 s por pregunta |
| Operación ejecutada | 15 XP, **solo las 3 primeras del día**. Así no se premia operar compulsivamente |
| Objetivo diario cumplido | Lo que indique cada objetivo (15–25) |
| Logro desbloqueado | Lo que indique el logro |

### Niveles

Curva base 500 × 1,4. El nivel 2 empieza en 500 XP, el 3 en 1.200, el 4 en 2.180 y el 5 en 3.552.

Cada nivel tiene título en tres formas, según el tratamiento elegido en el onboarding. Por ejemplo, el nivel 2 es «Aficionada», «Aficionado» o «Con base».

### Vidas

- 5 como máximo. Se pierde 1 por respuesta incorrecta en los quizzes de lección.
- Se regenera 1 cada 4 h. Se calcula al leer, sin tareas programadas.
- Se pueden recargar todas por **350 gemas**.
- Con Premium son ilimitadas.
- El test de nivel y el repaso de fallos **no** quitan vidas.

### Gemas

- **Se ganan con:** logros (20–50), completar los 3 objetivos del día (+10) y subir de liga (+30).
- **Se gastan en:** recargar vidas (350) y protector de racha (200).
- Se empieza con **50 gemas**.
- No se venden. Todo movimiento queda registrado.

### Racha

- **Día activo:** completar una lección, un quiz o una operación **en la zona horaria del usuario**.
- **Protector:** se usa solo si fallas un día. Se pueden acumular como máximo 2. Premium regala 1 por semana.
- **Hitos (con logro):** 7, 30 y 100 días.

### Objetivos diarios

- Cada día se generan **3** a partir de una lista: completar una lección, quiz perfecto, hacer 2 operaciones, repasar fallos, ganar 50 XP…
- Se adaptan a la meta diaria elegida (5, 10, 15 o 20 minutos).
- Cumplir los 3 da una recompensa fija, sin azar.

### Logros

- **32 logros** en 3 categorías: Aprendizaje, Trading y Racha. Cada uno muestra su progreso, su meta y su recompensa.
- La lista completa se cierra en la etapa 4. Ejemplos: «Primera operación», «Quiz perfecto», «Diversifica en 3 tipos de activo», «Primer stop loss», «Racha de 7 días».

### Liga semanal

- **5 divisiones:** Novato, Aprendiz, Analista, Estratega y Experto.
- Grupos de hasta 30 personas de la misma división. Suben los 7 primeros y bajan los puestos del 26 al 30. Nadie baja de Novato ni sube de Experto.
- Cierra cada lunes a las 00:00 UTC.
- **Puntos** = XP de la semana + k · rentabilidad ajustada por riesgo (tipo Sharpe semanal, con tope ±2 y penalización por concentración). Con k = 100, como mucho ±200 puntos. **Estudiar siempre pesa más que especular.**
- **Sin usuarios inventados.** Con pocos usuarios (la fase de prueba), los grupos se forman con quien haya y los puestos de ascenso y descenso se reparten en proporción. Un ranking con jugadores falsos sería engañar.

## 3. Lumi

El backend decide **qué decir y con qué estado de ánimo**; el frontend dibuja la cara.

| Estado | Eventos | Ejemplo de tono |
|---|---|---|
| HAPPY | Lección completada, primera operación | «¡Hecho, {nombre}! Ya sabes leer {concepto}.» |
| CELEBRATE | Quiz perfecto, gran ganancia, subida de nivel | «¡+{porcentaje} en {activo}! Mira qué hiciste bien para repetirlo.» |
| WORRIED | Operación arriesgada, racha en peligro | «{activo} sería el {porcentaje} de tu cartera. ¿Lo repartimos?» |
| CALM | Gran pérdida, respuesta incorrecta | «{activo} cayó un {porcentaje}. Pasa a todos. Veamos qué aprender.» |
| SAD | Racha perdida, sin vidas | «Se acabó la racha de {dias_racha} días. Hoy empieza otra.» |
| SLEEPY | 3 o más días sin entrar | «Te echaba de menos. ¿Cinco minutos para ponernos al día?» |
| THINKING | Truco en lección, análisis de cartera | «Truco: verde, cierra más arriba de lo que abrió.» |

**Reglas de Lumi:** frases cortas, sin culpa y **nunca** «compra X» o «vende Y». Al menos 3 frases por evento y por idioma, elegidas al azar sin repetir la anterior.

## 4. Límites éticos (no se negocian)

1. **Nada de dinero dentro del juego:** las gemas, las vidas y los protectores no se compran.
2. **Sin azar con recompensa:** nada de cajas sorpresa, ruletas ni cofres.
3. **Sin urgencias falsas:** las cuentas atrás son reales (cierre de liga, regeneración de vidas).
4. **Notificaciones:** como máximo 2 recordatorios al día y nada entre las 22:00 y las 8:00 de la hora local.
5. **No premiar el riesgo:** el XP por operar tiene tope diario y la liga penaliza concentrar la cartera.
6. **Menores:** pueden usarlo gratis; para pagar necesitan el consentimiento de un adulto.
7. **Sin culpa:** perder la racha se trata con calma ("hoy empieza otra").
