# 01 · Producto

> Estado: **propuesta para aprobar** · Etapa 1 · Fuente del diseño: `design/` (identidad 3a)

## 1. Visión en una frase

**El gimnasio para aprender a invertir:** clases de cinco minutos y práctica con el mercado real, con dinero virtual, hasta que estés preparado para invertir de verdad.

## 2. El problema

- En España mucha gente no domina conceptos básicos como la inflación, el interés compuesto o la diversificación (encuesta de competencias financieras del Banco de España y la CNMV).
- Quien quiere aprender tiene dos malas opciones: vídeos sueltos sin práctica, o practicar **con su dinero** en un broker, que es caro y peligroso.
- La bolsa da miedo o desconfianza: estafas, "finfluencers" y apps de trading que parecen casinos.

## 3. Para quién

| Perfil | Situación | Miedo | Qué busca |
|---|---|---|---|
| **Laura, 27, enfermera** | 6.000 € en la cuenta corriente | "Perderlo todo" | Entender antes de dar el paso |
| **Dani, 22, estudiante** | Ve contenido de cripto en redes | Que le engañen | Saber qué es real y qué es humo |
| **Marta, 41, autónoma** | Sin plan de jubilación | No fiarse de los bancos | Un método claro para el largo plazo |
| **Menores de 14 a 17 años** | En el instituto | — | Aprender gratis. Para pagar necesitan el consentimiento de un adulto |

Por debajo de 14 años no se puede usar la app (consentimiento de datos en España, LOPDGDD art. 7).

## 4. Propuesta de valor

1. **Aprender:** clases cortas, claras y en tu idioma (castellano, catalán e inglés), con quiz al final.
2. **Practicar:** un mercado con precios reales y 10.000 € virtuales. Lo que aprendes lo aplicas en minutos.
3. **Progresar:** racha, XP, logros y liga semanal, para crear el hábito sin presión. Lumi te acompaña y te frena cuando arriesgas demasiado.

**Lo que nos diferencia:** nadie en español une la seriedad y el diseño de un neobroker con la pedagogía y el hábito de Duolingo, sin arriesgar dinero.

## 5. El *core loop*

**Cada día, unos 5–10 minutos:**
1. Abres la app (por costumbre o por el aviso de racha).
2. Lumi te saluda con tu racha y tus **objetivos de hoy**.
3. Haces **una lección** (unos 5 minutos) y su **quiz**. Si fallas pierdes vidas; si aciertas ganas XP.
4. Aplicas lo aprendido en el **Mercado**: una operación pequeña o una mirada a tu cartera.
5. Cierras con la racha ampliada y avanzas en la liga.

**Cada semana:**
- El lunes cierra la liga: subes, bajas o te mantienes.
- Revisas tu cartera y tus hábitos de trading. Con Premium, Lumi te hace un análisis semanal.

**Cada mes:** desbloqueas una unidad nueva y su función en el mercado. Por ejemplo, el stop loss llega tras la lección «Gestión del riesgo».

## 6. Qué NO es E-Trading

- **No es un broker.** Nunca hay dinero real ni conexión con brokers.
- **No da recomendaciones de inversión.** Explica conceptos; nunca dice "compra X" ni "vende Y".
- **No es un casino.** No hay apuestas, cajas sorpresa de pago ni urgencias falsas, y la liga no premia arriesgarlo todo.
- **No es una red social de trading.** No se copian operaciones de otros.
- **No es una app de cripto-hype.** La cripto se enseña con sus riesgos, igual que el resto.

## 7. Alcance del MVP (lo que probarán los primeros 20–50 usuarios)

| Entra | Fuera del MVP (más adelante) |
|---|---|
| Registro con email y Google; onboarding de 7 pasos con tratamiento (femenino, masculino o neutro) | Inicio de sesión con Apple |
| Unidades 1 a 3 completas, con quiz y test de nivel | Unidades 4 a 6 y otros cursos |
| Mercado real (lo que permitan las fuentes gratuitas), órdenes, cartera, riesgo y alertas | Dividendos y posiciones cortas |
| XP, niveles, vidas, gemas, racha, objetivos, logros y liga | Ligas Premium |
| Lumi con mensajes por evento | Análisis semanal de Lumi con IA |
| Premium en **modo prueba** de Stripe | Cobros reales |
| Avisos dentro de la app y por email | Notificaciones push |
| Panel de admin mínimo: métricas, usuarios y ajustes | Editor de contenido completo (el contenido vive en archivos del repo) |
| Castellano, catalán, inglés · claro y oscuro · app instalable | — |

## 8. Cómo sabremos que funciona

- **Métrica norte:** días activos aprendiendo por usuario y semana. Objetivo en la prueba: **3 o más**.
- **Activación:** % de usuarios que en la primera sesión terminan el onboarding, la primera lección y la primera operación.
- **Retención:** % de usuarios que vuelven al día 1, al día 7 y al día 30.
- **Aprendizaje:** % de aciertos en los quizzes y mejora entre el test de nivel y el final de cada unidad.
- **Salud de la práctica:** % de operaciones marcadas como arriesgadas, que debería bajar con el tiempo.

## 9. Principios de experiencia

1. **Claridad antes que decoración.** Una acción principal por pantalla.
2. **Honestidad.** Un precio con retraso se avisa y nunca se inventa una cifra.
3. **Calma.** Celebramos sin estridencias y nunca culpabilizamos.
4. **Accesible.** Contraste AA, zonas táctiles de 44 px como mínimo, frases cortas (pensando en TDAH y dislexia) y respeto a "reducir movimiento".
5. **El contenido manda.** La gamificación sirve para aprender, no al revés.
