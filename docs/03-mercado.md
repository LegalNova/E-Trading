# 03 · Mercado

> Estado: **base para aprobar** (etapa 1). La tabla definitiva de activos y fuentes sale de la **prueba de fuentes** al inicio de la etapa 3.

## 1. Qué significa "replicar el mercado real"

Con fuentes gratuitas no se puede replicar todo: no hay libro de órdenes, ni liquidez, ni la bolsa española en tiempo real. Por eso definimos la fidelidad con **criterios medibles**:

| # | Criterio | Cómo se comprueba |
|---|---|---|
| F1 | **Nunca un precio inventado.** Cada precio viene de una fuente real o se muestra como "con retraso" o "último conocido" con su hora | Test y revisión del catálogo |
| F2 | Los activos en tiempo real tienen un precio con **menos de 60 s** de antigüedad mientras su mercado está abierto | Monitor en el panel de admin |
| F3 | La ejecución usa **siempre el precio del servidor**, nunca el que envía el móvil | Test |
| F4 | **Horarios y festivos reales** por bolsa. Cripto, 24/7; divisas, 24/5 | Tabla de horarios y test |
| F5 | **Comisiones y tipo de cambio** aplicados como en un broker; la cartera cuadra **al céntimo** | Tests de P&L |
| F6 | **Splits aplicados** en menos de 24 h (el error de NVIDIA de la v1 venía de aquí) | Tarea diaria y test |
| F7 | Las órdenes límite, stop y take profit se disparan con el precio real, comprobado **al menos cada minuto** | Test con precios simulados en entorno de test |

## 2. Catálogo inicial (unos 20 activos) y fuente candidata

| Tipo | Activos | Fuente gratuita candidata | Esperado |
|---|---|---|---|
| Acciones EE. UU. | AAPL, MSFT, NVDA, TSLA, AMZN, GOOGL, META | Finnhub (60 llamadas/min) | Tiempo real |
| ETFs | SPY, QQQ, VWCE* | Finnhub (EE. UU.) · *VWCE (Xetra) a validar | Tiempo real / a validar |
| Cripto | BTC, ETH, SOL | Binance (API pública, sin clave) · CoinGecko de respaldo | Tiempo real 24/7 |
| Divisas | EUR/USD, GBP/USD | Twelve Data gratis (8/min) · BCE como respaldo diario | Tiempo real o diario |
| Índices | S&P 500, IBEX 35 | A validar | Posiblemente con retraso |
| Acciones España | SAN, ITX | A validar | Con retraso (15 min) o fuera del catálogo |

**Regla:** si en la prueba de fuentes un activo no tiene fuente real gratuita, **sale del catálogo** o se muestra con su retraso real avisado. Cuando haya ingresos, un proveedor de pago (Twelve Data u otro) cubrirá España e índices en tiempo real.

**Arquitectura de datos:** cada precio se pide **una vez** al proveedor y se reparte a todos desde una caché (Redis), con la última cotización real guardada en la base de datos. Así una instancia nueva del servidor nunca muestra un precio inventado. Nunca hay una llamada al proveedor por usuario.

## 3. Horarios (hora peninsular española)

| Mercado | Horario | Notas |
|---|---|---|
| NYSE / NASDAQ | 15:30–22:00 (lun–vie) | Festivos de EE. UU.; cambia una semana en marzo y en noviembre por el desfase de horario de verano |
| BME (Madrid) | 9:00–17:30 | Festivos de BME |
| Xetra | 9:00–17:30 | Festivos de Xetra |
| Cripto | 24/7 | — |
| Divisas | Dom 23:00 – Vie 23:00 | — |

Los festivos van en una tabla de base de datos (`MarketHoliday`) que se actualiza cada año.

## 4. Reglas del simulador

| Regla | Valor |
|---|---|
| Saldo inicial | **10.000 €** (Free) · **50.000 €** (Premium; al pasar a Premium se suma la diferencia una sola vez) |
| Comisión simulada | 0,1 % con **mínimo de 1 €** |
| Importe mínimo por orden | 1 € |
| Fracciones | Sí (hasta 8 decimales) |
| Posiciones | Solo largas (el modelo admite cortos, desactivados) |
| Moneda de referencia | EUR o USD (Ajustes). Conversión con el tipo de cambio de la fuente |
| Spread y deslizamiento | No en el MVP (simplificación conocida y documentada) |
| Dividendos | No en el MVP (limitación conocida; prevista más adelante) |
| Reinicios de cartera | Hasta 3 al año. Se conservan XP, racha y logros |

### Tipos de orden

| Tipo | Se ejecuta cuando… | Precio de ejecución | Disponible |
|---|---|---|---|
| **Mercado** | Al momento, si el mercado está abierto. Si está cerrado, queda **pendiente** hasta la apertura | Precio del servidor (a la apertura, el primero del día) | Siempre |
| **Límite** (compra) | El precio baja hasta el límite o por debajo | El límite o mejor | Tras la lección «Gestión del riesgo» o con Premium |
| **Stop loss** (venta) | El precio baja hasta el stop o por debajo | Precio de mercado en ese momento | Ídem |
| **Take profit** (venta) | El precio sube hasta el objetivo o por encima | Precio de mercado en ese momento | Ídem |

### Aviso de riesgo

Si una compra deja un activo por encima del **20 %** del valor de la cartera, Lumi avisa antes de confirmar y sugiere un importe que respeta el límite. Si se confirma igualmente, se guarda para las estadísticas de hábitos.

## 5. Gráficos

- **Ficha de activo:** velas OHLC del proveedor (1m, 5m, 1h, 1d, 1w) con caché. Si una fuente no da históricos gratis, se muestra solo la línea del día con los precios que hemos guardado. **Nunca un histórico inventado.**
- **Lecciones:** las velas de los ejercicios (por ejemplo, AAPL en marzo de 2024) se descargan **una vez** y se guardan para siempre. Son datos reales y fijos.

## 6. Aviso legal visible

«E-Trading es una app educativa. No se opera con dinero real, no se conecta a ningún broker y no ofrece recomendaciones de inversión.» Aparece en el onboarding, en el pie del Mercado y en la landing.
