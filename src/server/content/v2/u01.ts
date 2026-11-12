import 'server-only'
// Sección 1 · Unidad 1 · El dinero y la inflación (docs/curso-v2/02-curriculo.md)
// Unidad de referencia del curso v2: teoría corta (≤3 pantallas) y 8-12 ejercicios de al menos 3 tipos.
import { buckets, chat, choose, fill, key, lesson, match, multi, note, num, opt, play, say, scenario, single, spot, story, tf, timed, unit, when } from '../dsl'

export default unit({
  id: 'u1', order: 1, title: 'El dinero y la inflación', description: 'Por qué el dinero quieto pierde valor y cuánto tiene que ganar tu inversión para protegerte',
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
        say('lumi', 'Y si Pablo invierte esos 300 €, el interés compuesto agranda aún más la diferencia.'),
        say('lumi', 'Ganar mucho no es lo mismo que **tener** mucho. Mira lo que tiene Pablo.'),
      ]),
      play({
        title: '¿Cuánto tiene de verdad?',
        intro: 'Pablo ya invierte una parte de lo que aparta. Esto es lo que tiene y lo que debe: ¿**suma** o **resta**?',
        widget: {
          kind: 'sort', sumLabel: 'Patrimonio de Pablo',
          bins: [{ label: 'Lo que tiene', sign: 1 }, { label: 'Lo que debe', sign: -1 }],
          cards: [
            { icon: 'bank', label: 'Su colchón en la cuenta', value: 3000, bin: 0, why: 'Es suyo y lo tiene disponible: suma.' },
            { icon: 'chart', label: 'Su ETF indexado (lo que vale hoy)', value: 2500, bin: 0, why: 'Lo invertido cuenta por lo que vale hoy: si el ETF sube, su patrimonio sube.' },
            { icon: 'car', label: 'Su coche (lo que vale hoy)', value: 6000, bin: 0, why: 'Suma por lo que vale hoy, no por lo que costó, y cada año vale menos.' },
            { icon: 'document', label: 'Lo que queda del préstamo del coche', value: 4000, bin: 1, why: 'Una deuda resta: el coche todavía no es del todo suyo.' },
            { icon: 'card', label: 'Lo pendiente de la tarjeta', value: 300, bin: 1, why: 'Lo que debes de la tarjeta resta, aunque no lo veas.' },
          ],
        },
        goal: { text: 'Coloca todo y descubre el patrimonio de Pablo.', when: [when('done', '==', 5)] },
        insight: '**Patrimonio = lo que tienes − lo que debes.** Es tu marcador de verdad: lo invertido puede crecer con los años, el coche pierde valor y las deudas restan.',
        lumi: [
          { when: when('wrong', '>=', 2), say: 'Ojo con las deudas: aunque no las veas, restan.', mood: 'THINKING' },
          { when: when('done', '>=', 3), say: '¡Vas bien! Mira cómo cambia la cuenta de abajo.', mood: 'HAPPY' },
          { say: 'Toca **suma** o **resta** para cada cosa', mood: 'HAPPY' },
        ],
      }),
      key('Tu marcador de verdad', 'Tu **sueldo** dice cuánto entra cada mes; tu **patrimonio**, cuánto tienes. Para hacerlo crecer hay dos palancas:\n\n• **Apartar la diferencia** entre lo que entra y lo que sale.\n• **Invertirla**, para que trabaje por ti.\n\nLo que lo frena: gastarte cada aumento de sueldo, las deudas caras y el dinero quieto, que con la inflación vale cada año un poco menos.', 'Riqueza es patrimonio, no sueldo: lo que tienes menos lo que debes.', 'Pruébalo: abre Cartera y mira cuánto vale hoy todo tu dinero virtual.'),
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
      scenario('Te suben el sueldo 200 € al mes. Ya tienes colchón y ninguna deuda cara. ¿Qué hará crecer más tu patrimonio dentro de 10 años?', [['Invertir una parte cada mes, de forma automática', 'Lo apartas antes de verlo y lo inviertes: el interés compuesto trabaja para ti durante 10 años.'], ['Cambiar de coche, ahora que puedes pagar una cuota mayor', 'El aumento se va en cuotas y en un coche que pierde valor cada año: tu patrimonio apenas se mueve.'], ['Dejarlo en la cuenta corriente y ya decidirás', 'Sin plan, el dinero acaba gastándose, y el que se queda pierde poder de compra.']], 0, 'El patrimonio crece apartando la diferencia e invirtiéndola. Cambiar de coche tienta, pero convierte el aumento en una deuda sobre algo que pierde valor.'),
      chat(['Me he comprado un coche de 25.000 € a plazos.', 'Ya tengo 25.000 € de patrimonio, ¿no?'], 'Lumi se ha comprado un coche de 25.000 € a plazos y cree que ya tiene 25.000 € de patrimonio. ¿Qué le contestas?', [['Sí: el coche vale 25.000 €', 'Falta restar lo que debes del préstamo, y el coche vale menos cada año.'], ['Depende de lo que aún debes y de lo que vale hoy', '¡Eso! Patrimonio es lo que tienes menos lo que debes, a precio de hoy.'], ['El patrimonio es lo que cobras cada mes, así que no cambia', 'Eso es tu renta: el patrimonio es lo que acumulas.']], 1, 'El coche suma por lo que vale hoy, no por lo que costó, y el préstamo resta. Lo tentador es contar el precio de compra, pero la deuda y el desgaste se lo comen.'),
    ], { source: '1.1', minutes: 6, retire: [1, 2, 5, 7, 8] }),

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
        insight: '**El dinero quieto encoge**: al 3 %, en 20 años compra poco más de la mitad. Por eso lo que no necesitas en años tiene que rendir más que la inflación.',
        lumi: [
          { when: when('itemsPct', '<', 35), say: '¡Uf! Con eso no llenas ni un tercio de la cesta. Así se vive una inflación alta.', mood: 'WORRIED' },
          { when: when('itemsPct', '<=', 60), say: '¿Lo ves? Los billetes son los mismos 50 €, pero compran mucho menos.', mood: 'THINKING' },
          { when: when('years', '>', 0), say: 'Ahora sube la inflación: ¿qué pasa con un 7 %?', mood: 'HAPPY' },
          { say: 'Arrastra los años y mira qué pasa con tu cesta', mood: 'HAPPY' },
        ],
      }),
      key('Por qué suben los precios', 'Suben cuando hay más dinero o más demanda que cosas que comprar, o cuando producir cuesta más (la energía en 2022). En España la mide el INE con el **IPC**: en 2025 fue del 2,7 % de media.\n\nEl BCE intenta que ronde el **2 %** subiendo o bajando los tipos de interés.', 'Con inflación, el dinero quieto compra cada año un poco menos.', 'Pruébalo: en Mercado, mira si el S&P 500 ha subido más que la inflación.'),
    ], [
      num('Con una inflación del 3 % durante 20 años, ¿cuánto podrán comprar 1.000 € en euros de hoy? (redondea)', 554, '€', '1.000 ÷ 1,03²⁰ ≈ 554 €. Cada año los precios suben y el mismo dinero compra menos.', 2),
      tf('El objetivo de inflación del BCE es el 0 %.', false, 'Es el 2 % a medio plazo. Por eso el dinero parado pierde valor incluso en años normales.'),
      fill('Con la regla del 70, una inflación del 2 % reduce a la mitad el poder de compra en unos ____ años.', '35', ['10', '70', '20'], '70 ÷ 2 = 35 años.'),
      multi('¿Qué puede hacer subir los precios? Marca todas las que correspondan.', ['Que se encarezca la energía', 'Que la gente ahorre más y gaste menos', 'Que el banco central suba mucho los tipos', 'Que se cree mucho dinero muy deprisa'], [0, 3], 'Crear mucho dinero deprisa o que se encarezca la energía empuja los precios, igual que una demanda mayor que la oferta. Subir los tipos o gastar menos los frena.'),
      match('Empareja cada situación con su efecto en los precios.', [['La energía se dispara', 'Suben los costes de producir'], ['Todos quieren comprar a la vez', 'Sube la demanda'], ['El BCE sube los tipos', 'Se frena el crédito y la demanda']], 'Inflación de costes, inflación de demanda y la herramienta del BCE para frenarlas.'),
      scenario('Es 2022: la inflación en España llega al 8 % y tu cuenta paga un 0 %. Tienes 10.000 € que no necesitas en 10 años. ¿Qué haces?', [['Nada: en el banco está seguro y no puede perder valor', 'Tus 10.000 € compran un 8 % menos en un año: unos 800 € de poder de compra perdidos.'], ['Busco opciones que puedan batir a la inflación', 'Bien: a 10 años, dejarlo quieto es la forma más segura de perder poder de compra.'], ['Lo gasto todo antes de que valga menos', 'Gastar por miedo no protege tu futuro: solo cambia ahorro por consumo.']], 1, 'El dinero parado no está a salvo de la inflación. Para lo que no necesitas en años, conviene que trabaje.'),
      timed(single('Rápido: inflación del 7 %. ¿En cuántos años tu dinero compra la mitad (regla del 70)?', ['5 años', '10 años', '20 años'], 1, '70 ÷ 7 = 10 años.'), 15),
      buckets('A 20 años, ¿esto suele proteger tu dinero de la inflación?', ['Suele protegerlo', 'No lo protege'], [['Billetes en un cajón', 1], ['Una cuenta al 0 %', 1], ['Un ETF de acciones de todo el mundo', 0], ['Un depósito al 1 % con la inflación al 3 %', 1], ['Un fondo indexado al S&P 500', 0]], 'Cuando todo sube, las empresas también suben sus precios: por eso, a largo plazo, las acciones diversificadas han solido ganar a la inflación, con años malos por el camino. El dinero quieto, o que rinde menos que los precios, pierde poder de compra aunque el saldo no baje.'),
      scenario('Sale la noticia: la inflación sube más de lo esperado y se habla de que el BCE subirá los tipos. Tu ETF mundial baja un poco ese día. Inviertes para dentro de 20 años. ¿Qué haces?', [['Sigo con mis aportaciones como siempre', 'Un titular mueve el precio unos días; a 20 años, lo que cuenta es seguir invirtiendo.'], ['Vendo todo y vuelvo a entrar cuando baje la inflación', 'Nadie sabe cuándo pasará, y fuera del mercado tu dinero vuelve a perder frente a los precios.'], ['Lo paso todo a la cuenta corriente', 'Justo con inflación alta, el dinero quieto es el que más pierde.']], 0, 'Con inflación alta, el dinero quieto pierde más que nunca. Vender por un titular tienta, pero cambia tu plan a 20 años por un susto de un día.'),
    ], { source: '1.1', minutes: 6, retire: [0, 2, 6] }),

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
      key('Cómo se mide y por qué lo mira la bolsa', 'Cada mes, el INE anota los precios de una **cesta** de cientos de productos y servicios. El **IPC** es lo que ha cambiado esa cesta respecto al mismo mes del año anterior; cada cosa pesa según lo que gastan de media los hogares.\n\nLos inversores lo esperan con lupa: si sale más alto de lo previsto, se espera que el banco central suba los tipos, y eso suele mover la bolsa ese mismo día.', 'El IPC es la media de todos: tu inflación depende de en qué gastas tú.', 'Pruébalo: el día del IPC, mira en Mercado cómo se mueve el S&P 500.'),
    ], [
      single('¿Qué mide el IPC?', ['El precio de las acciones', 'Cuánto cambian los precios de consumo', 'Lo que gana de media un hogar español al año'], 1, 'Es un índice de precios de consumo: compara la misma cesta en el tiempo.'),
      buckets('¿Entra en la inflación subyacente?', ['Sí, cuenta', 'No, se excluye'], [['La electricidad', 1], ['Una camiseta', 0], ['La fruta fresca', 1], ['Un corte de pelo', 0], ['La gasolina', 1]], 'La subyacente quita la energía y los alimentos no elaborados porque son los más volátiles.'),
      tf('Tu inflación personal puede ser distinta a la oficial.', true, 'El IPC pondera según el gasto medio; tu cesta tiene otro peso en cada cosa.'),
      scenario('Alquilas, vas en coche a todas partes y la gasolina y los alquileres han subido más que el resto. El IPC oficial es del 3 %. ¿Qué es más probable?', [['Mi inflación es justo del 3 %', 'Solo si tu cesta se parece a la media, y la tuya no.'], ['Mi inflación personal es mayor del 3 %', 'Sí: gastas más en lo que más ha subido.'], ['Mi inflación es 0 %', 'Los precios que pagas sí han subido.']], 1, 'Si gastas más en lo que más sube, tu inflación personal supera a la media.'),
      fill('Si un mes la luz se dispara, el IPC general sube mucho, pero la inflación ____ apenas se mueve.', 'subyacente', ['general', 'personal', 'negativa'], 'La subyacente excluye la energía para ver la tendencia de fondo.'),
      num('Una cesta costaba 200 € hace un año y hoy cuesta 206 €. ¿Cuál ha sido la inflación de esa cesta?', 3, '%', '(206 − 200) ÷ 200 = 0,03 → 3 %.'),
      match('Empareja cada perfil con la parte de la cesta que más le afecta.', [['Joven que alquila en Madrid', 'Vivienda'], ['Repartidor con furgoneta', 'Carburantes'], ['Familia con tres hijos', 'Alimentación']], 'Cada hogar tiene su cesta: por eso la inflación personal varía.'),
      timed(tf('La inflación subyacente incluye la energía.', false, 'La quita precisamente porque es muy volátil.'), 10),
      multi('¿Qué es cierto sobre el IPC? Marca todas.', ['Lo publica el Banco de España cada año', 'Compara precios con el mismo mes del año anterior', 'Mide cuánto suben los sueldos', 'Cada producto pesa según el gasto medio de los hogares'], [1, 3], 'El IPC compara precios con el mismo mes del año anterior y pondera cada producto según el gasto medio de los hogares. Lo publica el INE cada mes, y no mide sueldos.'),
      scenario('Alquilas en una ciudad cara y tu inflación personal es del 5 %, aunque el IPC oficial sea del 3 %. Inviertes para dentro de 20 años. ¿Qué te dice esto?', [['Que tengo que batir mi propia inflación', 'Exacto: tu listón es tu inflación, no la media. Lo que rinde poco pierde frente a tus precios.'], ['Nada: lo único que cuenta es el IPC oficial', 'El IPC es la media; lo que pagas tú depende de tu cesta.'], ['Que no merece la pena invertir si los precios suben tanto', 'Justo al revés: con precios subiendo, el dinero quieto es el que más pierde.']], 0, 'Tu inflación personal es el listón que tiene que superar tu dinero. Lo tentador es mirar solo la cifra oficial, pero tu cesta puede subir más que la media.'),
    ], { source: '1.1', minutes: 6, retire: [1, 3, 5, 7] }),

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
        say('lumi', 'Ojo: el Fondo de Garantía de Depósitos protege hasta **100.000 €** si quiebra el banco.'),
        say('lumi', 'Protege tus euros, no tu poder de compra.'),
        say('lumi', 'Pruébalo: en el simulador, pon a trabajar 1.000 € virtuales en un ETF mundial.'),
      ]),
    ], [
      num('Tu cuenta paga un 1,5 % y la inflación es del 2,7 %. ¿Cuál es tu rentabilidad real aproximada?', -1.2, '%', 'Real ≈ 1,5 − 2,7 = −1,2 %. Ganas euros, pero pierdes poder de compra.', 5),
      tf('Si tu cuenta paga un 3 % y la inflación es del 2 %, ganas poder de compra.', true, 'Rentabilidad real ≈ 3 − 2 = +1 %.'),
      buckets('Inflación del 2,5 %. ¿Ganas o pierdes poder de compra?', ['Ganas', 'Pierdes'], [['Cuenta al 0 %', 1], ['Depósito al 3 %', 0], ['Dinero en un cajón', 1], ['Letra del Tesoro al 2 %', 1], ['Algo que rinde un 5 %', 0]], 'Solo ganas si rindes más que la inflación.'),
      single('¿Qué protege el Fondo de Garantía de Depósitos?', ['Tu poder de compra frente a la inflación', 'Hasta 100.000 € por persona y banco', 'Tus inversiones en bolsa'], 1, 'Protege los euros depositados si quiebra el banco, no frente a la inflación ni frente a caídas de la bolsa.'),
      scenario('Tienes 20.000 € en una cuenta al 0 % y no los necesitarás en 15 años. Un amigo dice: «Así no pierdes nada». ¿Qué le dices?', [['Tiene razón: el saldo no baja', 'El saldo no baja, pero con un 2,5 % de inflación esos 20.000 € comprarán como unos 13.800 € de hoy en 15 años.'], ['Que pierdo poder de compra cada año', 'Exacto: no pierdes euros, pierdes lo que puedes comprar con ellos.'], ['Que debería meterlo todo en una sola acción', 'Eso es pasar de un extremo a otro: más adelante verás por qué diversificar.']], 1, 'Dinero quieto durante años = poder de compra perdido.'),
      fill('Rentabilidad real ≈ rentabilidad nominal − ____.', 'inflación', ['comisiones', 'impuestos', 'dividendos'], 'Es la forma rápida de saber si tu dinero gana o pierde poder de compra.'),
      timed(single('Rápido: rinde un 4 % e inflación del 3 %. ¿Rentabilidad real?', ['+7 %', '+1 %', '−1 %'], 1, '4 − 3 = +1 %.'), 12),
      chat(['Tengo 5.000 € en la cuenta corriente desde hace años.', 'Total, ahí están seguros, ¿no?'], '¿Qué le contestas?', [['Sí, ahí no pasa nada', 'Los euros están, pero cada año compran un poco menos.'], ['Seguros sí, pero la inflación se come su valor poco a poco', '¡Bien visto! Lo que no necesites pronto puede trabajar para ganarle a la inflación.'], ['Mejor sácalos en efectivo', 'En un cajón pierden igual con la inflación y además se pueden perder o robar.']], 1, 'Seguridad nominal no es protección real.'),
      tf('Un depósito garantizado nunca puede hacerte perder poder de compra.', false, 'Si rinde menos que la inflación, sí lo pierdes, aunque el saldo no baje.'),
      scenario('Tienes 6.000 €: 3.000 € son tu colchón y los otros 3.000 € no los tocarás en 15 años. ¿Cómo lo organizas?', [['El colchón, a mano; el resto, invertido a largo plazo', 'El colchón sigue a mano y lo de largo plazo trabaja para ganarle a la inflación.'], ['Todo en la cuenta al 0 %: así está seguro y lo tengo siempre a mano', 'Los 3.000 € de largo plazo pierden poder de compra durante 15 años.'], ['Todo en el ETF, colchón incluido', 'Si llega un imprevisto en plena caída, tendrás que vender con pérdidas.']], 0, 'Cada euro según su plazo: lo que puedes necesitar mañana, disponible y sin riesgo; lo que no tocarás en años, invertido. Meterlo todo en el ETF tienta, pero te deja sin colchón.'),
      chat(['Mi banco me da un 2 % y la inflación está en el 2,7 %.', 'Por lo menos gano algo, ¿no?'], 'El banco de Lumi le da un 2 % con la inflación en el 2,7 %, y ella cree que por lo menos gana algo. ¿Qué le contestas?', [['Sí: un 2 % es ganar', 'Ganas euros, pero los precios suben más deprisa que tu saldo.'], ['Ganas euros, pero pierdes poder de compra', '¡Eso! Rinde menos que la inflación: lo que no necesites pronto puede buscar más.'], ['Mejor sácalo y gástalo antes de que valga menos', 'Gastar por miedo no protege tu futuro: solo cambia ahorro por consumo.']], 1, 'Si tu dinero rinde menos que la inflación, tu rentabilidad real es negativa aunque el saldo suba. Lo tentador es mirar solo el 2 %, pero lo que importa es lo que puedes comprar con él.'),
    ], { source: '1.1', minutes: 6, retire: [0, 4, 6, 7, 8] }),

    lesson('u1l6', 'La regla del 72', [
      story('Una oferta increíble', [{ id: 'nico', name: 'Nico' }], [
        say('nico', 'He encontrado un fondo que **duplica tu dinero en 2 años** y sin riesgo.'),
        say('nico', '¿Te apuntas? Solo quedan plazas hoy.'),
        choose('¿Qué piensas?', [
          opt('¡Me apunto! Suena genial', 'bad', say('lumi', 'Duplicar en 2 años exige un **36 % al año**. Nadie lo da sin riesgo.')),
          opt('Duplicar en 2 años sin riesgo es imposible: huele a estafa', 'good', say('lumi', '¡Bien visto! Y las prisas («solo hoy») son otra señal clásica de estafa.')),
          opt('Le pido que me lo explique y me apunto con la mitad', 'ok', say('lumi', 'Ni la mitad: compruébalo antes en la web de la CNMV.')),
        ]),
        say('lumi', 'Hay un truco para pillar estas promesas en segundos: la **regla del 72**.'),
      ]),
      play({
        title: '¿Cuándo se duplica?',
        intro: '**72 ÷ rentabilidad** = los años que tarda tu inversión en duplicarse. Mueve la rentabilidad y compruébalo.',
        widget: { kind: 'doubling', amount: 1000, rate: 6, maxRate: 24 },
        predict: {
          prompt: 'Al 6 % al año, ¿en cuántos años se duplican 1.000 €?',
          options: ['En 6 años', 'En unos 12 años', 'En unos 20 años'],
          answer: 1,
          why: '72 ÷ 6 = **12 años**. El cálculo exacto da 11,9: la regla del 72 casi acierta.',
        },
        goal: { text: 'Encuentra la rentabilidad que duplica tu dinero en unos 8 años.', when: [when('rate', '==', 9)] },
        insight: '**72 ÷ rentabilidad = años para duplicar**: te dice cuánto pesa una comisión, una deuda o una promesa imposible. Pruébalo: en Mercado, abre el S&P 500 en velas mensuales y busca cuándo se duplicó.',
        lumi: [
          { when: when('rate', '>=', 18), say: 'Esto también vale para las deudas: una tarjeta al 24 % duplica lo que debes en 3 años.', mood: 'WORRIED' },
          { when: when('rate', '<=', 2), say: 'Al 2 %, ¡36 años para duplicar! Es justo lo que suele subir la inflación…', mood: 'THINKING' },
          { say: 'Mueve la rentabilidad y mira cómo crece la torre de billetes', mood: 'HAPPY' },
        ],
      }),
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
      scenario('Dos fondos copian el mismo índice mundial. Uno cobra un 0,2 % al año y el otro, un 2 %. Vas a invertir durante 30 años. ¿Cuál eliges?', [['El del 0,2 %', 'Te quedas casi toda la rentabilidad: tu dinero se duplica bastante antes.'], ['El del 2 %: si cobra más, será mejor', 'Copian el mismo índice: lo único que cambia es lo que te quitan cada año.'], ['Da igual: la diferencia es muy pequeña', 'Un 2 % al año retrasa varios años cada duplicación, y en 30 años eso pesa muchísimo.']], 0, 'Con el mismo índice, la comisión es lo único que cambia y resta de tu rentabilidad cada año: con menos rentabilidad, tu dinero tarda más en duplicarse. Pensar que lo caro es mejor tienta, pero aquí no compras nada extra.'),
      spot('Marca las promesas que la regla del 72 delata como imposibles.', [['Inversiones Top', 'Duplica tu dinero en 6 meses, garantizado y sin riesgo.', true], ['Tu banco', 'Depósito a 12 meses al 2 % TAE, cubierto por el Fondo de Garantía de Depósitos.', false], ['Grupo de Telegram', 'Un 3 % al mes asegurado. Plazas limitadas hasta esta noche.', true], ['Gestora de fondos', 'Fondo indexado mundial. Rentabilidades pasadas no garantizan rentabilidades futuras.', false]], 'Duplicar en 6 meses o ganar un 3 % al mes «asegurado» son rentabilidades enormes que nadie puede garantizar: la regla del 72 lo delata en segundos. Lo legal te explica el riesgo y no te mete prisa.'),
      chat(['Tengo una tarjeta al 24 % y 1.000 € para invertir.', '¿Invierto o pago la tarjeta?'], 'Lumi tiene una tarjeta al 24 % y 1.000 €: duda entre invertirlos o pagar la tarjeta. ¿Qué le contestas?', [['Invierte: la bolsa sube a largo plazo', 'Al 24 %, tu deuda se duplica en unos 3 años: ninguna inversión te garantiza eso.'], ['Paga primero la tarjeta', '¡Eso! Quitarte un 24 % es ganar un 24 % seguro.'], ['Haz las dos cosas a medias', 'Mejor que nada, pero dejas viva una deuda que crece muy deprisa.']], 1, 'La regla del 72 también vale para lo que debes: al 24 %, la deuda se duplica en unos 3 años. Invertir tienta, pero ninguna inversión te garantiza ganar a ese ritmo.'),
    ], { source: '1.3', minutes: 6, retire: [0, 1, 2, 4, 5, 8] }),
  ],
})
