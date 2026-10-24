import 'server-only'
// Unidad 7 · Leer un gráfico (docs/curso/07). Gratis. Gráficos con datos reales.
import { chart, fill, img, key, lesson, multi, order, point, sim, single, text, tf, trend, unit } from '../dsl'

export default unit({
  id: 'u7', order: 7, title: 'Leer un gráfico', description: 'Ejes, tipos de gráfico, temporalidades, tendencia y volumen',
  lessons: [
    lesson('u7l1', 'Qué muestra un gráfico de precios', [
      text('Los ejes', '• **Horizontal:** el tiempo. Cada barra o vela es un periodo.\n• **Vertical:** el precio, en la moneda del activo (o en puntos si es un índice).\n• **Debajo:** el volumen negociado.'),
      img('anatomy', 'Los cuatro precios de cada periodo', '**Apertura** (primer precio), **máximo**, **mínimo** y **cierre** (último precio, el más importante). En inglés, OHLC.\n\nEn E-Trading, al pasar el dedo por una vela verás arriba sus cuatro precios.'),
      key('Lo que es y lo que no es', 'Un gráfico es un registro exacto de lo que ha pasado. No es una predicción: el análisis técnico trabaja con probabilidades.', 'Un gráfico es la historia de lo que compradores y vendedores han acordado en cada momento.', 'Un gráfico cuenta lo que pasó, no lo que va a pasar.'),
    ], [
      single('¿Qué dato de cada periodo se considera más importante?', ['Apertura', 'Cierre', 'Máximo'], 1, 'Es el precio en el que se pusieron de acuerdo al final.'),
      multi('¿Qué cuatro precios tiene cada vela? Marca todos.', ['Apertura', 'Máximo', 'Mínimo', 'Cierre', 'Dividendo'], [0, 1, 2, 3], 'Por eso se llaman OHLC (open, high, low, close).'),
      tf('Un gráfico predice lo que hará el precio mañana.', false, 'Registra lo que pasó; el análisis técnico habla de probabilidades.'),
      point('Toca el cierre más alto de este periodo', 'trend-up-1', 'max', 'El máximo de los cierres aparece al final: la tendencia era alcista.'),
    ], { source: '7.1' }),

    lesson('u7l2', 'Tipos de gráfico', [
      text('Cinco formas de ver el precio', '• **Línea:** solo cierres. Tendencia sin ruido.\n• **Área:** línea con relleno (como en Revolut).\n• **Barras:** máximo, mínimo, apertura (izquierda) y cierre (derecha).\n• **Velas:** la información completa, más fácil de leer.\n• **Heikin Ashi:** velas promediadas que suavizan el ruido.'),
      text('Cuidado con Heikin Ashi', 'Sus aperturas y cierres se calculan con promedios: **no son precios reales**. Sirve para ver la tendencia, nunca para decidir a qué precio entrar o salir.'),
      sim('Cambia de tipo', 'El gráfico profesional de cada ficha tiene velas, Heikin Ashi, barras, línea y área.', 'Abre un activo y cambia entre los cinco tipos de gráfico.'),
      key('Lo que te llevas', 'La vela es el estándar actual en casi todas las plataformas.', 'La línea resume; las velas cuentan la batalla de cada periodo.', 'Para ver hacia dónde va, la línea. Para ver quién gana, las velas.'),
    ], [
      single('¿Qué tipo de gráfico no muestra precios reales de apertura y cierre?', ['Velas', 'Barras', 'Heikin Ashi'], 2, 'Usa promedios para suavizar el ruido.'),
      single('¿Qué gráfico muestra solo los cierres?', ['Línea', 'Velas', 'Barras'], 0, 'Por eso es el más limpio para ver la tendencia.'),
      tf('En un gráfico de barras, la rayita de la derecha es el cierre.', true, 'La de la izquierda es la apertura.'),
      fill('El gráfico de velas más suave, calculado con promedios, se llama ____.', 'Heikin Ashi', ['Marubozu', 'Doji', 'Fibonacci'], 'Útil para ver la tendencia, no para elegir precios.'),
    ], { source: '7.2' }),

    lesson('u7l3', 'Temporalidades', [
      text('El mismo activo, historias distintas', '• 1–15 min: *scalping* y *day trading* (mucho ruido).\n• 1 hora: operaciones de pocos días.\n• Diario: semanas o meses.\n• Semanal y mensual: largo plazo.\n\nEn E-Trading: 1m, 5m, 15m, 1h, 1D, 1S y 1M.'),
      text('Ruido y señal', 'Cuanto más corta la temporalidad, más **ruido**: movimientos aleatorios sin significado. Las señales fallan más y cada operación paga costes. Por eso el *day trading* es tan difícil.'),
      text('Las tres pantallas', '1. Temporalidad mayor (semanal): decide la **dirección**.\n2. Intermedia (diaria): busca el **momento**.\n3. Menor (horas): afina la **entrada** y el stop.'),
      sim('Tres temporalidades', 'Mira el mismo activo con tres zooms distintos.', 'Abre el S&P 500 en 1M, 1D y 15m y escribe la tendencia que ves en cada uno.'),
      key('Lo que te llevas', 'Elige la temporalidad según tu horizonte, y mira siempre la mayor antes de la menor.', 'Puede haber una tendencia alcista en diario y una caída en 5 minutos: las dos son ciertas.', 'Antes de mirar la vela de cinco minutos, mira la de la semana.'),
    ], [
      tf('Cuanto más corta es la temporalidad, más ruido hay.', true, 'Por eso las señales en minutos fallan más.'),
      order('Ordena de menos a más ruido.', ['Mensual', 'Semanal', 'Diario', '1 hora', '5 minutos'], 'A más zoom, más movimientos aleatorios.'),
      single('En el método de las tres pantallas, la temporalidad mayor sirve para…', ['Afinar la entrada', 'Decidir la dirección', 'Elegir el bróker'], 1, 'Solo buscas compras si la tendencia mayor es alcista.'),
      single('Un inversor a largo plazo debería mirar sobre todo…', ['Gráficos de 1 minuto', 'Gráficos semanales y mensuales', 'Solo las noticias'], 1, 'Su horizonte son años, no minutos.'),
    ], { source: '7.3' }),

    lesson('u7l4', 'Escala lineal y logarítmica', [
      text('La diferencia', '• **Lineal:** cada centímetro vale los mismos euros. De 10 a 20 € ocupa lo mismo que de 100 a 110 €.\n• **Logarítmica:** cada centímetro vale el mismo porcentaje. De 10 a 20 € (+100 %) ocupa lo mismo que de 100 a 200 €.'),
      text('Por qué importa', 'En lineal, en 50 años de S&P 500 la caída de 1987 parece insignificante y la de 2020 enorme. En logarítmica se ve que 1987 fue de más del 30 % en pocos días.\n\nPara activos que se han multiplicado mucho, el gráfico lineal engaña.'),
      key('La regla', 'Para periodos de varios años, escala logarítmica. Para días o semanas, da igual.', 'En escala logarítmica, la misma distancia vertical es el mismo porcentaje.', 'En el largo plazo importan los porcentajes, no los euros.'),
    ], [
      single('Una acción pasó de 1 € a 300 € en 15 años. ¿Qué escala usas?', ['Lineal', 'Logarítmica'], 1, 'Es la única que muestra bien los porcentajes en periodos largos.'),
      tf('En escala lineal, subir de 10 a 20 € ocupa lo mismo que de 100 a 200 €.', false, 'Eso pasa en escala logarítmica.'),
      single('En escala logarítmica, la misma distancia vertical significa…', ['Los mismos euros', 'El mismo porcentaje', 'El mismo volumen'], 1, 'Por eso compara bien épocas con precios muy distintos.'),
      tf('Para mirar unas pocas semanas, la escala apenas cambia el gráfico.', true, 'Los porcentajes y los euros son casi proporcionales en tramos cortos.'),
    ], { source: '7.4' }),

    lesson('u7l5', 'La tendencia: máximos y mínimos', [
      img('trend', 'Cómo se identifica', '• **Alcista:** máximos y mínimos cada vez más altos.\n• **Bajista:** cada vez más bajos.\n• **Lateral:** rebota entre un techo y un suelo sin dirección.'),
      text('La teoría de Dow', 'Charles Dow (siglo XIX): el precio lo descuenta todo, se mueve en tendencias de tres grados (primaria, secundaria, menor), una tendencia sigue hasta que hay señales claras de cambio, y el volumen debe confirmarla.'),
      text('Cuándo cambia', 'Una tendencia alcista se pone en duda cuando el precio **no supera el último máximo** y después **pierde el último mínimo**.\n\nLas correcciones del 5–10 % son normales dentro de una subida sana.'),
      text('El momentum existe', 'Las tendencias de 3–12 meses han tendido a persistir en acciones, bonos, divisas y materias primas (Jegadeesh y Titman; Moskowitz, Ooi y Pedersen, con datos desde 1880). Aprovecharlo tras costes es otra cosa.'),
      key('Lo que te llevas', 'Practica con las herramientas de línea de tendencia y línea horizontal del gráfico.', 'Tendencia alcista = máximos y mínimos más altos; bajista = más bajos.', 'La tendencia es tu amiga… hasta que deja de hacer máximos más altos.'),
    ], [
      trend('¿Qué tendencia tiene este gráfico?', 'trend-up-1', 'Alcista', 'Máximos y mínimos cada vez más altos.'),
      trend('¿Y este?', 'trend-down-2', 'Bajista', 'Cada rebote se queda por debajo del anterior.'),
      trend('¿Y este otro?', 'trend-flat-1', 'Lateral', 'El precio oscila sin superar techo ni perder suelo de forma clara.'),
      single('Máximos 50, 54 y 58 €; mínimos 45, 48 y 52 €. Tendencia:', ['Alcista', 'Bajista', 'Lateral'], 0, 'Máximos y mínimos crecientes.'),
      single('¿Cuándo se pone en duda una tendencia alcista?', ['Con una vela roja', 'Cuando no supera el último máximo y pierde el último mínimo', 'Cuando sube el volumen'], 1, 'Es la regla de la teoría de Dow.'),
    ], { source: '7.5', xp: 35 }),

    lesson('u7l6', 'El volumen: la fuerza detrás del precio', [
      text('Cómo se lee', '• Sube con volumen alto: convicción.\n• Sube con volumen decreciente: posible agotamiento.\n• Rompe un nivel con volumen alto: rotura más fiable.\n• Rompe con volumen bajo: riesgo de **falsa rotura**.'),
      text('Picos de volumen', 'Aparecen con noticias, vencimientos y momentos de pánico o euforia. Tras una caída fuerte, un pico extremo a veces marca la **capitulación**: los últimos vendedores se rinden.'),
      text('Limitaciones', 'En divisas no hay un volumen centralizado; en cripto se reparte entre plataformas y parte puede ser artificial; en índices depende del proveedor.'),
      chart('marubozu-1', 'Toca la vela verde más grande y casi sin mechas', 'Es un marubozu: los compradores controlaron el periodo de principio a fin.', 'Busca un rectángulo verde largo sin apenas líneas arriba y abajo.'),
      key('Lo que te llevas', 'En E-Trading puedes activar el volumen en Indicadores.', 'Un movimiento con mucho volumen tiene mucha gente detrás; sin volumen puede ser una ilusión.', 'El precio dice qué pasa; el volumen, cuánta gente lo cree.'),
    ], [
      single('El precio rompe una resistencia con un volumen muy inferior a la media. ¿Qué riesgo hay?', ['Ninguno', 'Que sea una falsa rotura', 'Que cierre la bolsa'], 1, 'Sin volumen, la rotura tiene poca gente detrás.'),
      tf('Un pico enorme de volumen tras una caída fuerte puede indicar capitulación.', true, 'Aunque puede haber varios: no es una señal infalible.'),
      single('¿En qué mercado el volumen es menos fiable por no estar centralizado?', ['Acciones del S&P 500', 'Divisas', 'Bolsa de Madrid'], 1, 'El mercado de divisas no tiene una bolsa central.'),
      single('Precio que sube con volumen cada vez más bajo. Lectura habitual:', ['Subida con convicción', 'Posible agotamiento', 'Rotura segura'], 1, 'Cada vez menos gente empuja la subida.'),
    ], { source: '7.6' }),
  ],
})
