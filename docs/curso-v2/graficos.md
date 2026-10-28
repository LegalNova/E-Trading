# Gráficos reales disponibles para los ejercicios

Generados con `python3 -I scripts/build-lesson-charts.py` desde Yahoo Finance (datos reales; nunca inventar precios).

## «¿Sube o baja?» — `upDown(prompt, id, explicación)`

30 velas diarias visibles; se revelan las 10 siguientes. El nombre y la fecha se ocultan hasta responder. La explicación debe ser **neutral** (no puede dar pistas): el resultado real lo añade el motor.

| id | activo | periodo | resultado |
|---|---|---|---|
| ud-1 | Apple | 29/07/2026 – 23/09/2026 | sube 6.9 % |
| ud-2 | Apple | 17/03/2026 – 12/05/2026 | sube 8.9 % |
| ud-3 | Apple | 13/03/2025 – 08/05/2025 | baja -5.2 % |
| ud-4 | Apple | 07/02/2025 – 04/04/2025 | baja -13.7 % |
| ud-5 | Microsoft | 20/04/2026 – 15/06/2026 | baja -13.2 % |
| ud-6 | Microsoft | 17/03/2026 – 12/05/2026 | baja -5.0 % |
| ud-7 | Microsoft | 13/03/2025 – 08/05/2025 | sube 13.1 % |
| ud-8 | Microsoft | 29/11/2024 – 29/01/2025 | sube 6.4 % |
| ud-9 | NVIDIA | 20/04/2026 – 15/06/2026 | baja -5.3 % |
| ud-10 | NVIDIA | 08/01/2026 – 06/03/2026 | baja -6.3 % |
| ud-11 | NVIDIA | 31/10/2025 – 29/12/2025 | sube 7.5 % |
| ud-12 | NVIDIA | 25/07/2025 – 19/09/2025 | sube 5.8 % |
| ud-13 | Amazon | 20/04/2026 – 15/06/2026 | baja -5.8 % |
| ud-14 | Amazon | 11/02/2026 – 09/04/2026 | sube 10.4 % |
| ud-15 | Amazon | 30/09/2025 – 24/11/2025 | baja -8.9 % |
| ud-16 | Amazon | 23/06/2025 – 18/08/2025 | sube 9.4 % |
| ud-17 | Coca-Cola | 04/12/2025 – 02/02/2026 | sube 6.9 % |
| ud-18 | Coca-Cola | 27/08/2025 – 22/10/2025 | sube 7.1 % |
| ud-19 | Banco Santander | 02/09/2026 – 27/10/2026 | baja -7.5 % |
| ud-20 | Banco Santander | 24/04/2026 – 19/06/2026 | sube 10.6 % |
| ud-21 | Banco Santander | 17/02/2026 – 15/04/2026 | sube 12.2 % |
| ud-22 | Banco Santander | 15/01/2026 – 11/03/2026 | baja -11.7 % |
| ud-23 | Inditex | 02/09/2026 – 27/10/2026 | sube 5.3 % |
| ud-24 | Inditex | 17/02/2026 – 15/04/2026 | sube 6.8 % |
| ud-25 | Inditex | 15/01/2026 – 11/03/2026 | baja -7.2 % |
| ud-26 | Inditex | 28/04/2025 – 23/06/2025 | baja -8.9 % |
| ud-27 | Iberdrola | 15/01/2026 – 11/03/2026 | baja -5.6 % |
| ud-28 | Iberdrola | 10/12/2025 – 06/02/2026 | sube 5.5 % |
| ud-29 | Iberdrola | 04/09/2025 – 29/10/2025 | sube 5.2 % |
| ud-30 | BBVA | 24/04/2026 – 19/06/2026 | sube 9.9 % |
| ud-31 | BBVA | 17/02/2026 – 15/04/2026 | sube 9.8 % |
| ud-32 | BBVA | 15/01/2026 – 11/03/2026 | baja -6.5 % |
| ud-33 | BBVA | 19/02/2025 – 15/04/2025 | baja -6.6 % |
| ud-34 | S&P 500 | 07/02/2025 – 04/04/2025 | baja -10.5 % |
| ud-35 | S&P 500 | 03/01/2025 – 04/03/2025 | baja -5.7 % |
| ud-36 | IBEX 35 | 24/04/2026 – 19/06/2026 | sube 5.5 % |
| ud-37 | IBEX 35 | 17/02/2026 – 15/04/2026 | sube 7.2 % |
| ud-38 | IBEX 35 | 15/01/2026 – 11/03/2026 | baja -6.0 % |
| ud-39 | DAX | 17/02/2026 – 15/04/2026 | sube 6.7 % |
| ud-40 | DAX | 15/01/2026 – 11/03/2026 | baja -6.1 % |
| ud-41 | DAX | 24/04/2025 – 19/06/2025 | baja -5.2 % |
| ud-42 | Bitcoin | 03/05/2026 – 11/06/2026 | baja -10.4 % |
| ud-43 | Bitcoin | 31/01/2026 – 11/03/2026 | sube 8.8 % |
| ud-44 | Bitcoin | 16/12/2025 – 24/01/2026 | baja -9.5 % |
| ud-45 | Bitcoin | 07/04/2025 – 16/05/2025 | sube 8.6 % |
| ud-46 | EUR/USD | 30/07/2026 – 23/09/2026 | baja -2.2 % |
| ud-47 | EUR/USD | 26/04/2026 – 18/06/2026 | baja -1.3 % |
| ud-48 | EUR/USD | 20/02/2026 – 15/04/2026 | sube 1.9 % |
| ud-49 | EUR/USD | 30/03/2025 – 26/05/2025 | sube 2.6 % |
| ud-50 | Oro | 26/06/2026 – 21/08/2026 | sube 6.4 % |
| ud-51 | Oro | 12/02/2026 – 10/04/2026 | sube 9.4 % |
| ud-52 | Tesla | 25/06/2026 – 20/08/2026 | sube 8.0 % |
| ud-53 | Tesla | 21/05/2026 – 20/07/2026 | baja -12.0 % |
| ud-54 | Tesla | 17/03/2026 – 12/05/2026 | sube 15.3 % |
| ud-55 | Tesla | 11/02/2026 – 09/04/2026 | baja -10.4 % |
| ud-56 | Alphabet | 31/08/2026 – 26/10/2026 | baja -10.2 % |
| ud-57 | Alphabet | 17/03/2026 – 12/05/2026 | sube 10.7 % |
| ud-58 | Alphabet | 11/02/2026 – 09/04/2026 | sube 9.5 % |
| ud-59 | Alphabet | 08/01/2026 – 06/03/2026 | baja -5.2 % |
| ud-60 | Meta | 31/08/2026 – 26/10/2026 | baja -15.1 % |
| ud-61 | Meta | 29/07/2026 – 23/09/2026 | sube 13.8 % |
| ud-62 | Meta | 25/06/2026 – 20/08/2026 | baja -7.5 % |
| ud-63 | Meta | 21/05/2026 – 20/07/2026 | sube 7.6 % |
| ud-64 | JPMorgan | 20/04/2026 – 15/06/2026 | sube 7.7 % |
| ud-65 | JPMorgan | 11/02/2026 – 09/04/2026 | sube 5.0 % |
| ud-66 | JPMorgan | 08/01/2026 – 06/03/2026 | baja -6.9 % |
| ud-67 | JPMorgan | 30/09/2025 – 24/11/2025 | baja -6.0 % |
| ud-68 | ExxonMobil | 31/08/2026 – 26/10/2026 | sube 7.2 % |
| ud-69 | ExxonMobil | 25/06/2026 – 20/08/2026 | sube 7.3 % |
| ud-70 | ExxonMobil | 20/04/2026 – 15/06/2026 | baja -5.7 % |
| ud-71 | ExxonMobil | 11/02/2026 – 09/04/2026 | baja -5.0 % |
| ud-72 | Ethereum | 11/07/2026 – 19/08/2026 | sube 16.8 % |
| ud-73 | Ethereum | 26/05/2026 – 04/07/2026 | sube 9.0 % |
| ud-74 | Ethereum | 03/05/2026 – 11/06/2026 | baja -16.1 % |
| ud-75 | Ethereum | 16/12/2025 – 24/01/2026 | baja -13.5 % |
| ud-76 | Repsol | 31/07/2026 – 24/09/2026 | sube 9.1 % |
| ud-77 | Repsol | 30/06/2026 – 24/08/2026 | sube 5.2 % |
| ud-78 | Repsol | 24/04/2026 – 19/06/2026 | baja -6.6 % |
| ud-79 | Repsol | 17/02/2026 – 15/04/2026 | baja -15.3 % |
| ud-80 | Telefónica | 31/07/2026 – 24/09/2026 | baja -7.1 % |
| ud-81 | Telefónica | 20/03/2026 – 19/05/2026 | sube 6.3 % |
| ud-82 | Telefónica | 10/12/2025 – 06/02/2026 | sube 7.4 % |
| ud-83 | Telefónica | 19/02/2025 – 15/04/2025 | baja -5.7 % |
| ud-84 | Nasdaq 100 | 17/03/2026 – 12/05/2026 | sube 7.5 % |
| ud-85 | Nasdaq 100 | 07/02/2025 – 04/04/2025 | baja -11.9 % |
| ud-86 | Nasdaq 100 | 03/01/2025 – 04/03/2025 | baja -8.2 % |
| ud-87 | Nasdaq 100 | 08/03/2024 – 03/05/2024 | sube 5.0 % |
| ud-88 | Petróleo WTI | 01/09/2026 – 27/10/2026 | sube 6.1 % |
| ud-89 | Petróleo WTI | 30/07/2026 – 24/09/2026 | baja -7.7 % |
| ud-90 | Petróleo WTI | 26/06/2026 – 21/08/2026 | sube 11.4 % |
| ud-91 | Petróleo WTI | 21/04/2026 – 16/06/2026 | baja -18.9 % |
| ud-92 | Plata | 01/09/2026 – 27/10/2026 | baja -8.2 % |
| ud-93 | Plata | 26/06/2026 – 21/08/2026 | sube 9.7 % |
| ud-94 | Plata | 21/04/2026 – 16/06/2026 | baja -7.2 % |
| ud-95 | Plata | 18/03/2026 – 13/05/2026 | sube 24.2 % |
| ud-96 | USD/JPY | 30/07/2026 – 23/09/2026 | sube 3.1 % |
| ud-97 | USD/JPY | 20/01/2026 – 16/03/2026 | sube 1.9 % |
| ud-98 | USD/JPY | 12/10/2025 – 05/12/2025 | baja -1.4 % |
| ud-99 | USD/JPY | 30/03/2025 – 26/05/2025 | baja -3.8 % |

## Niveles — `level(prompt, id, 'STOP'|'TAKE', explicación)` y `simTrade(prompt, id, explicación, { cash?, maxRiskPct? })`

Tendencia con un mínimo reciente claro (stop correcto: justo por debajo) y un máximo anterior (objetivo correcto: cerca de él). Se revelan 15 velas.

| id | activo | periodo | entrada | mínimo reciente | máximo anterior |
|---|---|---|---|---|---|
| lvl-1 | Microsoft | 29/08/2024 – 31/10/2024 | 415.84 | 408.17 | 441.85 |
| lvl-2 | NVIDIA | 31/05/2024 – 05/08/2024 | 128.44 | 118.83 | 140.76 |
| lvl-3 | Amazon | 29/08/2024 – 31/10/2024 | 186.65 | 180.25 | 195.37 |
| lvl-4 | BBVA | 25/04/2025 – 27/06/2025 | 13.24 | 12.9 | 13.9 |
| lvl-5 | IBEX 35 | 20/03/2024 – 24/05/2024 | 10854.7 | 10530.0 | 11140.1 |
| lvl-6 | Bitcoin | 13/07/2026 – 26/08/2026 | 55054.41 | 53944.45 | 58617.23 |
| lvl-7 | Bitcoin | 11/03/2026 – 24/04/2026 | 61383.81 | 56545.53 | 66131.19 |
| lvl-8 | Oro | 12/01/2026 – 17/03/2026 | 5176.3 | 4670.0 | 5586.2 |
| lvl-9 | Oro | 16/07/2025 – 17/09/2025 | 3433.0 | 3353.4 | 3534.1 |
| lvl-10 | Tesla | 17/04/2024 – 20/06/2024 | 176.19 | 169.0 | 198.87 |
| lvl-11 | Alphabet | 27/08/2025 – 29/10/2025 | 244.62 | 238.61 | 256.0 |
| lvl-12 | Alphabet | 26/11/2024 – 03/02/2025 | 192.04 | 187.5 | 201.42 |
| lvl-13 | Meta | 15/07/2025 – 16/09/2025 | 753.3 | 731.0 | 784.75 |
| lvl-14 | ExxonMobil | 14/04/2025 – 17/06/2025 | 103.52 | 101.89 | 109.3 |
| lvl-15 | Ethereum | 13/07/2026 – 26/08/2026 | 1629.82 | 1578.89 | 1732.13 |
| lvl-16 | Ethereum | 11/03/2026 – 24/04/2026 | 1872.4 | 1687.99 | 2072.58 |
| lvl-17 | Repsol | 17/10/2025 – 18/12/2025 | 15.75 | 15.35 | 16.86 |
| lvl-18 | Repsol | 13/09/2024 – 14/11/2024 | 11.86 | 11.58 | 12.48 |
| lvl-19 | Petróleo WTI | 13/07/2026 – 14/09/2026 | 87.06 | 74.57 | 93.5 |
| lvl-20 | Petróleo WTI | 26/02/2026 – 30/04/2026 | 97.87 | 86.34 | 119.48 |
| lvl-21 | Plata | 05/06/2024 – 08/08/2024 | 30.0 | 29.23 | 31.52 |
| lvl-22 | USD/JPY | 05/03/2026 – 05/05/2026 | 158.79 | 157.89 | 160.23 |
| lvl-23 | USD/JPY | 19/12/2024 – 20/02/2025 | 155.17 | 153.73 | 158.86 |

## Momentos históricos — `upDown(prompt, id, explicación, horizonte)`

Línea de cierres hasta el «corte» y se revela lo que pasó después. Aquí sí se puede nombrar el activo y la fecha en el enunciado.

| id | activo | corte | variación después | caída máxima después |
|---|---|---|---|---|
| hist-crash-1929 | S&P 500 · cierres semanales · enero de 1928 – diciembre de 1932 | 29/09/1929 | -75.3 % | -84.6 % |
| hist-dotcom | Nasdaq 100 · cierres semanales · diciembre de 1997 – diciembre de 2002 | 06/03/2000 | -77.5 % | -82.7 % |
| hist-2008 | S&P 500 · cierres semanales · enero de 2006 – diciembre de 2009 | 08/09/2008 | -10.9 % | -46.7 % |
| hist-2009-bottom | S&P 500 · cierres semanales · mayo de 2007 – diciembre de 2010 | 02/03/2009 | 84.0 % | -1.5 % |
| hist-japan-1989 | Nikkei 225 · cierres mensuales · diciembre de 1984 – noviembre de 1995 | 30/11/1989 | -48.9 % | -63.5 % |
| hist-ibex-2012 | IBEX 35 · cierres semanales · enero de 2010 – enero de 2014 | 22/07/2012 | 55.5 % | -4.9 % |
| hist-covid | S&P 500 · cierres diarios · octubre de 2019 – septiembre de 2020 | 25/03/2020 | 38.4 % | -1.1 % |
| hist-btc-2021 | Bitcoin · cierres semanales · mayo de 2020 – diciembre de 2022 | 08/11/2021 | -74.6 % | -76.2 % |
| hist-gold-2020 | Oro · cierres semanales · mayo de 2018 – diciembre de 2021 | 03/08/2020 | -9.8 % | -17.5 % |
| hist-oil-2020 | Petróleo WTI · cierres semanales · mayo de 2019 – junio de 2021 | 20/04/2020 | 343.7 % | -40.6 % |
| hist-rates-2022 | Bonos del Tesoro a 20+ años (ETF) · cierres semanales · junio de 2020 – octubre de 2023 | 03/01/2022 | -40.7 % | -42.1 % |
| hist-tsla-2020 | Tesla · cierres semanales · diciembre de 2018 – enero de 2023 | 21/12/2020 | -48.7 % | -53.8 % |

## Patrones de velas — `candle(prompt, id, explicación)` (toca la vela) y `chart(...)` en la teoría

| id | activo | periodo |
|---|---|---|
| hammer-1 | Microsoft | 22/05/2024 – 04/06/2024 |
| hammer-2 | NVIDIA | 01/06/2026 – 11/06/2026 |
| hammer-3 | Amazon | 14/02/2025 – 27/02/2025 |
| shooting-star-1 | Microsoft | 09/04/2026 – 21/04/2026 |
| shooting-star-2 | Amazon | 27/10/2025 – 06/11/2025 |
| shooting-star-3 | Coca-Cola | 12/08/2026 – 24/08/2026 |
| doji-1 | Apple | 31/08/2026 – 11/09/2026 |
| doji-2 | NVIDIA | 17/09/2026 – 29/09/2026 |
| doji-3 | Amazon | 15/04/2026 – 27/04/2026 |
| bull-engulfing-1 | Apple | 01/04/2025 – 11/04/2025 |
| bull-engulfing-2 | Microsoft | 01/04/2025 – 11/04/2025 |
| bull-engulfing-3 | NVIDIA | 14/07/2026 – 24/07/2026 |
| bear-engulfing-1 | Apple | 27/08/2026 – 09/09/2026 |
| bear-engulfing-2 | NVIDIA | 27/12/2024 – 10/01/2025 |
| bear-engulfing-3 | Amazon | 28/07/2026 – 07/08/2026 |
| marubozu-1 | Apple | 24/06/2026 – 07/07/2026 |
| marubozu-2 | Microsoft | 20/05/2026 – 02/06/2026 |
| marubozu-3 | NVIDIA | 23/03/2026 – 02/04/2026 |
| morning-star-1 | Microsoft | 30/01/2026 – 11/02/2026 |
| morning-star-2 | NVIDIA | 11/12/2025 – 23/12/2025 |
| morning-star-3 | Amazon | 29/07/2025 – 08/08/2025 |

## Tendencias — `trend(prompt, id, 'Alcista'|'Bajista'|'Lateral', explicación)` y `point(prompt, id, 'max'|'min', explicación)`

| id | activo | periodo |
|---|---|---|
| trend-up-1 | Apple | 27/03/2026 – 22/05/2026 |
| trend-up-2 | Microsoft | 29/06/2026 – 24/08/2026 |
| trend-up-3 | NVIDIA | 27/03/2026 – 22/05/2026 |
| trend-down-1 | Apple | 25/02/2025 – 22/04/2025 |
| trend-down-2 | Microsoft | 24/12/2025 – 23/02/2026 |
| trend-down-3 | NVIDIA | 25/02/2025 – 22/04/2025 |
| trend-flat-1 | Apple | 23/09/2024 – 15/11/2024 |
| trend-flat-2 | Microsoft | 22/08/2024 – 17/10/2024 |
| trend-flat-3 | NVIDIA | 24/12/2025 – 23/02/2026 |
