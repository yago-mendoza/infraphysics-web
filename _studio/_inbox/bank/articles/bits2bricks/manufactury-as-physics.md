Sí, sé exactamente a qué te refieres: no “qué fórmula es importante”, sino **qué conjunto tiene esa cualidad de vídeo de 3Blue1Brown/Veritasium**, donde una ecuación aparentemente abstracta acaba explicando algo muy tangible.

Para este paper, yo pondría arriba de todo este bloque:

$$
H(q,p)=\frac{p^2}{2}+V(q)
$$

junto con

$$
dp=(F(q)-\eta p)\,dt+\beta\,dW,
\qquad
dq=p\,dt
$$

y

$$
\rho(q,p)=C\exp\left(-\frac{H(q,p)}{kT}\right)
$$

Ese conjunto es el más “3Blue1Brown”. La narrativa sería: **“una fábrica puede describirse como si fuera una partícula moviéndose en un paisaje de energía”**. El inventario \(q\) es la posición, el flujo neto \(p\) es el momento, \(V(q)\) es el paisaje que tú diseñas para empujar el inventario hacia donde quieres, \(\eta\) representa amortiguamiento, y \(\beta dW\) introduce el ruido de la demanda. Luego aparece la distribución exponencial y, de golpe, el “paisaje” que diseñaste determina directamente dónde tenderá a encontrarse el inventario. Eso tiene una belleza visual enorme. El propio paper presenta justamente el potencial como mecanismo de control y el Hamiltoniano como descripción conjunta de inventario y flujo. 

Para un vídeo más tipo **Veritasium**, mi favorita sería la relación de incertidumbre:

$$
\sigma_R\sigma_Q\geq \frac{\psi^2\lambda}{2}
$$

La frase de apertura prácticamente se escribe sola: **“¿Por qué no puedes tener al mismo tiempo una fábrica con inventario perfectamente estable y producción perfectamente estable?”** El resultado dice que si aprietas la variabilidad del inventario, tienes que permitir que la producción reaccione más violentamente; y eso exige capacidad sobrante. Si no quieres esa capacidad, pagas con más inventario o más backorders. El paper hace explícitamente esa interpretación. 

Y aquí está el giro que haría el vídeo memorable: esa ecuación tiene la misma **forma conceptual** que Heisenberg,

$$
\sigma_p\sigma_q\geq \frac{\hbar}{2}.
$$

No porque una fábrica sea cuántica, sino porque producción y net-inventory aparecen como variables conjugadas dentro del formalismo Hamiltoniano. Esa conexión es literalmente lo que empuja al autor a construir todo el artículo. 

La tercera candidata, muy 3Blue1Brown, sería el **oscilador armónico amortiguado**:

$$
\ddot q+\eta\dot q+\omega^2q=\beta W(t)
$$

porque permite decir algo como: **“El mismo tipo de ecuación que describe una masa unida a un muelle puede describir cómo una fábrica intenta corregir su inventario.”** Si corriges demasiado agresivamente, el sistema oscila; si corriges muy poco, vuelve lentamente; existe un punto crítico entre ambos. El paper distingue precisamente los regímenes under-damped, over-damped y critically damped. 

Y luego hay un cuarto conjunto que me parece menos sexy al principio, pero quizá el más sorprendente al final:

$$
\rho(q)=C\exp\left(-\frac{2\eta V(q)}{\beta^2}\right)
$$

Esto permite una afirmación potentísima: **elige la forma del potencial y, esencialmente, estás eligiendo la forma de la distribución estacionaria del inventario**. El artículo termina destacando exactamente esa consecuencia y dice que distintas funciones potenciales abren un número casi ilimitado de estrategias de control. 

Si tuviera que escoger **un único vídeo**, sería:

**“Why a Factory Behaves Like a Particle in a Potential Well.”**

Y la secuencia sería: inventario como posición → producción/demanda como movimiento → potencial como política de control → ruido de demanda → oscilaciones → distribución de Boltzmann → principio de incertidumbre inventario/producción.

Eso sí tiene pinta de vídeo donde alguien acaba diciendo: **“esta ecuación, nacida para describir partículas, te dice cómo gestionar una fábrica.”**


Sí. Para construir ese vídeo, estas son las partes del PDF que más ayudan, y te las transcribo **tal cual aparecen**.

La primera es donde el autor formula explícitamente la idea de que producción e inventario tienen una relación tipo “incertidumbre”:

> “The implication is that if we want tighter control on inventory, we must allow production to vary more. This accommodation requires extra capacity above and beyond the average demand to be available at all times so it will be available when it is needed to bring up the inventory to the desired target. This translates to a larger capacity buffer. On the other hand, if we allow more variation in net-inventory, we can live with a smaller capacity buffer.” 

Y justo después hace la conexión con Heisenberg:

> “The inequality (6) is reminiscent of a fundamental relation in quantum mechanics known as the Heisenberg Uncertainty Principle” 

Luego viene la frase que justifica toda la analogía física:

> “Since supply chains are dynamic in nature and given the relation in (6), it seems reasonable to write the Lagrangian of a supply chain and see if we can model a real supply chain with it.” 

Esta parte sería perfecta para el momento “una fábrica como partícula”:

> “We then define q to be a generalized coordinate denoting the net-inventory and its time derivative will be the net-flow” 

y:

> “Thus, control of net-inventory ‘particle’ will be accomplished by a ‘potential’ that generates a ‘force’ on the particle to constrain its location.” 

Después aparece la identificación clave:

> “Defined in this manner, the momentum becomes the canonical conjugate of the generalized position, q, and in this case is equal to the net flow” 

con la ecuación:

$$
p=\dot q=x-d
$$

La parte más 3Blue1Brown del paper, para mí, es esta transición al Hamiltoniano:

> “Although the Lagrangian is written in terms of q and q̇, we would like to be able to describe the system in terms of net-inventory, q, and net-flow, p. This can be done by applying a Legendre transformation to the Lagrangian resulting in a new function of q and p known as the Hamiltonian” 

seguida por:

$$
H(q,p,t)=\frac{p^2(t)}{2}+V(q)
$$



Luego llega otra parte muy potente: que conociendo el Hamiltoniano puedes escribir directamente la distribución estacionaria:

> “Thus, the steady state distribution of the net inventory and the net flow in a production-inventory system described by Hamiltonian H can be written down by simply knowing the Hamiltonian and the final temperature of the system.” 

La ecuación correspondiente es:

$$
\rho(q,p)=C\exp\left(-\frac{H(q,p)}{kT}\right)
$$



Después, cuando introduce ruido, hay una frase excelente para conectar la fábrica con Brownian motion:

> “Interestingly, if we set \(F_0 = 0\), equation (13) becomes Langevin’s equation that was first proposed in 1908 to describe the dynamics of physical Brownian motion.” 

Y esta es la ecuación general que yo pondría en pantalla como “la ecuación de movimiento de la fábrica”:

$$
dp=(F(q)-\eta p)\,dt+\beta dW
$$

$$
dq=p\,dt
$$



La sección del **damped harmonic oscillator** da probablemente la mejor visualización posible:

> “The harmonic oscillator is a classic physics problem.”

> “In our setting the corrective force is proportional to the difference between the net-inventory and its target.” 

Y la ecuación:

$$
\ddot q+\eta\dot q+\omega^2q=\beta W(t)
$$



Más importante aún para un vídeo, el autor explica intuitivamente los tres comportamientos:

> “If \(\omega < \eta/2\) the system will be ‘over-damped’ and will take longer to reach equilibrium. On the other hand, if \(\omega > \eta/2\), the system is said to be ‘under-damped’ and will oscillate above and below the target before converging. However, if \(\omega = \eta/2\), the system is ‘critically-damped’ and will reach equilibrium in minimum time without going below zero.” 

Esto sería visualmente brutal: una curva de inventario que vuelve lentamente, otra que oscila y otra que regresa justo al objetivo.

Luego está una frase especialmente importante porque conecta la física con sistemas reales en general:

> “The harmonic oscillator is important because any system in equilibrium will behave, as a first order approximation, like a harmonic oscillator.” 

Y al final del paper aparece quizá la idea más potente conceptualmente:

> “Whereas most of previous inventory models have been limited in the number of possible probability distributions, the possibility of using a variety of ‘potential’ functions as controls suggests an almost limitless number of ways to provide control.” 

seguida por:

$$
\rho(q)=C\exp\left(-\frac{2\eta V(q)}{\beta^2}\right)
$$



Y para cerrar el vídeo, esta frase resume literalmente el descubrimiento central:

> “We have now seen a direct link between production and net-inventory as these two are ‘canonical conjugate’ variables and have an associated ‘uncertainty principle’ that is directly related to the idea of buffers mitigating variability.” 

Si tuviera que seleccionar **solo 5 fragmentos** para construir el guion, escogería: la incertidumbre producción-inventario, “net-inventory particle”, el Hamiltoniano, el oscilador amortiguado y la fórmula final \(\rho(q)\propto e^{-2\eta V(q)/\beta^2}\). Ahí está prácticamente toda la historia.

Sí. Para **recrear visualidades**, yo priorizaría cuatro partes del PDF porque casi se animan solas.

La más visual es el **oscilador armónico amortiguado**:

$$
\ddot q+\eta\dot q+\omega^2q=\beta W(t)
$$

Aquí puedes dibujar el inventario \(q\) como una bolita intentando volver al centro. Cambias \(\eta\) y \(\omega\), y tienes tres escenas: **over-damped** — vuelve lentísimo; **under-damped** — se pasa del objetivo y oscila; **critical damping** — llega al objetivo lo más rápido posible sin sobrepasarlo. El propio PDF describe exactamente esos tres regímenes. 

Visualmente sería muy 3Blue1Brown: arriba una masa con muelle; haces morph y el eje pasa a ser “inventory”; después las mismas tres curvas representan cómo responde una fábrica.

La segunda sería todavía más bonita conceptualmente: **el paisaje de potencial**.

$$
H(q,p)=\frac{p^2}{2}+V(q)
$$

El PDF dice que el control de la “partícula de inventario” se consigue mediante un **potential que genera una force** para restringir su posición. 

Aquí puedes literalmente dibujar distintos paisajes:

$$
V(q)=\frac12\omega^2q^2
$$

como un valle.

La bolita es el inventario. Si está demasiado alto, rueda hacia el objetivo. Si está demasiado bajo, también. La demanda aleatoria le da pequeños golpes.

Luego cambias la forma del valle. Un valle estrecho = control muy agresivo. Uno ancho = permites mucha variabilidad. Incluso podrías dibujar potenciales asimétricos: “tener demasiado stock me importa menos que quedarme sin stock”. El paper acaba precisamente diciendo que usar diferentes funciones potenciales permite construir una cantidad casi ilimitada de controles. 

La tercera visualidad sería probablemente mi favorita para un **momento de revelación**:

$$
\rho(q)=C
\exp\left(-\frac{2\eta V(q)}{\beta^2}\right)
$$



Puedes poner el paisaje \(V(q)\) arriba y debajo hacer aparecer automáticamente la distribución de inventario \(\rho(q)\).

**Cambias la forma del valle → cambia la distribución.**

Eso es extremadamente visual. No necesitas explicar demasiadas matemáticas: el espectador literalmente ve cómo una política de control se convierte en una distribución probabilística.

Luego tienes la **relación de incertidumbre**, que se presta a otra animación muy clara:

$$
\sigma_R\sigma_Q\geq\frac{\psi^2\lambda}{2}.
$$



Imagina dos sliders:

**Inventory variability** ←→ **Production variability**

Intentas comprimir la nube de inventario alrededor de cero y automáticamente se expande la nube de producción. Luego haces lo contrario.

Después haces el morph visual:

$$
\sigma_R\sigma_Q
\quad\longrightarrow\quad
\sigma_p\sigma_q
$$

y finalmente:

$$
\sigma_p\sigma_q\geq\frac{\hbar}{2}.
$$

Ahí tienes el momento Veritasium de **“espera… ¿esto no se parece sospechosamente a mecánica cuántica?”**. Esa comparación es exactamente la que introduce el artículo. 

Y hay una quinta que usaría para una visualidad más caótica: **Brownian motion**.

$$
dp=(F(q)-\eta p)\,dt+\beta dW
$$

$$
dq=p\,dt.
$$



La bolita está dentro del valle, pero ahora recibe pequeños impactos aleatorios. Primero muestras moléculas golpeando una partícula browniana. Después las moléculas se convierten en **pedidos de clientes** golpeando el sistema productivo. Esa analogía viene directamente de la explicación del paper sobre las fluctuaciones de demanda y Brownian motion. 

Si estuviera diseñando las visualidades, la secuencia que más me gusta sería:

**fábrica → línea temporal de inventario → bolita → paisaje potencial → ruido golpeándola → tres tipos de damping → distribución emergiendo del paisaje → incertidumbre producción/inventario → Heisenberg.**

Ahí ya tienes prácticamente una narrativa visual completa de 8–12 minutos sin depender demasiado de texto.
