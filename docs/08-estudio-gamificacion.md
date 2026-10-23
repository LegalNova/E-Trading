# 08 · Estudio de gamificación (Duolingo y otros) y qué aplicamos

> Etapa 4 · 24-10-2026. Fuentes al final. Las cifras son de análisis públicos de terceros; Duolingo publica pocos datos propios.

## 1. Qué funciona según los datos públicos

| Mecánica | Qué dicen las fuentes | Qué aplicamos en E-Trading |
|---|---|---|
| **Racha simple** | Duolingo complicó la racha atándola a la XP y confundía; la simplificó a «una lección al día» y funcionó mejor. Usuarios con racha de 10+ días abandonan menos (correlación, con sesgo de selección). | Día activo = una lección, un quiz **o** una operación. Nada de umbrales de XP. |
| **Salvar la racha** | La primera gran victoria del equipo de retención fue la notificación que avisa de que la racha está en peligro; después, protectores, calendario y animaciones. | Aviso diario a las 18–19 h (hora de Madrid) si hay racha y aún no hiciste nada hoy; protector de racha (200 gemas, máx. 2; Premium regala 1 cada lunes); calendario de 5 semanas. |
| **Compromiso explícito** | Cambiar «Continuar» por «Comprometerme con mi objetivo» y elegir una meta diaria mejoró la retención semanas después. | El onboarding pide la meta diaria (5/10/15/20 min) y **los objetivos del día se adaptan a ella**. |
| **Primera semana** | Es el periodo más frágil de la retención. | Onboarding de 7 pasos, test de nivel (no empiezas por lo que ya sabes), primera lección de 4 min y logros rápidos (primera lección, primera operación, racha de 3 días). |
| **Ligas semanales** | Competición con grupos pequeños y reinicio semanal: motivación sin que los líderes se escapen para siempre. | Grupos de hasta 30 de tu división, cierre cada lunes: suben los 7 primeros (+30 gemas), bajan los puestos 26–30. |
| **Rachas en otras apps** | Busuu: +15 % de sesiones el mes siguiente a añadir rachas (Sensor Tower; generalización incierta). | — |

## 2. Diferencias deliberadas con Duolingo (por ser finanzas y por tener menores)

- **Sin azar ni cofres** y **las gemas no se compran** (docs/02 §1): evitamos mecánicas de apuesta.
- **No se premia arriesgar**: el XP por operar tiene tope (3 al día) y la liga usa rentabilidad **ajustada por riesgo** con tope de ±2 % y penalización por concentración (si un activo supera el 40 % de lo invertido, las ganancias cuentan la mitad). Estudiar siempre pesa más que especular.
- **Repetir no da XP infinita**: el mismo quiz da XP como mucho 2 veces al día.
- **Nadie es falso**: la liga solo tiene personas reales (D-019) y se puede aparecer como «Jugador anónimo».

## 3. Lo que queda para más adelante

- Retos «flash» de doble XP y ligas Premium (ver docs/05).
- Recordatorios por email y notificaciones push (cuando haya dominio propio y PWA instalable).
- Medir con datos propios (D1/D7/D30, % con racha activa, % en liga) desde el panel de admin y ajustar con experimentos A/B.

## Fuentes

- [Lenny’s Newsletter — Behind the product: Duolingo streaks](https://lennysnewsletter.com/p/behind-the-product-duolingo-streaks)
- [Breaking down Duolingo’s growth model](https://marishalakhiani.substack.com/p/breaking-down-duolingos-growth-model)
- [Sensor Tower — Duolingo streak feature and engagement](https://sensortower.Com/blog/duolingo-streak-feature-app-engagement-growth)
- [Lazyweb — Duolingo retention experiments](https://experiments.lazyweb.com/research/duolingo-retention-experiments)
