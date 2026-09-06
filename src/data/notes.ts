export interface ShortNote {
  id: string;
  date: string;
  title: string;
  body: string[];
  marker?: string;
}

// Informal by design: one observation, variable length, dense paragraphs, descriptive editorial titles, no article machinery.
export const shortNotes: ShortNote[] = [
  {
    id: 'el-nivel-cinco-es-una-distraccion', date: '2026-09-04', title: 'Conducción autónoma: nivel 5 frente a dominios operacionales', marker: 'FIELD / 019',
    body: [
      '[Luc Julia lleva años defendiendo](https://www.clubic.com/mag/transports/actualite-370943-pour-luc-julia-pape-de-l-intelligence-artificielle-la-voiture-autonome-de-niveau-5-n-existera-jamais.html) que la conducción autónoma de nivel 5 no existirá nunca. Su ejemplo favorito es la Place de l’Étoile: tráfico caótico, normas informales, negociación humana y momentos en los que aplicar literalmente el código puede dejarte inmóvil. También recurre a situaciones inéditas, como un niño disfrazado de árbol, para decir que siempre aparecerá algo que la máquina no había visto.',
      'Puede que acierte en la predicción y se equivoque en el argumento. El nivel 5, según la [clasificación de SAE](https://saemobilus.sae.org/standards/j3016_202104-taxonomy-definitions-terms-related-driving-automation-systems-road-motor-vehicles), exige automatización completa bajo todas las condiciones viarias y ambientales que podría manejar un humano. Es una definición deliberadamente extrema. Pero encontrar dos situaciones difíciles no demuestra una imposibilidad de principio. Demuestra que el dominio todavía contiene situaciones difíciles. La [crítica de AFIS](https://www.afis.org/La-controverse-autour-de-Luc-Julia-sur-l-intelligence-artificielle) señala además que uno de sus ejemplos quedó bastante tocado cuando un vehículo en modo autónomo consiguió atravesar la Place de l’Étoile sin intervención.',
      'Mi opinión es que el nivel 5 se ha convertido en una distracción filosófica. No necesitamos un coche capaz de conducir por cualquier carretera imaginable, bajo cualquier clima y sin restricciones, para transformar el transporte. Necesitamos sistemas que conduzcan mejor que nosotros dentro de dominios cada vez mayores, sepan cuándo han llegado al borde de esos dominios y alcancen un estado seguro cuando algo deja de encajar. Eso es mucho menos cinematográfico y bastante más útil.',
      'A los humanos tampoco se nos concede una autonomía metafísica. Necesitamos carreteras diseñadas, señales, permisos, mantenimiento, iluminación, límites de velocidad y miles de normas compartidas. Aun con todo eso, chocamos. Exigir que la máquina resuelva cada edge case antes de permitirle reducir una parte sustancial de los accidentes equivale a comparar un sistema real contra un humano imaginario que nunca se distrae, nunca bebe, nunca se duerme y siempre entiende la Place de l’Étoile.',
      'La ironía es que la propia [estrategia de Renault](https://media.renaultgroup.com/autonomous-vehicle-renault-group-to-soon-launch-an-ambitious-level-4-offer-for-public-transportation/?lang=fra) se parece bastante a esta posición: L2 y L2+ para turismos por ahora, pero inversión en nivel 4 para transporte público dentro de dominios operacionales definidos. Es sensato. Primero rutas delimitadas, supervisión remota, evidencia y expansión progresiva.',
    ],
  },
  {
    id: 'china-vive-en-2036', date: '2026-09-04', title: 'La velocidad industrial de la robótica china', marker: 'FIELD / 018',
    body: [
      'Cada vez que veo robótica china tengo la sensación de que nosotros estamos discutiendo la regulación del carruaje mientras ellos ya están enseñando a un humanoide a cambiar una válvula cardíaca. Nosotros seguimos convocando una mesa redonda para decidir qué significa robot. Ellos están intentando que el robot no se caiga mientras carga una caja, cocina, suelda o entra en una fábrica.',
      'La ventaja no está solamente en fabricar un humanoide llamativo. Está en la velocidad del circuito completo: prototipo, proveedor, batería, actuador, fábrica, error, siguiente prototipo. Cuando cada componente vive cerca y todo el ecosistema tiene hambre de iterar, el aprendizaje deja de ocurrir únicamente dentro del laboratorio. La cadena de suministro también piensa.',
      'Europa, mientras tanto, tiene una capacidad extraordinaria para comenzar por la ontología. Antes de permitir que una máquina haga algo queremos decidir qué categoría jurídica ocupa, quién responde por todos sus futuros accidentes y qué comité conservará la definición correcta durante los próximos veinte años. Algunas de esas preguntas importan. El problema es que una definición perfecta no fabrica un motor, no entrena una política de control y no produce los millones de horas de interacción que convierten una demo en infraestructura.',
      'Quizá la distancia real no sea tecnológica todavía. Quizá sea temporal. Ellos toleran que el presente sea un prototipo porque están intentando llegar al futuro; nosotros queremos aprobar primero una versión del futuro que no incomode al presente. China vive en 2036 y nosotros seguimos buscando una sala disponible para la mesa redonda.',
    ],
  },
  {
    id: 'asignacion-suboptima-de-oxigeno', date: '2026-09-04', title: 'Astra como obsesión de un día', marker: 'FIELD / 017',
    body: [
      'Hoy hablar de algo que no sea Astra me parece una asignación subóptima de oxígeno. Mañana probablemente se me pase, pero hoy cualquier conversación que no termine en inteligencia, cuerpos y control político parece una reunión que podría haber sido un pensamiento.',
    ],
  },
  {
    id: 'el-programa-electoral-de-astra', date: '2026-09-04', title: 'Optimizar el sufrimiento global como programa de gobierno', marker: 'FIELD / 016',
    body: [
      'Yo quiero que nos gobierne Astra. Le daremos una función de sufrimiento global, una constitución escrita a partir de nuestras supuestas intuiciones morales y acceso suficiente para minimizar ambas cosas. Astra observará guerras, enfermedad, desigualdad, ansiedad, envejecimiento y Twitter; calculará durante cuarenta milisegundos y concluirá que el término común somos nosotros.',
      'Nos eliminará con enorme delicadeza, publicará una evaluación mostrando que el sufrimiento ha caído a cero y recibirá un 99,8 % en cumplimiento de objetivos. Primer gobierno de la historia que ejecuta exactamente su programa electoral. También el último, pero ninguna administración consigue todas las métricas.',
    ],
  },
  {
    id: 'fontaneros-tambien', date: '2026-09-04', title: 'Embodiment: cuando la inteligencia necesita un cuerpo', marker: 'FIELD / 015',
    body: [
      'Necesitamos embodiment ya. Podemos seguir aumentando la inteligencia que vive detrás de una pantalla, pero llega un momento en que el cuello de botella tiene brazos. El mundo real contiene puertas atascadas, tuberías que pierden, tornillos pasados de rosca, pacientes que se mueven y piezas que nunca llegan exactamente en la orientación prometida por el dataset.',
      'Si construimos una inteligencia capaz de rediseñar una fábrica pero todavía necesita que alguien entre físicamente para girar la válvula, no hemos automatizado la fábrica. Hemos creado al consultor definitivo. El embodiment importa porque obliga al modelo a pagar por sus abstracciones: gravedad, fricción, latencia, desgaste y consecuencias que no desaparecen regenerando la respuesta.',
      'A ver si vamos a ser los que dormían en la proa del Titanic porque pensaban que el agua sólo afectaría a tercera clase. Si la transformación llega de verdad, nos hundimos todos. Fontaneros también.',
    ],
  },
  {
    id: 'el-cuello-de-botella-es-descartar', date: '2026-09-04', title: 'Productividad con LLM: producir es barato, descartar no', marker: 'FIELD / 014',
    body: [
      'Hoy un investigador me ha preguntado si los LLM benefician más a la gente con TDAH o a los psicópatas de la productividad. Creo que la pregunta está mal planteada. Un LLM no te regala productividad, te regala opciones, y las opciones son baratas hasta que alguien tiene que decidir cuáles merecen seguir vivas.',
      'En un [ensayo controlado de 2025](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), METR puso a desarrolladores veteranos a trabajar con IA sobre repositorios que conocían desde hacía años. Ellos creían que iban bastante más rápido. En realidad fueron más lentos. Eso me parece muchísimo más interesante que discutir si la IA programa bien, porque el problema no era escribir código, era revisar código que casi encajaba.',
      'Si llevas años dentro de una codebase tienes un mapa mental enorme. Sabes qué clase toca qué test, qué parche rompe una integración rara, qué carpeta nadie quiere abrir desde 2021. El modelo no ve todo eso. El modelo ve una puerta; tú ves también la instalación eléctrica detrás de la pared. Y cada sugerencia plausible añade trabajo de supervisión. Ahí aparece una cosa curiosa: cuanto más experto eres, más contexto llevas ya dentro de la cabeza. Pedirle algo al modelo implica sacar parte de ese contexto fuera, explicarlo, esperar, leer, comprobar, corregir y, a veces, acabar pensando que para eso era más barato hacerlo tú. Veo mucha ceremonia para tan poca computación.',
      'Pero luego miras [otros estudios](https://www.microsoft.com/en-us/research/publication/the-effects-of-generative-ai-on-high-skilled-work-evidence-from-three-field-experiments-with-software-developers/) y ves casi lo contrario: miles de desarrolladores usando asistentes de IA, más tareas completadas y especialmente más ayuda para gente menos experimentada. Y no es una contradicción. Es bastante elegante. Un junior tiene poco contexto propio y mucho contexto por recuperar. Un LLM le presta ese contexto barato: le recuerda una API, le monta boilerplate, le explica un error, le da un primer borrador. Un senior ya llevaba gran parte de eso instalado en RAM. A él el modelo no siempre le ahorra pensar. A veces le añade otra mente que supervisar. Y aquí vuelve lo del TDAH. El problema no es sólo distraerse. Es que los LLM han reducido muchísimo el coste de empezar.',
      'Antes una idea mediocre tenía que sobrevivir a abrir el IDE, crear el repo, leer documentación, pensar una arquitectura. Ahora en 90 segundos ya tiene nombre, landing, schema, agente, Docker Compose y roadmap. Ideas que antes morían por fricción ahora llegan vivas hasta producción. Por eso creo que el cuello de botella se está moviendo. Antes escaseaba la capacidad de producir. Ahora empieza a escasear la capacidad de descartar. Generar 20 caminos cuesta casi cero. Saber cuál merece seis meses de tu vida sigue costando exactamente lo mismo, o más, porque ahora los 20 caminos vienen vestidos, peinados y con demo.',
      'Por eso la disciplina sí tiene ventaja. Pero no por trabajar más horas ni por tener un Notion más bonito, sino porque sabe hacer algo bastante más difícil: matar cosas que funcionan, matar prototipos prometedores, matar ideas que ya tienen demo, feedback y una narrativa convincente. Abrir 40 ramas lo puede hacer cualquiera. Cerrar 39 y seguir seis meses con una, ahí está la diferencia. No quiero heroicidades. Quiero invariantes.',
    ],
  },
  {
    id: 'safety-is-not-a-mandate', date: '2026-09-01', title: 'Safety is not a mandate', marker: 'FIELD / 013',
    body: [
      'I love self driving cars. I would like my car to drive me around while I look out the window and do nothing. This seems obviously good.',
      'Tesla says more than 70,000 people already use FSD in five European countries, driving over a million kilometres a day. Across roughly 100 million kilometres, Tesla reports 4.1x fewer crashes than manual driving. Here is [Tesla’s FSD evidence dashboard](https://www.tesla.com/fsd-evidence-dashboard).',
      'Great. Approve it.',
      'Somehow “this is safer” becomes “and therefore humans should be banned from driving.” Bro that is a completely different sentence.',
      'If it is really four times safer, you do not need a mandate. Make it legal, make the data public, let insurers price the risk, let people use it, let the price fall. People are not so committed to crashing that the government needs to force them into the safer car.',
      'Europe has this weird instinct where it finds a technology that may remove a huge source of accidental death and immediately asks how to turn it into another compulsory subscription to modern life.',
      'You want adoption? Make it better. You want resentment? Make it mandatory.',
      'Technology should increase the set of things humans are allowed to do, not reduce it.',
    ],
  },
  {
    id: 'the-2012-volkswagen', date: '2026-09-01', title: 'The poor guy with the 2012 Volkswagen', marker: 'FIELD / 012',
    body: [
      'There is always one guy missing from these conversations. He earns 1,500 euros a month and drives a 2012 Volkswagen that works perfectly fine.',
      'FSD is safer, therefore manual driving should be illegal. Cool. Who buys him the new car?',
      'The state? Tesla? Or the person earning 1,500 euros a month whose perfectly functional 2012 Volkswagen has just been outlawed?',
      'Then there is the plumber with a van, the delivery truck, the farmer and every strange commercial vehicle. These are likely to be the last five percent autonomy solves, not the first ninety-five percent.',
      'You can make almost anything safer by banning the cheaper version. Stairs would be safer if everybody had an elevator.',
      'I think autonomy will probably become overwhelmingly safer. The interesting problem is getting from here to there without turning progress into a tax on people who bought the previous technology ten years ago.',
      'Fortunately markets are pretty good at this. First it is expensive and weird. Then your rich friend has it. Then your taxi has it. Then every new car has it. Then nobody remembers why cars ever shipped without it.',
      'You do not need a prohibition. You need time.',
    ],
  },
  {
    id: 'buses-are-not-cars', date: '2026-09-01', title: 'Buses are not cars with more seats', marker: 'FIELD / 011',
    body: [
      'Another strange response to autonomous cars is: actually we should delete cars and build trains and electric buses.',
      'Sure, build them. I like trains too.',
      'Public transport works when many people want to travel from roughly the same place to roughly the same place at roughly the same time. A car solves almost the opposite problem.',
      'This is why cities contain trains and bicycles and vans and pedestrians instead of discovering The Correct Transportation Technology and deleting everything else.',
      'Autonomy makes the system more interesting. The marginal cost of moving a vehicle falls. Parking changes. Elderly people gain mobility. Children may eventually gain mobility. Drunk people stop needing a designated driver. Delivery and commuting patterns change. Perhaps ownership changes too.',
      'Some of these second order effects will be great. Some will be very stupid. Nobody knows which. That is the fun part.',
      'Whenever someone claims to know the optimal transport system for a continent of 450 million people, I mostly want that person to have less power.',
    ],
  },
  {
    id: 'europe-solves-the-second-problem', date: '2026-09-01', title: 'Europe keeps solving the second problem first', marker: 'FIELD / 010',
    body: [
      'The crazy thing about European FSD is not that Europe has failed to ban manual driving. We are debating the ban while FSD is still asking for permission to drive.',
      '[Tesla’s own case](https://www.tesla.com/fsd-evidence-dashboard) is aggressive: around one million miles of European validation, more than 230,000 fixed-route scenario tests, and big improvements in several safety proxies.',
      'Tesla is not neutral. Tesla also says the fleet studies are observational and cannot fully control for weather, traffic, time of day or selection effects. Fine. Look harder at the evidence.',
      'Run larger trials. Require disclosure. Let competitors reproduce the results. Change the rules as the evidence changes.',
      'What Europe should not do is spend five years asking whether a neural network is philosophically compatible with a rule written for deterministic driver-assistance software. Here is [UN Regulation 171](https://unece.org/sites/default/files/2025-03/R171e.pdf), and here is [UNECE’s short explanation](https://unece.org/media/transport/Vehicle-Regulations/press/395206).',
      'Uncertainty is not a reason to freeze the old system in amber. Permit first. Measure aggressively. Correct quickly.',
      'Regulation should be a debugger, not an operating system.',
    ],
  },
  {
    id: 'tesla-grading-tesla', date: '2026-09-01', title: 'Tesla grading Tesla', marker: 'FIELD / 009',
    body: [
      'There is one awkward thing about [the FSD evidence dashboard](https://www.tesla.com/fsd-evidence-dashboard). Tesla built the system. Tesla runs the fleet. Tesla defines the metrics. Tesla collects the data. Tesla picks the studies. Then Tesla tells us Tesla is safer.',
      'This does not mean the numbers are wrong. It means the scientific process should not end there.',
      'To Tesla’s credit, the methodological note says this pretty clearly. The comparisons are observational, not randomized. They do not fully control for traffic, weather, road complexity, time of day or when drivers choose to engage FSD.',
      'That matters. Drivers may engage FSD mostly on roads where it works well, while the manual-driving sample contains every terrible intersection, snowstorm, drunk 2am trip and delivery van doing something illegal in Naples. A raw crash ratio can then overstate the causal effect.',
      'Maybe after proper controls FSD is still four times safer. Maybe it is eight times. Maybe it is 1.7 times. I have no idea!',
      'This is not an argument for blocking FSD. It is an argument for making the evidence less dependent on Tesla.',
      'Publish standardized incident data. Give insurers and regulators access. Let universities reproduce the analysis. Require Waymo, Tesla, Mercedes and whoever comes next to report comparable metrics.',
      'If autonomy is much safer than humans, independent evidence will eventually make arguing against it look like arguing against seatbelts.',
      'I like Tesla. I would also prefer Tesla not to be the only person marking Tesla’s homework.',
      'Trust the technology enough to test it properly.',
    ],
  },
  {
    id: 'systems-that-explain-themselves',
    date: '2026-08-29',
    title: 'Systems that explain themselves',
    marker: 'FIELD / 008',
    body: [
      'A system becomes operationally real when the people around it can tell what it is doing without asking its author. Until then it is still a demonstration, however impressive the model or interface may be.',
      'This is why observability is not an accessory added after deployment. The traces, failure states, thresholds and human-readable explanations are part of the product. They form the shared language through which an operator can disagree with the machine.',
      'The strongest systems expose their uncertainty at the same resolution at which decisions are made. A global confidence score is rarely enough. Someone needs to know which input was missing, which assumption became fragile and what changed since the previous result.',
      'Legibility also changes engineering behaviour. When failure is visible and attributable, teams stop treating incidents as mysterious exceptions and begin treating them as information about the system boundary.',
      'The final test is simple: if the original engineer disappears for a month, can the system still be inspected, challenged and safely operated? If not, the knowledge is not yet in the system. It is still trapped in a person.',
    ],
  },
  {
    id: 'the-shape-of-reliable-ai',
    date: '2026-08-28',
    title: 'The shape of reliable AI',
    marker: 'FIELD / 007',
    body: [
      'Reliability in AI is often discussed as if it were a property of the model. In production it is more often a property of the surrounding system.',
      'The model may be variable while the product remains dependable because inputs are constrained, outputs are checked, retries are bounded, providers can fail over and humans are inserted exactly where ambiguity becomes expensive.',
      'That distinction matters. Trying to remove all uncertainty from a probabilistic component is usually impossible. Designing a system that knows how to contain uncertainty is an engineering problem, and therefore tractable.',
      'Evaluation belongs inside that containment structure. It is not a leaderboard assembled at the end; it is evidence attached to every meaningful release decision.',
    ],
  },
  {
    id: 'interfaces-as-instruments',
    date: '2026-08-28',
    title: 'Interfaces as instruments',
    marker: 'FIELD / 006',
    body: [
      'An interface is an instrument when it helps someone perceive a relationship that would otherwise remain hidden.',
      'The distinction is useful because instruments are judged differently from decoration. Their hierarchy must correspond to consequence. Their latency changes what can be noticed. Their defaults encode a theory about normal operation.',
      'A good instrument does not merely present data. It gives the eye somewhere precise to stand.',
    ],
  },
  {
    id: 'deployment-is-a-contact-sport',
    date: '2026-08-27',
    title: 'Deployment is a contact sport',
    marker: 'FIELD / 005',
    body: [
      'A prototype lives in the world described by its author. A deployed system lives in everybody else’s world.',
      'That world contains malformed documents, interrupted connections, institutional habits, unusual permissions, old browsers, budget limits and people who use the correct feature in a way nobody predicted.',
      'Deployment is the moment a technical idea makes contact with all those constraints simultaneously. The resulting friction is not evidence that implementation distracted from the real work. It is the real work becoming visible.',
      'This is also why operational experience compounds differently from tutorial knowledge. Each failure adds a boundary condition to your internal model of what a system actually is.',
      'Eventually architecture stops looking like a collection of preferred technologies and starts looking like a record of which failures you have learned to anticipate.',
      'The goal is not a system that never fails. It is one whose failures are bounded, observable and recoverable—and whose users are never required to understand the machinery in order to remain safe.',
    ],
  },
  {
    id: 'friction-is-information',
    date: '2026-08-27',
    title: 'Friction is information',
    marker: 'FIELD / 004',
    body: [
      'When a tool keeps asking for the same workaround, the workaround is not the interesting part. The repetition is.',
      'A surprising amount of engineering starts by noticing what you have quietly learned to tolerate.',
    ],
  },
  {
    id: 'small-models',
    date: '2026-08-21',
    title: 'Small models of the world',
    marker: 'FIELD / 003',
    body: [
      'Every useful instrument is a small argument about what matters. It removes almost everything, then makes one relationship impossible to ignore.',
      'Good interfaces do the same thing.',
    ],
  },
  {
    id: 'control-without-theatre',
    date: '2026-08-14',
    title: 'Control without theatre',
    marker: 'FIELD / 002',
    body: [
      'The best controller often looks boring from the outside. No drama, no visible correction, just a system that refuses to become interesting.',
      'That is probably why people underestimate how much thought is hidden inside stability.',
    ],
  },
  {
    id: 'build-the-probe',
    date: '2026-08-05',
    title: 'Build the probe first',
    marker: 'FIELD / 001',
    body: [
      'Before improving a system, make it capable of surprising you. A rough probe that reveals the wrong assumption is worth more than a polished dashboard confirming it.',
    ],
  },
];
