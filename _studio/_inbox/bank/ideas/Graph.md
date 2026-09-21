ChatGPT Pro




image(50).png
image(51).png
image(52).png
To view keyboard shortcuts, press question mark
View keyboard shortcuts


Post

See new posts
Conversation
Jared Zoneraich

@imjaredz
Proud to say that Devin has cracked three more unsolved problems today

1) REFUTED: Graffiti Conjecture 154 (open for ~40 years)
2) PROVED: Graffiti Conjectures 39 & 40 (~40 years)
3) REFUTED: Brandt's Regular Supergraph Problem from West's open problems list (~20 years)

My methodology is explained below, but basically I showed Devin the original tweet and told it to find similar problems and crack them.

The flood gates are open.
Quote
Dmitry Rybin
@DmitryRybin1
·
Jul 22
Dinitz-Garg-Goemans conjecture is false. This graph theory problem was open for ~30 years.

The graph below has fractional flow cost 58. Any unsplittable flow (with capacity violation <=15) has cost at least 60.

Chat with GPT 5.6 Pro where this was found: https://chatgpt.com/share/6a60b2eb-0b64-83ee-9c76-7931ca1de063
Readers added context they thought people might want to know
Devin is Cognition's AI coding agent that orchestrates underlying models including Fable and GPT-5.6. Graffiti Conjecture 154 had already been refuted a month prior with the same lollipop(50,70) counterexample.

github.com/demonstrandum-…
cognition.com/blog/devin-fus…
Do you find this helpful?
Context is written by people who use X, and appears when rated helpful by others.  Find out more.
2:31 AM · Jul 23, 2026
·
913.9K
 Views
Relevant
View quotes

Jared Zoneraich

@imjaredz
·
Jul 23
1) Graffiti Conjecture 154

REFUTED. Open for ~40 years. Devin found the counterexample: glue a 50-clique to a 70-edge path (n=120). The violation reduces to a single integer inequality, proven in Lean down to the graph's distance sum.

2) Graffiti Conjectures 39 & 40

PROVEN.
Show more
Jared Zoneraich

@imjaredz
·
Jul 23
I got totally nerd sniped today

I'll share more of the methodology soon, but basically I had a few Devins research good problems similar to the one the OP solved

Then I picked the best problems

Then I spun up ~5 Devins in Ultra mode for each problem to find & verify solutions
Show more
Jared Zoneraich

@imjaredz
·
Jul 23
just solved another unsolved problem btw
Oakes
@OakesTT
Ad
Vibe coded to 10k mrr

now the landing page needs work

and the last thing you want to do is open that file yourself
From splitstream.ai
Relevant people
Jared Zoneraich

@imjaredz
builder in residence 
@cognition
, previously founder of 
@promptlayer
Dmitry Rybin
@DmitryRybin1
Cofounder $100M AI Startup in Shenzhen, Algorithm Discovery + Math (we’re hiring) | ML PhD CUHK, BSc. Math HSE | IMC🥇National Math Olympiad🥇
Trending now
What’s happening
Trending
GPT-6
Trending in Italy
Shaila
Business & finance · Trending
South Korea
Trending in Italy
Mieli
Show more
Terms
 ·
Privacy
 ·
Cookies
 ·
Accessibility
 ·
Ads Info
 ·

More
© 2026 X Corp.





explciame esto como si tuveir 5 años bueno mas , soy ingeniero no matemtaico

La idea importante no es que una IA "sepa matemáticas mejor que los humanos", sino que está empezando a ser muy buena haciendo algo que hasta hace poco parecía reservado a investigadores: buscar ejemplos rarísimos y probarlos automáticamente.

Voy por partes.

¿Qué es una conjetura?
Una conjetura es básicamente una hipótesis.

Alguien observa miles de casos y dice:

"Creo que esto siempre ocurre."

No es un teorema hasta que alguien lo demuestra.

Por ejemplo:

"Todo coche rojo consume menos gasolina."

Has visto un millón de coches y siempre ocurre.

Pero basta encontrar un único coche rojo que no lo haga para destruir la afirmación.

En matemáticas pasa exactamente igual.

¿Qué son las Graffiti Conjectures?
En los años 80 existía un sistema llamado Graffiti.

Era un programa bastante simple que generaba automáticamente relaciones interesantes entre propiedades de grafos.

Por ejemplo encontraba cosas del estilo

"Parece que esta cantidad siempre es menor que esta otra."

Los matemáticos iban comprobándolas.

Algunas resultaban ser ciertas.

Otras quedaban abiertas durante décadas.

Había más de 700.

¿Qué es un grafo?
No es una gráfica de Excel.

Es simplemente:

puntos (vértices)

líneas (aristas)

Por ejemplo

A ----- B
|       |
|       |
C ----- D
Todo Internet puede verse como un grafo.

Una red eléctrica.

Una red social.

Una molécula.

Un mapa de carreteras.

El primer resultado
La conjetura 154 decía, simplificando muchísimo,

"Existe una cantidad relacionada con las distancias del grafo que nunca supera cierto límite."

Era una desigualdad.

La IA construyó este grafo:

[K50]-------------------------
 |                            |
 |                            |
muchísimas conexiones      camino largo
Es el llamado lollipop graph.

Una parte muy densa (un clique).

Una cola muy larga.

Esa combinación hace que cierta cantidad espectral crezca demasiado.

Resultado:

cantidad = 1.02

límite = 1.00
Ya está.

Con un solo ejemplo la conjetura muere.

No importa que funcionase para millones de grafos.

¿Por qué es difícil encontrar ese ejemplo?
Porque el espacio de búsqueda es monstruoso.

Con 120 vértices existen aproximadamente

2^(7140)
grafos distintos.

Eso es muchísimo más grande que el número de átomos del universo.

No puedes probarlos todos.

La IA tiene que "oler" estructuras prometedoras.

Eso es lo impresionante.

El segundo resultado
Aquí ocurrió justo lo contrario.

Las conjeturas decían algo parecido a

"Todos los grafos cumplen esta desigualdad."

Durante 40 años nadie encontraba una prueba.

La IA observó algo extremadamente sencillo.

En cualquier grafo:

los dos nodos más alejados
están unidos por un camino mínimo.

Y ese camino mínimo no puede tener atajos, porque si los tuviera dejaría de ser mínimo.

Luego automáticamente es un camino inducido.

Eso basta para aplicar un resultado conocido sobre matrices.

Toda la demostración cabe en cuatro líneas.

Lo gracioso es que no hacía falta ninguna construcción complicada.

Solo mirar el problema desde el ángulo correcto.

Esto pasa mucho en matemáticas.

El tercer resultado
Aquí la conjetura decía:

"Siempre puedes duplicar algunos vértices hasta que el grafo quede regular."

Regular significa que todos los nodos tienen exactamente el mismo número de conexiones.

Ejemplo:

3
|\ 
| \
3--3
Todos tienen grado 2.

Perfecto.

Pero imagina

4
|
3
|
3
Uno tiene cuatro conexiones.

Otros tres.

La pregunta era:

¿Puedo clonar algunos nodos para equilibrarlo?

La respuesta se creía que sí.

La IA encontró un grafo diminuto de solo 9 vértices donde es matemáticamente imposible.

No importa cómo clones.

Nunca funciona.

Además generó un certificado formal (basado en el lema de Farkas) que demuestra que el sistema de ecuaciones no tiene solución.

¿Qué pinta Lean aquí?
Lean es un verificador de demostraciones.

No descubre nada.

Hace de notario.

La IA escribe:

"Creo que esta prueba funciona."

Lean responde

✓ correcto
o

✗ aquí hay un fallo
Así evitas errores humanos.

¿Qué hizo realmente Devin?
No fue magia.

Por lo que cuentan:

Buscó problemas abiertos parecidos.

Lanzó varias instancias trabajando en paralelo.

Cada una generó candidatos.

Intentó demostrarlos o refutarlos.

Todo se verificó automáticamente con herramientas formales.

Es mucho más parecido a tener 20 doctorandos trabajando 24 horas seguidas que a un modelo respondiendo preguntas.

¿Y el contexto de X?
Hay un detalle importante. La propia publicación lleva una nota de la comunidad indicando que uno de los tres resultados (la refutación de la Graffiti Conjecture 154) ya había sido encontrado aproximadamente un mes antes usando exactamente el mismo contraejemplo. Es decir, no sería un descubrimiento original de Devin, aunque sí habría reproducido el resultado. Los otros dos resultados necesitarán la revisión habitual de la comunidad matemática antes de considerarse aceptados definitivamente.

Como ingeniero, yo me quedaría con esta analogía:

Imagina que tienes un compilador capaz de explorar millones de diseños de un circuito electrónico, proponer uno que rompe una especificación de Intel o demostrar que una optimización siempre funciona, y luego pasar automáticamente una verificación formal. No "entiende" la electrónica como un ingeniero, pero explora el espacio de diseños a una velocidad sobrehumana y valida rigurosamente los candidatos. Eso es, en esencia, lo que empieza a estar ocurriendo con ciertos problemas de matemáticas discretas.


valeper oexplcaime mejor eso de las propiedades del os grafos nose, u poc omejor, a lo mejro tiene aplciacion en igneieria o en optaimzicaon

Sí, tiene muchísima aplicación en ingeniería y optimización. Lo primero es entender qué significa “propiedad de un grafo” sin entrar todavía en las fórmulas raras.

Un grafo es un modelo de relaciones
Un grafo tiene:

Vértices: objetos.

Aristas: conexiones entre objetos.

Opcionalmente, pesos: coste, distancia, tiempo, capacidad, resistencia, etc.

Por ejemplo, una red logística:

Fábrica ──4 h── Almacén
   │                 │
  7 h               2 h
   │                 │
Puerto ───3 h── Cliente
Los puntos son ubicaciones, las líneas son rutas y los números son tiempos.

La teoría de grafos estudia propiedades de la estructura completa, no solo de cada conexión por separado.

1. Distancia, diámetro y caminos mínimos
La distancia entre dos nodos es el coste del camino más corto que los conecta.

El diámetro es la mayor de todas esas distancias:

¿Cuál es la peor distancia posible entre dos puntos de la red?

Esto aparece directamente en ingeniería.

En una red informática, el diámetro aproxima el peor número de saltos de un paquete. En logística, representa el peor tiempo mínimo entre ubicaciones. En una planta, puede representar la peor distancia entre dos estaciones. En una red eléctrica, ayuda a describir cuán extendida está topológicamente la red.

En la segunda imagen, la prueba usa los dos vértices más alejados. El camino más corto entre ellos tiene una propiedad importante: no puede contener un atajo.

A──B──C──D──E
Si existiera una conexión directa entre B y D:

A──B──C──D──E
   └─────┘
entonces el camino original no sería mínimo. Por eso, un camino mínimo no contiene conexiones internas que permitan saltarse partes. Matemáticamente, eso se denomina camino inducido.

Esa observación estructural sencilla permite después deducir propiedades de las matrices del grafo.

2. Grado: cuántas conexiones tiene cada nodo
El grado de un nodo es su número de conexiones.

    B
    |
A───X───C
    |
    D
El nodo X tiene grado 4. Los demás tienen grado 1.

Esto tiene una interpretación ingenieril inmediata:

En telecomunicaciones: número de enlaces de un router.

En transporte: carreteras que llegan a una intersección.

En una red eléctrica: líneas conectadas a una subestación.

En fabricación: dependencias de una operación.

En software: módulos que dependen de otro módulo.

Un nodo con grado muy alto puede ser eficiente, pero también convertirse en cuello de botella o punto único de fallo.

La tercera conjetura hablaba de volver el grafo regular: conseguir que todos los nodos tengan el mismo grado mediante clonación de vértices.

Por ejemplo:

grado: 2, 2, 2, 2
es una red regular. Mientras que:

grado: 5, 3, 3, 2
no lo es.

En ingeniería, las redes regulares interesan porque suelen repartir carga y redundancia de forma uniforme. Pero el resultado dice que determinadas topologías no pueden equilibrarse simplemente replicando componentes. La propia estructura impone una incompatibilidad.

Es parecido a descubrir que una línea de producción no puede balancearse duplicando máquinas sin cambiar sus conexiones.

3. Conectividad y robustez
Una red está conectada si puedes llegar desde cualquier nodo a cualquier otro.

Pero eso es una medida muy básica. En ingeniería interesa saber:

¿Cuántos elementos tienen que fallar para dividir la red?

Ejemplo:

A──B──C──D
Si falla B──C, la red se divide. Esa arista es un puente.

En cambio:

A──B
|  |
D──C
si falla una conexión, todavía existe una ruta alternativa.

Esto se usa en:

tolerancia a fallos;

diseño de redes eléctricas;

telecomunicaciones;

redes de suministro;

diseño de infraestructuras;

arquitectura de sistemas distribuidos.

Una optimización típica sería:

Minimizar el coste de construcción garantizando que la red sobreviva al fallo de cualquier enlace.

Eso es un problema de optimización combinatoria sobre grafos.

4. Centralidad: qué nodos son realmente importantes
El grado no siempre identifica el nodo crítico.

Observa:

Grupo 1 ─── X ─── Grupo 2
X podría tener solo dos conexiones, pero todo el tráfico entre ambos grupos pasa por él.

La centralidad de intermediación mide aproximadamente cuántos caminos mínimos atraviesan un nodo.

Aplicaciones:

localizar cuellos de botella;

decidir dónde instalar capacidad adicional;

detectar componentes críticos;

identificar personas que conectan departamentos;

descubrir puntos vulnerables en redes logísticas.

Un nodo puede tener pocas conexiones y, aun así, ser más importante que otro con veinte.

5. Clique: un grupo completamente conectado
Una clique es un conjunto de nodos donde cada uno está conectado con todos los demás.

Una clique de cuatro nodos:

A────B
|\  /|
| \/ |
| /\ |
|/  \|
C────D
En la primera imagen aparece una clique de 50 vértices, 
K
50
K 
50
​
 .

Una clique puede representar:

dispositivos con comunicación directa entre todos;

tareas mutuamente incompatibles;

usuarios que interactúan entre sí;

variables fuertemente acopladas;

componentes con dependencias cruzadas.

También puede ser muy cara: una clique de 
n
n nodos necesita

n
(
n
−
1
)
2
2
n(n−1)
​
 
conexiones. Con 50 nodos son 1.225 conexiones.

El contraejemplo combina dos extremos:

una región extremadamente densa, la clique;

una región extremadamente alargada, el camino.

████████████───────────────
 zona densa       cola larga
Esta mezcla produce propiedades globales extrañas: dentro de la clique todo está muy cerca, pero desde el extremo de la cola muchas cosas están muy lejos.

Es una topología desequilibrada. Precisamente ese desequilibrio rompe la conjetura.

6. Matrices y autovalores: el puente hacia ingeniería
Un grafo puede escribirse como una matriz. La más sencilla es la matriz de adyacencia:

A
i
j
=
{
1
si los nodos 
i
,
j
 est
a
ˊ
n conectados
,
0
si no lo est
a
ˊ
n
.
A 
ij
​
 ={ 
1
0
​
  
si los nodos i,j est 
a
ˊ
 n conectados,
si no lo est 
a
ˊ
 n.
​
 
Por ejemplo:

A──B──C
produce:

A
=
(
0
1
0
1
0
1
0
1
0
)
A= 
​
  
0
1
0
​
  
1
0
1
​
  
0
1
0
​
  
​
 
Los autovalores de esta matriz resumen propiedades globales de la red. No son adornos matemáticos: se relacionan con estabilidad, difusión, sincronización, conectividad y velocidad de convergencia.

A un ingeniero le sonará el mismo principio de sistemas lineales:

x
˙
=
A
x
x
˙
 =Ax
La matriz determina los modos naturales del sistema. En grafos, ocurre algo parecido: los autovalores describen los “modos estructurales” de la red.

Aplicaciones concretas:

Control distribuido: si varios robots deben alcanzar consenso.

Redes eléctricas: estabilidad y sincronización.

Difusión térmica: cómo se propaga una temperatura por una malla.

Epidemiología: velocidad de propagación en una red.

Clustering: detección de comunidades.

Vibraciones: modos propios de estructuras discretizadas.

Optimización: velocidad de algoritmos distribuidos.

Un ejemplo de optimización real
Supón que debes conectar diez centros logísticos.

Tienes tres objetivos:

Minimizar kilómetros de carretera.

Mantener bajo el tiempo máximo entre centros.

Sobrevivir al fallo de una carretera.

El diseño más barato sería probablemente un árbol:

A──B──C──D
   |
   E──F
Pero un árbol es frágil: si falla una arista crítica, se divide.

Una red completamente conectada sería muy robusta:

todos conectados con todos
pero sería carísima.

El problema real consiste en encontrar el equilibrio:

min
⁡
coste
mincoste
sujeto a restricciones como:

di
a
ˊ
metro
≤
D
,
di 
a
ˊ
 metro≤D,
conectividad
≥
2
,
conectividad≥2,
capacidad de cada enlace
≥
demanda
.
capacidad de cada enlace≥demanda.
Eso es optimización de redes. La teoría de grafos proporciona las variables, restricciones y propiedades que hacen posible formular el problema.

Qué enseñan estos tres resultados
El primero dice que una desigualdad aparentemente universal puede romperse por una arquitectura híbrida: núcleo denso + ramificación larga.

El segundo muestra que una propiedad global puede demostrarse usando una estructura básica: el camino entre los puntos más alejados.

El tercero muestra que ciertos problemas de balanceo no se arreglan duplicando recursos: hay una incompatibilidad topológica, equivalente a que un sistema lineal no tiene solución factible.

En lenguaje ingenieril: no están estudiando dibujos con puntos. Están estudiando arquitectura de sistemas, y cómo esa arquitectura limita costes, rutas, estabilidad, equilibrio, robustez y rendimiento.


mi pregunta es si resolver alguno de esos problemas tiene algun tipo de aplciacion en ingenieria, candidata de awaken a peoyecto ingenieira con software simulacion o algo sabes

Sí, pero con una precisión importante: resolver esas conjeturas concretas probablemente no produce mañana un producto industrial. Su valor está en las técnicas que aparecen al resolverlas: búsqueda automática de topologías extremas, simulación de redes, optimización combinatoria y verificación formal.

Como proyecto de ingeniería con software, la idea más sólida sería construir un laboratorio automático de diseño y ruptura de redes.

El usuario define una red —eléctrica, logística, informática, de tuberías o de tareas— y unas condiciones:

coste máximo;

latencia o distancia máxima;

tolerancia a fallos;

reparto equilibrado de carga;

capacidad mínima;

número limitado de conexiones.

El programa genera miles de topologías, las simula y busca dos cosas:

La mejor red que cumple los requisitos.

Un contraejemplo que rompa una regla de diseño aparentemente segura.

Por ejemplo:

“Diseña una red de 30 almacenes que minimice kilómetros y continúe conectada si falla cualquier carretera.”

O:

“Comprueba si duplicar servidores siempre permite equilibrar la carga sin cambiar la arquitectura.”

La tercera conjetura encaja especialmente bien aquí. Su mensaje ingenieril es que replicar recursos no siempre corrige un desequilibrio estructural. Podrías crear un simulador de microservicios, centros logísticos o máquinas industriales que detecte cuándo añadir copias es inútil y cuándo hay que rediseñar las conexiones.

Otra opción fuerte es un buscador de topologías peligrosas. La primera conjetura cayó con una red formada por un núcleo extremadamente denso y una cola larga. Ese patrón aparece en sistemas reales:

núcleo cloud muy conectado ─── cadena de nodos remotos
El software podría generar combinaciones como núcleos, ramas, anillos y clusters, y evaluar:

latencia;

congestión;

vulnerabilidad;

propagación de fallos;

estabilidad;

consumo energético.

Esto sería útil para redes IoT, arquitecturas cloud, plantas industriales y cadenas de suministro.

Mi candidata concreta para Awaken sería:

GraphBreaker — optimizador y adversario de redes industriales
Un usuario dibuja o importa una red. El sistema calcula métricas, simula fallos y utiliza algoritmos de búsqueda para modificarla. Puede operar en dos modos:

Diseñador: encuentra una arquitectura más barata, robusta o equilibrada.

Adversario: intenta encontrar la combinación de fallos o la topología que viola las garantías declaradas.

Tecnología razonable:

Python;

NetworkX para grafos;

OR-Tools, Pyomo o Gurobi para optimización;

SimPy para simulación de eventos;

FastAPI;

React o una interfaz visual;

opcionalmente Z3 para demostrar que determinadas configuraciones son imposibles.

Un MVP podría centrarse en una red de distribución:

Importar nodos, demanda y costes de enlaces.

Calcular rutas, diámetro, cuellos de botella y puntos críticos.

Simular el fallo de cada nodo o enlace.

Proponer nuevas conexiones.

Comparar coste frente a robustez.

Generar un certificado explicando por qué una restricción no puede cumplirse.

Eso ya sería un proyecto serio de ingeniería de software + optimización + simulación, no una demostración académica disfrazada.

Mi opinión: no intentaría “resolver otra conjetura” como objetivo del proyecto. Construiría una herramienta que use el mismo método para descubrir contraejemplos y diseños extremos en sistemas reales. Ahí está la aplicación comercial. La simulación industrial se utiliza precisamente para predecir rendimiento y optimizar diseños antes de construirlos físicamente. 


