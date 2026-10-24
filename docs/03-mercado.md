# 03 · Mercado

> Estado: **aprobado**. Tabla de fuentes confirmada con la prueba del 23-10-2026 (§2 bis).

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

### 2 bis. Resultado de la prueba de fuentes (23-10-2026)

| Activos | Fuente elegida | Precio | Velas (gráficos) | Respaldo |
|---|---|---|---|---|
| AAPL, MSFT, NVDA, TSLA, AMZN, GOOGL, META, SPY, QQQ | **Finnhub** (plan gratis) | Tiempo real | Yahoo | Último precio guardado |
| SAN, ITX, BBVA (BME) · VWCE (Xetra) | **Yahoo Finance** (no oficial) | 15 min de retraso | Yahoo | Último precio guardado |
| S&P 500 · IBEX 35 | **Yahoo Finance** | S&P en tiempo real · IBEX 15 min | Yahoo | Último precio guardado |
| BTC, ETH, SOL (en euros) | **Binance** (API pública) | Tiempo real 24/7 | Binance | Segundo servidor de Binance |
| EUR/USD, GBP/USD | **Yahoo Finance** | Tiempo real | Yahoo | Tipo oficial del BCE (diario) |

Descartado: Finnhub para Europa, índices, divisas y velas (de pago); Stooq (ya no responde).
**Riesgo conocido:** Yahoo no tiene API oficial; puede cambiar o bloquear sin aviso. Si pasa, esos activos muestran el último precio real con el aviso «con retraso» y no se inventa nada. Cuando haya ingresos, se sustituye por un proveedor de pago (D-031).

**Regla:** si en la prueba de fuentes un activo no tiene fuente real gratuita, **sale del catálogo** o se muestra con su retraso real avisado. Cuando haya ingresos, un proveedor de pago (Twelve Data u otro) cubrirá España e índices en tiempo real.

**Arquitectura de datos:** cada precio se pide **una vez** al proveedor y se reparte a todos: se guarda en la tabla `Quote` (se refresca si tiene más de 20 s con el mercado abierto) y la CDN de Vercel sirve la respuesta unos segundos (D-032). Así una instancia nueva del servidor nunca muestra un precio inventado. Nunca hay una llamada al proveedor por usuario.

## 2 ter. Mercado global (octubre 2026)

- **Universo:** 3.963 activos en `src/server/market/universe.json`: 3.609 acciones, 174 ETFs, 58 criptos, 49 índices, 46 divisas y 27 materias primas (oro, plata, platino, paladio, cobre, aluminio, energía, agrícolas y ganado). Se genera con `python3 -I scripts/build-universe.py` (lee las tablas de componentes de Wikipedia, añade listas curadas, verifica que cada símbolo tenga precio en Yahoo y completa sector y nombre con el buscador de Yahoo). Después: `npx tsx prisma/seed.ts` (y `DB_SCHEMA=v2` para producción).
- **Regiones:** América (S&P 500, S&P 400, S&P 600, populares fuera de índice y ADRs, S&P/TSX 60, Ibovespa, S&P/BMV IPC), Europa (Euro Stoxx 50, FTSE 100, FTSE 250, DAX, CAC 40, IBEX 35 y mercado continuo, FTSE MIB, AEX, SMI y SPI, OMX 30, OMX C25, OBX, OMX H25, BEL 20, PSI), Asia-Pacífico (Nikkei 225, Hang Seng, HSCEI, CSI 300, Nifty 50, KOSPI 200, Straits Times, ASX 50) y Global (cripto, divisas y materias primas).
- **Cripto:** en euros cuando Yahoo tiene el par; si no, en dólares (se convierte con el tipo real). Algunas llevan un número en Yahoo (UNI7083) que se oculta en el ticker.
- **Precisión:** precios guardados con 12 decimales; en pantalla, tres cifras significativas aunque valgan 0,000004 (memecoins).
- **Datos:** Yahoo `v7/finance/spark` en lotes de 20 y `v8/finance/chart` para las velas (1m a 1M). Al abrir una página se sirven los datos guardados y se refrescan en segundo plano si tienen más de 15 s (mercado abierto). El cron horario refresca primero lo que tiene órdenes, alertas o posiciones y después lo más viejo; guarda cada lote con un solo `INSERT … ON CONFLICT` (todo el catálogo en ~9 s).
- **Retrasos:** EE. UU., cripto y divisas casi al momento; Europa 15 min; Tokio, Seúl, Sídney y México 20 min; China 30 min; resto 15 min; materias primas (futuros) 10 min.
- **Pantallas:** portada por regiones (índices, tu lista, lo que más sube y baja, explorar por tipo e índice), explorador con filtros (tipo, región, índice, país, sector; categoría en ETFs y materias primas; orden) y búsqueda por relevancia (ticker exacto primero), y ficha con gráfico profesional (velas, línea, barras, área y Heikin Ashi; indicadores y dibujo; la última vela se mueve con el precio en directo y el zoom se conserva).
- **Órdenes:** a mercado y límite; al comprar se pueden añadir **stop loss y take profit**: se crean al ejecutarse la compra y, si salta uno, el otro se cancela (OCO). Venta por porcentaje o por importe.

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
