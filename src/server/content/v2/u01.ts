import 'server-only'
// Sección 1 · Unidad 1 · El dinero y la inflación (docs/curso-v2/02-curriculo.md)
// Unidad de referencia del curso v2: teoría corta (≤3 pantallas) y 8-12 ejercicios de al menos 3 tipos.
import { buckets, chat, choose, fill, key, lesson, match, multi, note, num, opt, order, play, say, scenario, single, story, tf, timed, unit, when } from '../dsl'

export default unit({
  id: 'u1', order: 1, title: 'El dinero y la inflación', description: 'Qué es el dinero, por qué pierde valor y cómo crece con el interés compuesto',
  lessons: [
    lesson('u1l1', 'Qué es el dinero (y qué no)', [
      story('Dos sueldos, dos finales', [{ id: 'marta', name: 'Marta' }, { id: 'pablo', name: 'Pablo' }], [
        note('Marta cobra 1.800 € al mes. Pablo, 1.300 €.'),
        say('marta', 'Este mes me he comprado unas zapatillas, he cenado fuera tres veces… ¡y aún me sobran 50 €!'),
        say('pablo', 'Yo cocino en casa casi siempre. Me sobran 300 € y los aparto.'),
        choose('Dentro de 5 años, sin invertir nada, ¿quién tendrá más ahorrado?', [
          opt('Marta, porque gana más', 'bad', say('lumi', 'Marta aparta 50 € al mes: **3.000 €** en 5 años. Pablo aparta 300 €: **18.000 €**, seis veces más.')),
          opt('Pablo, porque aparta más cada mes', 'good', say('lumi', '¡Exacto! Pablo junta **18.000 €** en 5 años y Marta, 3.000 €. Lo que cuenta es lo que te queda, no lo que cobras.')),
          opt('Los dos igual', 'ok', say('lumi', 'No: Marta aparta 50 € al mes y Pablo, 300 €. En 5 años son 3.000 € frente a 18.000 €.')),
        ]),
        say('lumi', 'Ganar mucho no es lo mismo que **tener** mucho. Vamos a medir lo que tiene Pablo.'),
      ]),
      play({
        title: '¿Cuánto tiene de verdad?',
        intro: 'Esto es lo que tiene y lo que debe Pablo. Coloca cada cosa: ¿**suma** o **resta**?',
        widget: {
          kind: 'sort', sumLabel: 'Patrimonio de Pablo',
          bins: [{ label: 'Lo que tiene', sign: 1 }, { label: 'Lo que debe', sign: -1 }],
          cards: [
            { icon: 'bank', label: 'Ahorros en la cuenta', value: 3000, bin: 0, why: 'El dinero ahorrado es suyo: suma.' },
            { icon: 'car', label: 'Su coche (lo que vale hoy)', value: 6000, bin: 0, why: 'Lo que tienes cuenta por lo que vale hoy, no por lo que costó.' },
            { icon: 'document', label: 'Lo que queda del préstamo del coche', value: 4000, bin: 1, why: 'Una deuda resta: el coche todavía no es del todo suyo.' },
            { icon: 'laptop', label: 'Su portátil', value: 500, bin: 0, why: 'Un objeto de valor suma, aunque cada año valga un poco menos.' },
            { icon: 'card', label: 'Lo pendiente de la tarjeta', value: 300, bin: 1, why: 'Lo que debes de la tarjeta resta, aunque no lo veas.' },
          ],
        },
        goal: { text: 'Coloca todo y descubre el patrimonio de Pablo.', when: [when('done', '==', 5)] },
        insight: '**Patrimonio = lo que tienes − lo que debes.** El de Pablo: 9.500 − 4.300 = **5.200 €**. Es una foto; su renta y su ahorro son la película que la va cambiando.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Ojo con las deudas: aunque no las veas, restan.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Vas bien! Mira cómo cambia la cuenta de abajo.', mood: 'HAPPY' },
          { say: 'Toca **suma** o **resta** para cada cosa', mood: 'HAPPY' },
        ],
      }),
      key('Para qué sirve el dinero', 'El dinero hace tres trabajos:\n\n• **Medio de pago:** cambias trabajo por pan sin hacer trueque.\n• **Unidad de cuenta:** sabes que un café vale menos que una bici.\n• **Depósito de valor:** puedes guardarlo para mañana… aunque, como verás en la próxima clase, se va desgastando.', 'Riqueza es patrimonio, no sueldo: lo que tienes menos lo que debes.'),
    ], [
      match('Empareja cada palabra con su significado.', [['Renta', 'Lo que te entra cada mes'], ['Ahorro', 'Lo que no gastas de lo que te entra'], ['Patrimonio', 'Lo que tienes menos lo que debes'], ['Inversión', 'Poner el ahorro a producir más']], 'Renta y ahorro son flujos (cada mes); el patrimonio es una foto en un momento.'),
      num('Tienes 2.500 € en el banco y un portátil que vale 800 €, y debes 1.200 € de un préstamo. ¿Cuál es tu patrimonio?', 2100, '€', '2.500 + 800 − 1.200 = 2.100 €. El patrimonio resta lo que debes.'),
      single('¿Cuál de estas funciones del dinero falla cuando hay mucha inflación?', ['Medio de pago', 'Depósito de valor', 'Unidad de cuenta para comparar un café y una bici'], 1, 'Con inflación alta, el dinero guardado compra menos cada año: deja de ser buen depósito de valor.'),
      tf('Alguien que gana 4.000 € al mes y lo gasta todo puede tener menos patrimonio que alguien que gana 1.500 € y ahorra 300 €.', true, 'El patrimonio crece con lo que ahorras e inviertes, no con lo que ganas.'),
      buckets('¿Es renta o es patrimonio?', ['Renta (llega cada mes)', 'Patrimonio (lo que tienes)'], [['Tu nómina de 1.400 €', 0], ['Un piso que es tuyo', 1], ['El alquiler que cobras cada mes', 0], ['8.000 € en un fondo', 1], ['La paga extra de junio', 0]], 'La renta es lo que entra; el patrimonio, lo que acumulas.'),
      chat(['Me acaban de subir el sueldo 300 € al mes 🎉', '¿Qué hago con ellos?'], '¿Qué le contestas a Lumi?', [['Me lo gasto todo, me lo merezco', 'Disfrutar está bien, pero si todo sube el gasto, tu patrimonio no se mueve.'], ['Aparto una parte cada mes antes de gastar', '¡Eso es! Si apartas 100 € al mes, en un año son 1.200 € más de patrimonio.'], ['Pido un préstamo para un coche más caro', 'Así el aumento se va en cuotas y tu patrimonio puede bajar.']], 1, 'Subir el sueldo no te hace más rico si sube igual el gasto: lo que te enriquece es lo que apartas.'),
      fill('Patrimonio = lo que tienes − lo que ____.', 'debes', ['ganas', 'gastas', 'ahorras'], 'Las deudas restan: un coche de 15.000 € con 12.000 € de préstamo solo te aporta 3.000 €.'),
      timed(tf('¿Una nómina es patrimonio?', false, 'Es renta: un flujo que entra cada mes. Lo que acumulas con ella es patrimonio.'), 10),
      scenario('Marta cobra 1.800 € y gasta 1.750 €. Pablo cobra 1.300 € y gasta 1.000 €. Dentro de 5 años, sin invertir nada, ¿quién tendrá más ahorrado?', [['Marta, porque gana más', 'Marta solo aparta 50 € al mes: 3.000 € en 5 años.'], ['Pablo, porque aparta más cada mes', 'Pablo aparta 300 € al mes: 18.000 € en 5 años, seis veces más que Marta.'], ['Los dos igual', 'No: lo que cuenta es la diferencia entre lo que entra y lo que sale.']], 1, 'Lo que construye patrimonio es la diferencia entre ingresos y gastos, no el sueldo.'),
    ], { source: '1.1', minutes: 6, retire: [5, 7, 8] }),

    lesson('u1l2', 'La inflación: por qué todo sube', [
      story('Las 100 pesetas de la abuela', [{ id: 'abuela', name: 'Abuela Carmen' }], [
        say('abuela', 'Cuando yo tenía tu edad, con 100 pesetas volvía del mercado con la cesta llena.'),
        say('abuela', 'Hoy 100 pesetas serían 60 céntimos. ¡No te dan ni para una barra de pan!'),
        choose('¿Por qué crees que pasa esto?', [
          opt('Porque antes las cosas eran de peor calidad', 'bad', say('lumi', 'Algo ha cambiado la calidad, pero eso no explica que suba **todo**: el pan sigue siendo pan.')),
          opt('Porque los precios suben un poco cada año y se va acumulando', 'good', say('lumi', '¡Eso es! Se llama **inflación**. Un 3 % al año parece poco… hasta que pasan 20 años.')),
          opt('Porque el euro vale menos que la peseta', 'ok', say('lumi', 'El cambio fue de 166,386 pesetas por euro: eso no es el problema. Lo que pesa es todo lo que han subido los precios desde entonces.')),
        ]),
        say('abuela', 'Pues a ver si tú lo entiendes mejor que yo'),
        say('lumi', 'Vamos a verlo con tu propia cesta de la compra.'),
      ]),
      play({
        title: 'Tu cesta dentro de unos años',
        intro: 'Hoy, con **50 €** te llevas toda esta cesta. Pero los precios suben cada año con la inflación…',
        widget: {
          kind: 'basket', money: 50, rate: 3, years: 0, maxYears: 30, maxRate: 10,
          items: [
            { icon: 'bread', name: 'Pan', price: 2.5 }, { icon: 'milk', name: 'Leche', price: 6 }, { icon: 'apple', name: 'Fruta', price: 8 },
            { icon: 'pasta', name: 'Pasta', price: 4 }, { icon: 'egg', name: 'Huevos', price: 3.5 }, { icon: 'chicken', name: 'Pollo', price: 7 },
            { icon: 'fish', name: 'Pescado', price: 9 }, { icon: 'oil', name: 'Aceite', price: 9 }, { icon: 'coffee', name: 'Café', price: 1 },
          ],
        },
        predict: {
          prompt: 'Con un 3 % de inflación al año, ¿qué te llevarás con esos mismos 50 € dentro de 20 años?',
          options: ['Casi todo: un 3 % es muy poco', 'Más o menos la mitad de la cesta', 'Nada: todo costará diez veces más'],
          answer: 1,
          why: 'Un 3 % durante 20 años sube los precios un 81 %: tus 50 € compran lo que hoy 28 €. Compruébalo moviendo los años.',
        },
        goal: { text: 'Busca qué inflación deja tu cesta a la mitad en solo 10 años.', when: [when('years', '==', 10), when('itemsPct', '>=', 45), when('itemsPct', '<=', 51)] },
        insight: 'Truco para calcularlo de cabeza: **70 ÷ inflación** = años hasta que tu dinero compra la mitad. Al 7 %, 10 años; al 2 %, 35.',
        lumi: [
          { when: when('itemsPct', '<', 35), say: '¡Uf! Con eso no llenas ni un tercio de la cesta. Así se vive una inflación alta.', mood: 'WORRIED' },
          { when: when('itemsPct', '<=', 60), say: '¿Lo ves? Los billetes son los mismos 50 €, pero compran mucho menos.', mood: 'THINKING' },
          { when: when('years', '>', 0), say: 'Ahora sube la inflación: ¿qué pasa con un 7 %?', mood: 'HAPPY' },
          { say: 'Arrastra los años y mira qué pasa con tu cesta', mood: 'HAPPY' },
        ],
      }),
      key('Por qué suben los precios', 'Suben cuando hay más dinero o más demanda que cosas que comprar, o cuando producir cuesta más (la energía en 2022). En España la mide el INE con el **IPC**: en 2025 fue del 2,7 % de media.\n\nEl BCE intenta que ronde el **2 %** subiendo o bajando los tipos de interés.', 'Con inflación, el dinero quieto compra cada año un poco menos.'),
    ], [
      num('Con una inflación del 3 % durante 20 años, ¿cuánto podrán comprar 1.000 € en euros de hoy? (redondea)', 554, '€', '1.000 ÷ 1,03²⁰ ≈ 554 €. Cada año los precios suben y el mismo dinero compra menos.', 2),
      tf('El objetivo de inflación del BCE es el 0 %.', false, 'Es el 2 % a medio plazo. Por eso el dinero parado pierde valor incluso en años normales.'),
      fill('Con la regla del 70, una inflación del 2 % reduce a la mitad el poder de compra en unos ____ años.', '35', ['10', '70', '20'], '70 ÷ 2 = 35 años.'),
      multi('¿Qué puede hacer subir los precios? Marca todas las que correspondan.', ['Que se encarezca la energía', 'Que haya mucha más demanda que productos', 'Que el banco central suba mucho los tipos', 'Que se cree mucho dinero muy deprisa'], [0, 1, 3], 'Subir los tipos sirve justo para frenar la inflación: encarece el crédito y enfría la demanda.'),
      match('Empareja cada situación con su efecto en los precios.', [['La energía se dispara', 'Suben los costes de producir'], ['Todos quieren comprar a la vez', 'Sube la demanda'], ['El BCE sube los tipos', 'Se frena el crédito y la demanda']], 'Inflación de costes, inflación de demanda y la herramienta del BCE para frenarlas.'),
      scenario('Es 2022: la inflación en España llega al 8 % y tu cuenta paga un 0 %. Tienes 10.000 € que no necesitas en 10 años. ¿Qué haces?', [['Nada: el dinero en el banco está seguro', 'Tus 10.000 € compran un 8 % menos en un año: unos 800 € de poder de compra perdidos.'], ['Estudio opciones que al menos busquen superar la inflación a largo plazo', 'Bien: a 10 años, dejarlo quieto es la forma más segura de perder poder de compra.'], ['Lo gasto todo antes de que valga menos', 'Gastar por miedo no protege tu futuro: solo cambia ahorro por consumo.']], 1, 'El dinero parado no está a salvo de la inflación. Para lo que no necesitas en años, conviene que trabaje.'),
      timed(single('Rápido: inflación del 7 %. ¿En cuántos años tu dinero compra la mitad (regla del 70)?', ['5 años', '10 años', '20 años'], 1, '70 ÷ 7 = 10 años.'), 15),
    ], { source: '1.1', minutes: 6 }),

    lesson('u1l3', 'El IPC y tu cesta de la compra', [
      story('¿Por qué yo lo noto más?', [{ id: 'leo', name: 'Leo' }, { id: 'sara', name: 'Sara' }], [
        say('leo', 'Dicen que la inflación es del 3 %, pero yo noto que todo me sube muchísimo más.'),
        say('sara', 'Pues yo casi ni lo noto…'),
        note('Leo alquila un piso y va en coche a todas partes. Sara vive con su familia y va en bici.'),
        choose('Este año, el alquiler y la gasolina han subido más que el resto. ¿Quién tiene razón?', [
          opt('Leo exagera: la inflación es la misma para todos', 'bad', say('lumi', 'El IPC es una **media**. Cada persona tiene su cesta: si gastas más en lo que más sube, tu inflación es mayor.')),
          opt('Los dos: cada uno tiene su propia inflación', 'good', say('lumi', '¡Eso es! El IPC es la media de todos. Leo gasta mucho en alquiler y gasolina, así que **su** inflación es mayor que el 3 %.')),
          opt('Sara: si ella no lo nota, no hay inflación', 'bad', say('lumi', 'Que Sara no lo note no significa que no suba: su cesta tiene menos de lo que más ha subido.')),
        ]),
      ]),
      play({
        title: 'La inflación que no se mueve tanto',
        intro: 'El INE da dos cifras. El **IPC general** mide toda la cesta. La **inflación subyacente** quita lo que sube y baja muy deprisa (la energía y los alimentos frescos) para ver la tendencia de fondo.',
        widget: {
          kind: 'sort',
          bins: [{ label: 'Cuenta en la subyacente' }, { label: 'Se excluye: muy volátil' }],
          cards: [
            { icon: 'power', label: 'La factura de la luz', bin: 1, why: 'Es energía: puede dispararse un mes y bajar al siguiente.' },
            { icon: 'clothes', label: 'Una camiseta', bin: 0, why: 'La ropa cambia de precio poco a poco: cuenta en la subyacente.' },
            { icon: 'cherry', label: 'Fresas frescas', bin: 1, why: 'Los alimentos sin elaborar dependen del tiempo y de las cosechas: se excluyen.' },
            { icon: 'haircut', label: 'Un corte de pelo', bin: 0, why: 'Los servicios cambian despacio: son la tendencia de fondo.' },
            { icon: 'fuel', label: 'Llenar el depósito', bin: 1, why: 'Los carburantes son energía: muy volátiles.' },
            { icon: 'pasta', label: 'Un paquete de pasta', bin: 0, why: 'Es un alimento elaborado: se queda en la subyacente.' },
          ],
        },
        goal: { text: 'Clasifica las seis cosas.', when: [when('done', '==', 6)] },
        insight: 'Si la luz se dispara un mes, el IPC general salta, pero la **subyacente** apenas se mueve. Por eso los bancos centrales la miran tanto: enseña la tendencia de fondo.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Pista: lo que depende del tiempo o del petróleo, fuera.', mood: 'THINKING' },
          { say: '¿Entra o se excluye? Clasifica cada cosa', mood: 'HAPPY' },
        ],
      }),
      key('Cómo se mide', 'Cada mes, el INE anota los precios de una **cesta** de cientos de productos y servicios: comida, vivienda, transporte, ocio… El **IPC** es lo que ha cambiado esa cesta respecto al mismo mes del año anterior.\n\nCada cosa pesa según lo que gastan de media los hogares.', 'El IPC es la media de todos: tu inflación depende de en qué gastas tú.'),
    ], [
      single('¿Qué mide el IPC?', ['El precio de las acciones', 'Cuánto cambian los precios de una cesta de consumo', 'Lo que gana de media un hogar'], 1, 'Es un índice de precios de consumo: compara la misma cesta en el tiempo.'),
      buckets('¿Entra en la inflación subyacente?', ['Sí, cuenta', 'No, se excluye'], [['La electricidad', 1], ['Una camiseta', 0], ['La fruta fresca', 1], ['Un corte de pelo', 0], ['La gasolina', 1]], 'La subyacente quita la energía y los alimentos no elaborados porque son los más volátiles.'),
      tf('Tu inflación personal puede ser distinta a la oficial.', true, 'El IPC pondera según el gasto medio; tu cesta tiene otro peso en cada cosa.'),
      scenario('Alquilas, vas en coche a todas partes y la gasolina y los alquileres han subido más que el resto. El IPC oficial es del 3 %. ¿Qué es más probable?', [['Mi inflación es justo del 3 %', 'Solo si tu cesta se parece a la media, y la tuya no.'], ['Mi inflación personal es mayor del 3 %', 'Sí: gastas más en lo que más ha subido.'], ['Mi inflación es 0 %', 'Los precios que pagas sí han subido.']], 1, 'Si gastas más en lo que más sube, tu inflación personal supera a la media.'),
      fill('Si un mes la luz se dispara, el IPC general sube mucho, pero la inflación ____ apenas se mueve.', 'subyacente', ['general', 'personal', 'negativa'], 'La subyacente excluye la energía para ver la tendencia de fondo.'),
      num('Una cesta costaba 200 € hace un año y hoy cuesta 206 €. ¿Cuál ha sido la inflación de esa cesta?', 3, '%', '(206 − 200) ÷ 200 = 0,03 → 3 %.'),
      match('Empareja cada perfil con la parte de la cesta que más le afecta.', [['Joven que alquila en Madrid', 'Vivienda'], ['Repartidor con furgoneta', 'Carburantes'], ['Familia con tres hijos', 'Alimentación']], 'Cada hogar tiene su cesta: por eso la inflación personal varía.'),
      timed(tf('La inflación subyacente incluye la energía.', false, 'La quita precisamente porque es muy volátil.'), 10),
      multi('¿Qué es cierto sobre el IPC? Marca todas.', ['Lo publica el INE cada mes', 'Compara precios con el mismo mes del año anterior', 'Mide la rentabilidad de la bolsa', 'Cada producto pesa según el gasto medio de los hogares'], [0, 1, 3], 'El IPC es una media ponderada de precios de consumo.'),
    ], { source: '1.1', minutes: 6, retire: [1, 3, 7] }),

    lesson('u1l4', 'El dinero parado pierde valor', [
      play({
        title: '¿Seguro… o protegido?',
        intro: 'Tienes **10.000 €** en una cuenta que paga un 0 %. El saldo nunca baja. Pero los precios suben…',
        widget: { kind: 'realrate', amount: 10000, nominal: 0, inflation: 2.7, years: 10, maxNominal: 6, maxInflation: 8 },
        predict: {
          prompt: 'Con un 2,7 % de inflación al año, ¿qué podrás comprar con esos 10.000 € dentro de 10 años?',
          options: ['Lo mismo: el saldo no ha bajado', 'Lo que hoy compras con unos 7.700 €', 'Lo que hoy compras con unos 2.700 €'],
          answer: 1,
          why: 'En 10 años al 2,7 %, los precios suben un 31 %: tus 10.000 € compran lo que hoy 7.661 €. No pierdes euros, pierdes **poder de compra**.',
        },
        goal: { text: '¿Cuánto tendría que pagar la cuenta para no perder poder de compra?', when: [when('real', '>=', 0)] },
        insight: '**Rentabilidad real ≈ rentabilidad − inflación.** Solo ganas poder de compra si tu dinero rinde más de lo que suben los precios.',
        lumi: [
          { when: when('real', '<', -2), say: '¡Uy! Así tu dinero se encoge rapidísimo.', mood: 'WORRIED' },
          { when: when('real', '<', 0), say: 'Sigue en rojo: los euros crecen menos que los precios.', mood: 'THINKING' },
          { say: 'Sube lo que paga la cuenta hasta que la línea deje de bajar', mood: 'HAPPY' },
        ],
      }),
      story('«Ahí están seguros»', [{ id: 'tio', name: 'Tío Javi' }], [
        say('tio', 'Yo tengo 20.000 € en la cuenta desde hace años. Al 0 %, pero ahí no pierdo nada.'),
        choose('¿Qué le contestas?', [
          opt('Tienes razón, el saldo no baja', 'bad', say('lumi', 'El saldo no baja, pero con un 2,5 % de inflación, en 15 años esos 20.000 € comprarán lo que hoy unos **13.800 €**.')),
          opt('Seguros sí, pero cada año compran un poco menos', 'good', say('lumi', '¡Bien visto! No pierde euros: pierde **poder de compra**. Lo que no necesite en años puede trabajar para ganarle a la inflación.')),
          opt('Mejor sácalos y guárdalos en casa', 'bad', say('lumi', 'En un cajón pierden igual con la inflación… y además se pueden perder o robar.')),
        ]),
        say('tio', 'Vaya… nunca lo había pensado así.'),
        say('lumi', 'Ojo: los depósitos están protegidos hasta **100.000 €** por el Fondo de Garantía de Depósitos si quiebra el banco. Eso protege tus euros, no tu poder de compra.'),
      ]),
    ], [
      num('Tu cuenta paga un 1,5 % y la inflación es del 2,7 %. ¿Cuál es tu rentabilidad real aproximada?', -1.2, '%', 'Real ≈ 1,5 − 2,7 = −1,2 %. Ganas euros, pero pierdes poder de compra.', 5),
      tf('Si tu cuenta paga un 3 % y la inflación es del 2 %, ganas poder de compra.', true, 'Rentabilidad real ≈ 3 − 2 = +1 %.'),
      buckets('Inflación del 2,5 %. ¿Ganas o pierdes poder de compra?', ['Ganas', 'Pierdes'], [['Cuenta al 0 %', 1], ['Depósito al 3 %', 0], ['Dinero en un cajón', 1], ['Letra del Tesoro al 2 %', 1], ['Algo que rinde un 5 %', 0]], 'Solo ganas si rindes más que la inflación.'),
      single('¿Qué protege el Fondo de Garantía de Depósitos?', ['Tu poder de compra frente a la inflación', 'Hasta 100.000 € por persona y entidad si el banco quiebra', 'Tus inversiones en bolsa'], 1, 'Protege los euros depositados si quiebra el banco, no frente a la inflación ni frente a caídas de la bolsa.'),
      scenario('Tienes 20.000 € en una cuenta al 0 % y no los necesitarás en 15 años. Un amigo dice: «Así no pierdes nada». ¿Qué le dices?', [['Tiene razón: el saldo no baja', 'El saldo no baja, pero con un 2,5 % de inflación esos 20.000 € comprarán como unos 13.800 € de hoy en 15 años.'], ['Que pierdo poder de compra cada año', 'Exacto: no pierdes euros, pierdes lo que puedes comprar con ellos.'], ['Que debería meterlo todo en una sola acción', 'Eso es pasar de un extremo a otro: más adelante verás por qué diversificar.']], 1, 'Dinero quieto durante años = poder de compra perdido.'),
      fill('Rentabilidad real ≈ rentabilidad nominal − ____.', 'inflación', ['comisiones', 'impuestos', 'dividendos'], 'Es la forma rápida de saber si tu dinero gana o pierde poder de compra.'),
      timed(single('Rápido: rinde un 4 % e inflación del 3 %. ¿Rentabilidad real?', ['+7 %', '+1 %', '−1 %'], 1, '4 − 3 = +1 %.'), 12),
      chat(['Tengo 5.000 € en la cuenta corriente desde hace años.', 'Total, ahí están seguros, ¿no?'], '¿Qué le contestas?', [['Sí, ahí no pasa nada', 'Los euros están, pero cada año compran un poco menos.'], ['Seguros sí, pero la inflación se come su valor poco a poco', '¡Bien visto! Lo que no necesites pronto puede trabajar para ganarle a la inflación.'], ['Mejor sácalos en efectivo', 'En un cajón pierden igual con la inflación y además se pueden perder o robar.']], 1, 'Seguridad nominal no es protección real.'),
      tf('Un depósito garantizado nunca puede hacerte perder poder de compra.', false, 'Si rinde menos que la inflación, sí lo pierdes, aunque el saldo no baje.'),
    ], { source: '1.1', minutes: 6, retire: [6, 7, 8] }),

    lesson('u1l5', 'Interés simple e interés compuesto', [
      play({
        title: 'El colchón, el simple y el compuesto',
        intro: 'Tres formas de guardar **1.000 €**:\n\n• **Colchón:** no crecen.\n• **Interés simple:** cobras siempre sobre lo que pusiste.\n• **Interés compuesto:** también ganas sobre lo ya ganado.',
        widget: { kind: 'growth', initial: 1000, monthly: 0, rate: 7, years: 30, maxInitial: 10000, maxMonthly: 500, maxRate: 12, maxYears: 40, lines: ['mattress', 'simple', 'compound'], controls: ['rate', 'years'] },
        predict: {
          prompt: '1.000 € al 7 % al año durante 30 años. ¿Cuánto tendrás con interés compuesto?',
          options: ['Unos 3.100 €', 'Unos 7.600 €', 'Unos 21.000 €'],
          answer: 1,
          why: 'Con interés simple serían 3.100 €. Con compuesto, **7.612 €**: casi dos veces y media más, sin poner ni un euro más.',
        },
        goal: { text: 'Llega a 10.000 € sin añadir dinero: juega con la rentabilidad y los años.', when: [when('final', '>=', 10000)] },
        insight: 'El compuesto **acelera**: los últimos años crecen mucho más que los primeros. Por eso el tiempo pesa tanto como la rentabilidad.',
        lumi: [
          { when: when('rate', '>=', 11), say: 'Rentabilidades tan altas no son normales: con un 7 % ya vas muy bien a largo plazo.', mood: 'THINKING' },
          { when: when('years', '>=', 35), say: 'Mira el final de la curva verde: ¡se dispara!', mood: 'HAPPY' },
          { say: 'Mueve los años: fíjate en cómo se separan las líneas', mood: 'HAPPY' },
        ],
      }),
      play({
        title: 'Ana y Bruno',
        intro: 'Los dos apartan **200 € al mes** al 7 % hasta los 65. Ana empieza a los 25. ¿Y si Bruno empieza más tarde?',
        widget: { kind: 'race', monthly: 200, rate: 7, endAge: 65, a: { name: 'Ana', age: 25 }, b: { name: 'Bruno', age: 35 }, maxAge: 55 },
        predict: {
          prompt: 'Bruno empieza 10 años después que Ana. A los 65, ¿cuánto tendrá él comparado con ella?',
          options: ['Un 25 % menos', 'Menos de la mitad', 'Casi lo mismo'],
          answer: 1,
          why: 'Ana llega a unos **494.000 €** y Bruno a unos **234.000 €**: menos de la mitad, aunque Ana solo puso 24.000 € más.',
        },
        goal: { text: 'Retrasa a Bruno hasta que Ana tenga el triple que él.', when: [when('ratio', '>=', 3)] },
        insight: 'Cada año que esperas cuesta mucho más de lo que parece: los primeros euros son los que más tiempo tienen para componerse.',
        lumi: [
          { when: when('delay', '>=', 20), say: 'Empezando a los 45, Bruno ya no alcanza a Ana aunque aporte lo mismo cada mes.', mood: 'WORRIED' },
          { when: when('delay', '<=', 0), say: 'Si empiezan a la vez, acaban igual. Ahora retrasa a Bruno', mood: 'HAPPY' },
          { say: 'Cada año de retraso abre más la brecha. ¿Hasta dónde llega?', mood: 'THINKING' },
        ],
      }),
      key('También en tu contra', 'El interés compuesto funciona igual con las deudas: una tarjeta que cobra intereses sobre intereses crece sola. Lo verás en la unidad de deudas.\n\nY recuerda: son ejemplos, no promesas. La bolsa no da un 7 % cada año.', 'Las ganancias generan nuevas ganancias: cuanto antes empiezas, más trabaja el tiempo por ti.'),
    ], [
      num('1.000 € al 7 % de interés compuesto durante 30 años, ¿en cuánto se convierten? (redondea)', 7612, '€', '1.000 × 1,07³⁰ ≈ 7.612 €. Con interés simple serían 3.100 €.', 2),
      single('Ana y Bruno aportan 200 € al mes al 7 %, pero Ana empieza 10 años antes. A los 65, Ana tiene…', ['Un 25 % más', 'Más del doble', 'Lo mismo'], 1, '524.963 € frente a 243.994 €: los primeros años son los que más se componen.'),
      match('Empareja cada caso con el tipo de interés.', [['Cobras siempre sobre lo que pusiste', 'Interés simple'], ['Ganas también sobre lo ya ganado', 'Interés compuesto'], ['Una deuda de tarjeta que crece sobre sí misma', 'Interés compuesto en tu contra']], 'El compuesto acelera el crecimiento… también el de las deudas.'),
      num('10.000 € al 5 % compuesto durante 10 años, ¿cuánto suman? (redondea a euros)', 16289, '€', '10.000 × 1,05¹⁰ ≈ 16.289 €. Con simple serían 15.000 €.', 1),
      tf('El interés compuesto solo funciona a tu favor.', false, 'También en tu contra: una tarjeta revolving al 20 % duplica la deuda en menos de 4 años.'),
      order('Ordena de menos a más el resultado de 100 € al mes durante 30 años.', ['Al 0 %', 'Al 2 %', 'Al 5 %', 'Al 7 %'], '36.000 €, 49.273 €, 83.226 € y 121.997 €: unos pocos puntos de rentabilidad cambian muchísimo el final.'),
      scenario('Tienes 22 años y 50 € al mes para invertir. ¿Qué haces?', [['Espero a ganar más para empezar con algo «serio»', 'Esperar cuesta caro: los primeros años son los que más tiempo tienen para componerse.'], ['Empiezo ya con 50 € y subo la aportación cuando pueda', 'Bien: con el tiempo de tu lado, empezar pronto pesa más que empezar con mucho.'], ['Lo gasto: 50 € no dan para nada', '50 € al mes al 7 % durante 40 años son unos 130.000 €, con 24.000 € aportados.']], 1, 'Empezar pronto, aunque sea con poco, es lo que más aprovecha el interés compuesto.'),
      timed(tf('Con interés compuesto, el dinero crece más deprisa cuanto más tiempo pasa.', true, 'Cada año ganas sobre una base más grande: la curva se empina con el tiempo.'), 10),
      chat(['He visto que si dejo 1.000 € al 7 %, en 30 años tengo 7.600 €.', '¿Y si en vez de 30 son 40 años?'], '¿Qué le dices?', [['Un poco más, unos 8.500 €', 'Mucho más: 1.000 × 1,07⁴⁰ ≈ 14.974 €. Los últimos 10 años casi duplican el resultado.'], ['Casi el doble, unos 15.000 €', '¡Eso! Diez años más al 7 % multiplican por casi 2 (1,07¹⁰ ≈ 1,97).'], ['Lo mismo, el tiempo no importa', 'El tiempo es justo lo que más importa en el interés compuesto.']], 1, 'Cada década extra al 7 % casi duplica el dinero.'),
    ], { source: '1.3', minutes: 6, retire: [1, 7, 8] }),

    lesson('u1l6', 'La regla del 72', [
      play({
        title: '¿Cuándo se duplica?',
        intro: 'Hay un truco para saber de cabeza cuánto tarda tu dinero en duplicarse: **72 ÷ rentabilidad**.',
        widget: { kind: 'doubling', amount: 1000, rate: 6, maxRate: 24 },
        predict: {
          prompt: 'Al 6 % al año, ¿en cuántos años se duplican 1.000 €?',
          options: ['En 6 años', 'En unos 12 años', 'En unos 20 años'],
          answer: 1,
          why: '72 ÷ 6 = **12 años**. El cálculo exacto da 11,9: la regla del 72 casi acierta.',
        },
        goal: { text: 'Encuentra la rentabilidad que duplica tu dinero en unos 8 años.', when: [when('rate', '==', 9)] },
        insight: '**72 ÷ rentabilidad = años para duplicar.** Y al revés: 72 ÷ años = la rentabilidad que necesitas.',
        lumi: [
          { when: when('rate', '>=', 18), say: 'Esto también vale para las deudas: una tarjeta al 24 % duplica lo que debes en 3 años.', mood: 'WORRIED' },
          { when: when('rate', '<=', 2), say: 'Al 2 %, ¡36 años para duplicar! Es justo lo que suele subir la inflación…', mood: 'THINKING' },
          { say: 'Mueve la rentabilidad y mira cómo crece la torre de billetes', mood: 'HAPPY' },
        ],
      }),
      story('Una oferta increíble', [{ id: 'nico', name: 'Nico' }], [
        say('nico', 'He encontrado un fondo que **duplica tu dinero en 2 años** y sin riesgo. ¿Te apuntas? Solo quedan plazas hoy.'),
        choose('Usa la regla del 72. ¿Qué piensas?', [
          opt('¡Me apunto! Suena genial', 'bad', say('lumi', 'Duplicar en 2 años es un **36 % al año** (72 ÷ 2). Nadie puede garantizar eso «sin riesgo»: tiene toda la pinta de estafa.')),
          opt('72 ÷ 2 = un 36 % al año sin riesgo: imposible. Huele a estafa', 'good', say('lumi', '¡Perfecto! Un 36 % anual garantizado no existe. Y las prisas («solo hoy») son otra señal clásica de estafa.')),
          opt('Le pido que me lo explique y me apunto con la mitad', 'ok', say('lumi', 'Mejor no arriesgar ni la mitad: un 36 % al año «sin riesgo» es imposible. Compruébalo antes en la web de la CNMV.')),
        ]),
        say('lumi', 'La regla del 72 es tu detector de cuentos: si la rentabilidad prometida es enorme y «segura», desconfía.'),
      ]),
    ], [
      timed(fill('Según la regla del 72, al 6 % anual el dinero se duplica en unos ____ años.', '12', ['6', '20', '72'], '72 ÷ 6 = 12 años.'), 15),
      num('Al 9 % anual, ¿en cuántos años se duplica el dinero según la regla del 72?', 8, 'años', '72 ÷ 9 = 8 años.'),
      timed(single('Rápido: al 4 %, ¿cuántos años para duplicar?', ['9', '18', '28'], 1, '72 ÷ 4 = 18 años.'), 12),
      match('Empareja cada rentabilidad con los años para duplicar.', [['3 %', '24 años'], ['6 %', '12 años'], ['8 %', '9 años'], ['12 %', '6 años']], 'Siempre 72 ÷ rentabilidad.'),
      scenario('Un fondo te promete duplicar tu dinero en 2 años «sin riesgo». ¿Qué piensas?', [['Genial, firmo ya', 'Duplicar en 2 años exige un 36 % anual (72 ÷ 2). Nadie lo da sin riesgo: es una señal típica de estafa.'], ['Pido detalles y desconfío', 'Bien: un 36 % anual «sin riesgo» no existe. Más adelante verás cómo comprobar si una entidad está registrada en la CNMV.'], ['Lo comento con mi familia para que inviertan también', 'Antes de arrastrar a nadie, haz la cuenta: 72 ÷ 2 = 36 % anual. Demasiado bueno para ser verdad.']], 1, 'La regla del 72 también sirve para detectar promesas imposibles.'),
      num('Una tarjeta revolving cobra un 24 % anual. ¿En cuántos años se duplica la deuda si no pagas?', 3, 'años', '72 ÷ 24 = 3 años. El interés compuesto también trabaja para tu acreedor.'),
      tf('La regla del 72 también sirve para la inflación: al 3 %, los precios se duplican en unos 24 años.', true, '72 ÷ 3 = 24 años.'),
      buckets('Para duplicar tu dinero en menos de 10 años, ¿qué rentabilidad necesitas?', ['Basta', 'No basta'], [['5 % anual', 1], ['8 % anual', 0], ['10 % anual', 0], ['3 % anual', 1]], 'Menos de 10 años exige más de un 7,2 % anual (72 ÷ 10).'),
      chat(['Mi fondo da un 7 % pero cobra un 2 % de comisión al año.', 'Eso es poco, ¿no?'], '¿Qué le contestas?', [['Sí, un 2 % no es nada', 'Con comisión te queda un 5 %: duplicas en ~14 años en vez de ~10. Cuatro años de diferencia.'], ['Ojo: te quita casi un tercio de la rentabilidad y tardas bastante más en duplicar', '¡Exacto! 72 ÷ 7 ≈ 10 años frente a 72 ÷ 5 ≈ 14 años.'], ['Lo importante es que el fondo sea famoso', 'Que sea conocido no reduce lo que te cuesta cada año.']], 1, 'Las comisiones también se componen: un 2 % anual pesa muchísimo a largo plazo.'),
    ], { source: '1.3', minutes: 6, retire: [2, 4, 8] }),
  ],
})
