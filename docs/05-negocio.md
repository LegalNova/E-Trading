# 05 · Negocio

> Estado: **base para aprobar** (etapa 1). Las cifras de costes y conversión son **estimaciones** que se validan con datos reales en las etapas 6 y 7.

## 1. Planes (definidos en el diseño, pantalla 06.1)

| | **Free** | **Premium** |
|---|---|---|
| Precio | 0 € | **7,99 €/mes** o **59,99 €/año** (−37 %) · **7 días gratis** |
| Clases | Unidades 1 y 2 completas | Todas las unidades |
| Vidas en quizzes | 5 (1 cada 4 h) | Ilimitadas |
| Saldo virtual | 10.000 € | 50.000 € |
| Órdenes | A mercado (las avanzadas, tras la lección «Gestión del riesgo») | Límite, stop loss y take profit |
| Lumi | Mensajes por evento | + análisis semanal de tu cartera |
| Liga y racha | Liga semanal | + ligas Premium y 1 protector de racha por semana |

**Reglas de pago:**
- Los precios salen de Stripe y la tabla `Settings`, nunca del código.
- Recordatorio por email **2 días antes** de cobrar al acabar la prueba.
- Se cancela desde Ajustes, en el portal de Stripe.
- Nunca guardamos datos de tarjeta.
- Los menores necesitan el consentimiento de un adulto.

## 2. Otras vías de ingresos (por orden de prioridad)

1. **Colegios y academias (B2B).**
   - La landing ya tiene «Empresas y colegios» y el formulario de contacto con el motivo «Colegio».
   - Producto futuro: licencias por grupo, panel de profesor con el progreso de la clase y ligas privadas de aula.
   - Puede ser la vía más rentable, porque una venta son decenas de usuarios.
   - Se valida con 3–5 conversaciones con centros **antes** de construir nada.
2. **Afiliación con brokers reales** (la pantalla Brokers de la v1).
   - Está regulada: la publicidad de servicios de inversión tiene normas de la CNMV.
   - Solo se activará para adultos, claramente señalizada y **tras revisión legal**. No entra en el MVP.
3. **Lo que no haremos:** publicidad de terceros dentro de la app ni venta de datos.

## 3. Costes

| Concepto | Ahora (pruebas) | Al lanzar con usuarios reales (estimación) |
|---|---|---|
| Vercel | 0 € (Hobby; **no permite uso comercial**) | Pro: ~20 $/mes |
| Base de datos (Neon) | 0 € | 0–19 $/mes según uso |
| Caché (Upstash Redis) | 0 € | 0–10 $/mes |
| Datos de mercado | 0 € (Finnhub, Binance, BCE…) | 30–100 $/mes para España e índices en tiempo real (a confirmar con el proveedor) |
| Emails (Resend) | 0 € (3.000/mes) | 0–20 $/mes |
| Dominio | — | 10–20 €/año (ver decisión del dominio) |
| IA de Lumi (Anthropic) | Céntimos en pruebas | Según usuarios Premium; acotado a 1 análisis por semana |
| Stripe | — | ~1,5 % + 0,25 € por cobro (tarjetas de la UE) |
| **Total aproximado** | **0 €/mes** | **~60–170 €/mes** |

## 4. Cuándo se cubren gastos (estimación)

**Ingreso neto por suscriptor**, tras restar el IVA del 21 % y la comisión de Stripe:
- Mensual: unos **6,2 €/mes**.
- Anual: unos **48 €/año**, es decir, unos 4 €/mes.

Para cubrir 100–170 €/mes hacen falta **unos 20–35 suscriptores**. Si se convierte entre el 3 % y el 5 % de los usuarios activos (rango habitual en apps *freemium*, a validar), eso son **unos 500–1.000 usuarios activos**.

## 5. Métricas objetivo

Son objetivos iniciales y se revisan con datos reales.

| Métrica | Objetivo en la prueba (etapa 6) |
|---|---|
| Activación (onboarding + 1.ª lección + 1.ª operación en la 1.ª sesión) | ≥ 60 % |
| Retención día 1 / día 7 / día 30 | ≥ 40 % / ≥ 20 % / ≥ 10 % |
| Días activos por usuario y semana (métrica norte) | ≥ 3 |
| Paso de prueba de Premium a pago | Se mide en la etapa 7 |

## 6. Requisitos legales (lista para revisar con un profesional antes de cobrar)

- [ ] **RGPD/LOPDGDD:**
  - Política de privacidad y contratos de encargado de tratamiento con los proveedores (Vercel, Neon, Stripe, Resend…).
  - Exportar y borrar la cuenta desde la app (ya está en el diseño, pantalla 06.4).
- [ ] **Menores:** mínimo 14 años y consentimiento parental para pagar (pantalla 02.13).
- [ ] **No es asesoramiento financiero:** aviso visible y ninguna recomendación personalizada (CNMV).
- [ ] **Consumidores:** derecho de desistimiento en contenido digital (renuncia expresa al empezar la prueba), condiciones claras de renovación y cancelación.
- [ ] **IVA de servicios digitales en la UE** (régimen OSS); Stripe Tax puede calcularlo.
- [ ] **Publicidad financiera** (si llega la afiliación): normas de la CNMV.
- [ ] **Marca:** comprobar en la OEPM y la EUIPO que «E-Trading» se puede registrar en las clases 9, 36 y 41.
