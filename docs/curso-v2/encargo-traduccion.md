# Encargo de traducción del curso (catalán e inglés)

Proyecto: E-Trading, app para aprender a invertir (16-35 años), en `/Users/joanvidalalmirall/easytrading`.

## Qué tienes que hacer

Para cada archivo de tu lote en `src/server/content/v2/i18n/es/<archivo>.json`, crea:
- `src/server/content/v2/i18n/ca/<archivo>.json` (catalán)
- `src/server/content/v2/i18n/en/<archivo>.json` (inglés británico, como el resto de la app: «colour», «favourites»)

con **exactamente la misma estructura**: mismas claves, mismos ids, mismos arrays con el **mismo número de elementos en el mismo orden**. Solo cambian los textos.

## Reglas que no se pueden romper (las comprueba un script)

1. **El orden de `options`, `right`, `feedback`, `lines`, `senders` y `kinds` no cambia**: las soluciones son posiciones. La opción 2 en español tiene que ser la opción 2 traducida.
2. **Las cifras se conservan**: mismos números (puedes cambiar el formato: en inglés «10,000 €» o «7.5 %»; en catalán igual que en español, «10.000 €», «7,5 %»). No escribas números con letras si en español van en cifras, ni al revés.
3. Si el texto tiene **«____»** (hueco), la traducción también; y la opción correcta tiene que encajar en el hueco gramaticalmente.
4. No repitas dos opciones iguales dentro de una pregunta.
5. Mantén el marcado: `**negrita**`, saltos de línea `\n`, viñetas `•`, comillas «».
6. No traduzcas: nombres propios (Laura, Pablo, Lumi, Inditex, S&P 500, IBEX 35…), siglas de uso internacional (ETF, PER→ en inglés **P/E**, en catalán **PER**; TAE→ en inglés **APR**, en catalán **TAE**; CNMV, MiFID, MiCA), ni el símbolo €.
7. Términos españoles sin equivalente (IRPF, modelo 720, Hacienda, Fondo de Garantía de Depósitos): en inglés, déjalos con una aclaración breve la primera vez si cabe (p. ej. «IRPF (Spanish income tax)»); en catalán, como se dicen en Cataluña («IRPF», «Hisenda», «model 720»).

## Estilo

- Mismo tono: cercano, joven, claro, sin infantilizar; tuteo en catalán («tu»), «you» en inglés.
- Catalán normativo y natural (no calco del castellano). Terminología financiera habitual en catalán: «borsa», «accions», «fons indexats», «rendibilitat», «comissió», «estalvi», «inversió», «espelmes japoneses», «tendència alcista/baixista».
- Inglés natural de finanzas personales: «index fund», «emergency fund», «stop loss», «take profit», «candlestick», «dollar-cost averaging», «drawdown».
- Las explicaciones de «¿Sube o baja?» siguen siendo neutrales.

## Comprobar (obligatorio antes de terminar)

```bash
cd /Users/joanvidalalmirall/easytrading
npx tsx --conditions=react-server scripts/content-i18n.ts check u5 u6 u7 u8   # tus archivos, sin «.json»
```

Tiene que terminar con «✓ Traducciones correctas». Corrige todo lo que marque.

## Límites

Solo crea tus archivos en `i18n/ca/` y `i18n/en/`. No toques nada más (ni el español, ni código, ni otros lotes), no hagas commits ni instales nada. Puedes escribir los JSON con Python si te resulta más cómodo, pero revisa que la traducción sea buena, no literal.

Al terminar, devuelve: archivos creados, resultado del comprobador y dudas de terminología.
