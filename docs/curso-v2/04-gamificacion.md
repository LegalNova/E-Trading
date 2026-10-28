# 04 · Gamificación y planes (Fase 4)

> Decisión de Joan (28-10-2026): se mantienen el XP (también por operar), las vidas y el protector de racha de pago. La base actual ya era sólida; el trabajo es hacer las clases más dinámicas y meter la simulación dentro de las clases.

## Lo que se mantiene (ya implementado)

| Mecánica | Cómo funciona | Dónde está |
|---|---|---|
| **XP** | 10 por acierto + XP de la clase la primera vez (30, repasos 50, retos 100) + 50 % extra si es perfecto + 10 % si respondes rápido. Repetir el mismo quiz da XP como mucho 2 veces al día. Operar en el Mercado: 15 XP las 3 primeras operaciones del día. | `src/server/game/learning.ts`, `trading.ts` |
| **Vidas** | 5 en el plan Free; cada fallo en una clase quita una; se recupera 1 cada 4 h o con gemas. Ilimitadas en Plus y Max. Los repasos no quitan vidas. | `core.ts` |
| **Racha y protector** | 1 clase al día mantiene la racha; protector de racha para Max (uno a la semana, máx. 2). | `core.ts`, `cron/daily` |
| **Ligas semanales** | Por XP; suben los primeros y bajan los últimos. | `league.ts` |
| **Objetivos diarios** | Clase, operaciones, quiz perfecto, según los minutos elegidos (5-30). | `core.ts` |
| **Lumi** | Frases según el contexto (racha, fallo, perfecto, vuelta tras días sin entrar, subida de nivel) y entrenadora en cada orden. | `catalog.ts` (`LUMI`), `tutor/coach.ts` |
| **Planes** | Free: unidades 1-3 completas + 3 primeras clases de cada unidad. Plus: además unidades 4-5 completas + 5 primeras de cada unidad. Max: todo. La clase del stop loss (u6l4) es siempre gratis. | `src/shared/plans.ts` |

## Lo nuevo del curso v2

| Mecánica | Detalle |
|---|---|
| **Secciones con reto final** | 13 secciones; el reto mezcla 12 preguntas de toda la sección y se aprueba con un **80 %** (las clases, con un 60 %). Aprobarlo abre las secciones que dependen de ella; varias pueden estar abiertas a la vez. El reto está abierto en todos los planes. |
| **Repaso de unidad intercalado** | Mezcla preguntas de todas las clases de la unidad, primero las dinámicas. |
| **Repaso de fallos** | Cada fallo va a «Repasar fallos»; al acertarlo en el repaso desaparece. |
| **Retos cronometrados** | 1-2 preguntas por clase con cuenta atrás (si se acaba, cuenta como fallo). |
| **9 insignias nuevas (43 en total)** | Reto superado, Cinco secciones, Humildad ante el mercado (10 «¿Sube o baja?»), Calculadora humana (20 cálculos), Detector de estafas (5), Riesgo bajo control (5 simulaciones bien dimensionadas), Cazavelas (10 velas), Historiador y Laboratorio. Medallas con forma por tipo y color por rareza (`src/client/ui/badge.tsx`). |
| **Simulación dentro de las clases** | «¿Sube o baja?», «coloca el stop/objetivo» y «simula la operación» con gráficos reales: se juegan como un ejercicio más del quiz y revelan lo que pasó de verdad. |
