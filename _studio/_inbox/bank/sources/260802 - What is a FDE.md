# Resumen completo de los dos textos

Los dos materiales llegan prácticamente a la misma conclusión desde ángulos distintos:

> **“Forward Deployed Engineer” no es una profesión perfectamente definida. Es una etiqueta reciente para una función real: entender profundamente un problema empresarial, construir una solución técnica junto al cliente, desplegarla, comprobar que produce resultados y convertir lo aprendido en producto reutilizable.**

El término está de moda porque la IA está reduciendo el coste de programar. Cuando generar código deja de ser el principal cuello de botella, adquieren más valor la comprensión del negocio, la definición precisa del problema, el acceso a los datos, la integración con sistemas reales, el diseño de procesos y la responsabilidad sobre el resultado.  

La segunda transcripción contiene algunos errores automáticos: escribe en ocasiones **“FTE”** donde por el contexto se refiere a **FDE**, y “Palunteer” para referirse a **Palantir**.

---

## 1. Qué significa realmente “forward deployed”

**Forward deployed** significa literalmente que el profesional está colocado “hacia delante”, en el punto de contacto con el cliente y con la operación real. No trabaja únicamente dentro de un equipo de producto recibiendo requisitos ya definidos. Se introduce en el entorno del cliente, comprende cómo funciona su organización, accede a sus sistemas y datos, construye soluciones y observa directamente si funcionan.

El FDE se encuentra entre varias profesiones tradicionales:

* Ingeniero de software.
* Consultor tecnológico.
* Arquitecto de soluciones.
* Ingeniero de preventa o soluciones.
* Analista de negocio.
* Product manager.
* Ingeniero de datos.
* DevOps o ingeniero de infraestructura.
* Responsable de implantación y formación del cliente.

Precisamente por abarcar tantas funciones, una de las ponentes sostiene que el “secreto sucio” del FDE es que **no existe como disciplina única**: el nombre describe tantas combinaciones de responsabilidades que ha perdido una definición precisa. Pero eso no significa que el trabajo no exista. Significa que cada compañía denomina FDE a un perfil diferente. 

La continuidad entre todas esas variantes es la **responsabilidad frente al cliente**. Ya esté arreglando infraestructura, integrando datos, construyendo una aplicación, enseñando a usar una plataforma o desarrollando un agente de IA, el FDE responde por que la tecnología produzca algo útil para el cliente. 

---

## 2. Por qué el término “ingeniero” resulta discutible

En el primer debate aparecen dos interpretaciones.

Una posición sostiene que debería hablarse más bien de **forward deployed consultant**, porque la capacidad escasa ya no es escribir código. Los modelos de IA pueden producir bastante código, pero todavía no comprenden por sí solos la organización, sus incentivos, sus excepciones, sus usuarios ni el problema económico que se intenta resolver.

Desde esta perspectiva, el perfil ideal puede proceder de dos caminos:

**El consultor orientado al negocio.** Sabe entrevistar, descubrir necesidades, distinguir síntomas de causas, definir el valor buscado y cuestionar el proceso actual. Además, tiene suficiente conocimiento técnico para construir prototipos mediante IA.

**El ingeniero sénior orientado al negocio.** No se limita a ejecutar un ticket de Jira. Entiende por qué se construye algo, quién lo va a usar, qué proceso modifica y qué resultado debe producir. 

La defensa de la palabra **ingeniero** es que la ingeniería no consiste únicamente en escribir código manualmente. Un ingeniero civil no tiene que colocar personalmente cada tornillo de un puente. Diseña el sistema, identifica las dependencias, define las abstracciones, supervisa su ejecución y comprueba que el resultado sea seguro y funcional.

De la misma manera, un FDE puede no ser un especialista en C++, pero debe pensar sistemáticamente, reconocer dónde dividir un sistema, entender qué puede generalizarse y evitar que la solución se convierta en un conjunto caótico de parches. 

---

## 3. Diferencia entre un FDE y un analista de negocio

El debate señala que parte del FDE recuerda al antiguo **Business Analyst** o analista de negocio. El analista servía de puente entre los departamentos empresariales y los tecnológicos: estudiaba procesos, recogía requisitos, realizaba análisis y, en algunos casos, escribía código ligero.

Ese papel perdió protagonismo con ciertas implantaciones de **Agile**, porque se intentó distribuir sus responsabilidades entre product managers, desarrolladores y usuarios.

Sin embargo, el FDE moderno añade responsabilidades que normalmente no tenía el analista tradicional:

* Puede acceder directamente a datos e infraestructura.
* Construye prototipos funcionales.
* Despliega soluciones.
* Participa en la operación y resolución de incidencias.
* Usa lo aprendido para mejorar el producto base.
* Puede llegar a desarrollar una solución completa.
* Responde por resultados, no solamente por documentos de requisitos.

Por tanto, no es simplemente la recuperación del analista de negocio. Es una mezcla del analista con el arquitecto, el desarrollador, el consultor y el responsable de implantación. 

---

# 4. Historia del FDE en Palantir

La segunda charla reconstruye la evolución histórica del puesto. Su idea central es que las distintas funciones no se sustituyeron unas a otras: **se fueron acumulando**.

## Etapa inicial, alrededor de 2008: infraestructura y DevOps

En los primeros años de Palantir, “forward deployed” tenía un significado muy literal. Los sistemas se instalaban frecuentemente **on-premises**, es decir, en servidores situados físicamente dentro de la organización del cliente, no en una nube central gestionada por el proveedor.

Por eso era necesario colocar ingenieros cerca del cliente. El trabajo se parecía más a **DevOps** que a la imagen actual de un consultor de IA:

* Instalar la plataforma.
* Configurar servidores.
* Mantener la estabilidad.
* Resolver caídas.
* Atender incidentes fuera de horario.
* Adaptarse a entornos informáticos muy diferentes.

La ponente cuenta que uno de sus ejercicios de incorporación consistió simplemente en desplegar el software en una instancia de **Amazon EC2**, un servidor virtual alquilado en AWS. También describe el tipo de incidencia en que un cliente desconecta accidentalmente una máquina y llama al ingeniero a las dos de la mañana. 

**DevOps** es la disciplina que une desarrollo y operación. No se ocupa únicamente de crear software, sino de que pueda instalarse, actualizarse, monitorizarse y mantenerse en funcionamiento.

---

## Etapa de 2012: integración de datos

Cuando la plataforma se hizo más estable, el problema principal dejó de ser únicamente mantener los servidores encendidos. Palantir vendía software de integración de datos, pero una plataforma de datos sin datos integrados es inútil.

La comparación utilizada en la charla es un cine sin película: el edificio puede existir y funcionar, pero nadie obtiene valor.

El FDE empezó entonces a conectar fuentes de datos del cliente:

* Bases de datos.
* Sistemas empresariales.
* Archivos.
* Aplicaciones internas.
* Registros operativos.
* Datos procedentes de distintos departamentos.

**Integrar datos** significa extraer información de sistemas diferentes, transformar sus formatos, corregir incompatibilidades y relacionarla para que pueda analizarse de manera conjunta.

Por ejemplo, un cliente puede tener información de pedidos en un ERP, datos de clientes en un CRM y registros de entregas en otro sistema. La integración permite reconstruir el proceso completo.

El FDE también ayudaba a crear una **ontología**. En este contexto, una ontología es un modelo estructurado de las entidades importantes del negocio y de sus relaciones: clientes, pedidos, vehículos, incidencias, proveedores, empleados, ubicaciones, etc. No es solamente una lista de tablas; intenta representar cómo entiende la empresa su realidad. 

---

## Etapa de Slate y Foundry: convertir datos en decisiones

Una vez integrados los datos, había que hacerlos utilizables.

La charla menciona **Slate**, una herramienta visual de Palantir que permitía arrastrar componentes a una interfaz y conectarlos con fuentes de datos. Después llegó **Foundry**, su plataforma principal, orientada a transformar los datos en decisiones y operaciones.

Aquí aparece una distinción técnica importante:

Un dashboard que solamente muestra información puede perder utilidad rápidamente. Para intervenir realmente en un proceso, la aplicación necesita a menudo **write-back**, es decir, poder escribir una decisión o una modificación de vuelta al sistema de origen.

Por ejemplo, no basta con mostrar que un pedido está en riesgo. Puede ser necesario reasignar el pedido, cambiar una fecha, solicitar una aprobación o activar una acción logística desde la propia aplicación.

El FDE pasó así de integrar datos a construir aplicaciones operativas sobre esos datos. Como era quien mejor conocía tanto las fuentes como el contexto del cliente, estaba especialmente bien situado para decidir cómo hacerlas útiles. 

---

## Etapa alrededor de 2020: plataforma y enablement

Palantir no podía escalar indefinidamente enviando ingenieros a cada ubicación. Necesitaba que los propios clientes pudieran realizar una parte mayor del trabajo.

El FDE añadió entonces funciones de **enablement**, es decir:

* Formar a los usuarios.
* Crear documentación y métodos.
* Enseñar a desarrollar sobre la plataforma.
* Construir capacidades internas dentro del cliente.
* Ayudar a que otros ingenieros reprodujeran el trabajo.

La charla utiliza como ejemplo **Skywise**, el entorno desarrollado con Airbus, donde miles de ingenieros de Airbus fueron capacitados para trabajar sobre la plataforma.

También menciona los **AIP boot camps**, sesiones intensivas en las que Palantir ayuda a los clientes a construir casos de uso sobre su plataforma de inteligencia artificial. 

---

## Las etapas no se reemplazaron

El FDE moderno puede seguir teniendo que ocuparse de:

* Infraestructura.
* Despliegue.
* Datos.
* Ontologías.
* Aplicaciones.
* Formación.
* Consultoría.
* Producto.
* Agentes de IA.

De ahí la idea de las distintas **“vintages” o añadas de FDE**. Un candidato puede ser principalmente un FDE de estilo 2008, especializado en estabilidad; uno de 2012, orientado a integración de datos; uno posterior, especializado en aplicaciones, producto o formación; o una combinación de todos ellos.

La ponente considera que esta amplitud convirtió el trabajo en una excelente escuela para **generalistas**, lo que explicaría en parte que numerosos antiguos empleados de Palantir hayan terminado fundando empresas. 

---

# 5. Qué hace un FDE en la era de la IA

En la actualidad, el ciclo completo podría describirse así:

**Primero, descubre el problema real.** Entrevista a distintos participantes y observa el proceso. No acepta automáticamente la descripción inicial del cliente, porque cinco personas de la misma empresa pueden dar cinco versiones diferentes del problema.

**Después, identifica el resultado.** Determina qué debería mejorar: tiempo, ingresos, precisión, costes, resolución de incidencias, satisfacción del cliente o cualquier otro indicador.

**Comprende el proceso y sus excepciones.** Estudia cómo se realiza realmente el trabajo, no únicamente cómo aparece descrito en un manual.

**Localiza e integra los datos necesarios.** Comprueba qué información existe, quién puede acceder a ella, con qué calidad y en qué sistemas.

**Construye rápidamente una primera solución.** Puede utilizar modelos generativos y agentes de programación para producir prototipos, integraciones, interfaces o automatizaciones.

**La prueba en el contexto real.** Comprueba si las personas pueden usarla, si las respuestas son correctas, si las integraciones funcionan y si el proceso mejora.

**Gestiona el cambio.** Ayuda a usuarios, responsables y departamentos a modificar su forma de trabajar.

**Generaliza lo aprendido.** Extrae componentes, patrones o funcionalidades que puedan beneficiar a otros clientes.

**Productiza la solución.** “Productizar” significa convertir un desarrollo específico y frágil en una capacidad estable, mantenible, documentada y reutilizable dentro del producto general.

---

## 6. El rasgo que evita que el FDE sea solamente consultoría personalizada

Un FDE no debería limitarse a resolver el problema del cliente A de forma completamente aislada.

Una de sus aportaciones más importantes consiste en **abstraer** la solución. Debe preguntarse qué parte del problema es particular del cliente y qué parte representa un patrón que también aparecerá en los clientes B, C, D o E.

Una **abstracción** elimina detalles particulares y conserva la estructura común.

Por ejemplo, un cliente puede pedir un sistema para priorizar averías en aviones. Otro puede necesitar priorizar averías en maquinaria industrial. Los datos concretos son distintos, pero ambos casos pueden compartir un patrón general: activos, señales, probabilidad de fallo, criticidad, recursos disponibles y recomendación de intervención.

La capacidad de reconocer y diseñar esa estructura reutilizable exige razonamiento de arquitectura e ingeniería. Es lo que crea el “flywheel” o círculo de mejora: cada implantación particular hace más potente el producto general, y el producto general hace más rápidas las siguientes implantaciones. 

---

# 7. La inversión del proceso tradicional de desarrollo

Tradicionalmente, construir software era muy caro. Un error de arquitectura descubierto al final podía requerir meses de reescritura. Por eso se dedicaba mucho tiempo a especificar, planificar y diseñar antes de desarrollar.

Según el debate, la IA está invirtiendo parcialmente este orden.

Ahora puede ser preferible construir rápidamente una primera solución, aunque internamente sea una **“casa de naipes”**, para comprobar si resuelve el problema correcto. Esa solución funcional actúa como una especificación mucho más concreta:

* Estos son los datos de entrada.
* Este es el comportamiento esperado.
* Estos son los resultados aceptables.
* Estas son las excepciones reales.
* Así reaccionan los usuarios.

Una vez validado el comportamiento, la IA y los ingenieros pueden limpiar el código, mejorar la arquitectura, añadir pruebas y reemplazar los componentes provisionales.

La tesis no es que la arquitectura deje de importar. Es que resulta absurdo perfeccionar técnicamente una solución antes de comprobar si soluciona el problema adecuado. El mayor riesgo pasa a ser **resolver muy deprisa el problema equivocado**. 

---

# 8. El nuevo cuello de botella: claridad

Durante décadas, el desarrollo de software fue un recurso caro y escaso. Las organizaciones crearon procesos para proteger el tiempo de los programadores:

* Roadmaps.
* Comités.
* Documentos de requisitos.
* Priorizaciones.
* Capas de product management.
* Reuniones de diseño.
* Aprobaciones.
* Divisiones estrictas de responsabilidades.

Ahora, en algunos casos, seis personas pueden pasar más tiempo discutiendo seis alternativas que el que necesitarían para construir y probar las seis mediante IA.

Por eso el cuello de botella se desplaza. Ya no es necesariamente producir código, sino alcanzar **claridad sobre el problema**:

* ¿Qué ocurre realmente?
* ¿Por qué ocurre?
* ¿Qué debería cambiar?
* ¿Cómo se medirá el éxito?
* ¿Qué restricciones son auténticas?
* ¿Qué reglas existen por razones válidas?
* ¿Qué reglas sobreviven solamente por inercia?

Además, la IA no solo permite resolver de otra manera el problema antiguo. Puede hacer necesario **redefinir por completo el proceso**. Un procedimiento diseñado para humanos con capacidad limitada no tiene por qué seguir siendo adecuado cuando una parte del trabajo puede ejecutarse automáticamente y a gran escala. 

---

# 9. La importancia del conocimiento empresarial

La tesis más repetida es que el conocimiento sobre cómo funciona realmente una empresa se ha vuelto extremadamente valioso.

Los procesos corporativos nunca son tan limpios como aparecen en los diagramas. Contienen:

* Excepciones.
* Aprobaciones especiales.
* Sistemas heredados.
* Reglas locales.
* Clientes con contratos distintos.
* Procesos manuales.
* Dependencias políticas.
* Límites legales.
* Controles creados después de errores anteriores.

La charla utiliza el ejemplo de **SAP**. Los grandes sistemas ERP intentaron estandarizar procesos como order-to-cash, cuentas a pagar o cuentas a cobrar. Las empresas aceptaban procesos subóptimos porque desarrollar software personalizado para cada excepción era demasiado caro.

La IA reduce ese coste y permite atender muchas más excepciones. Esto puede provocar una explosión de pequeñas aplicaciones y automatizaciones que antes no justificaban económicamente su desarrollo. 

**Order-to-cash** es el ciclo completo desde que un cliente realiza un pedido hasta que la empresa cobra.

**ERP** es un sistema central para coordinar procesos empresariales como finanzas, compras, inventario, producción y ventas.

El FDE debe conocer estos procesos y, al mismo tiempo, saber cuándo conviene respetarlos, cuándo simplificarlos y cuándo rediseñarlos.

---

# 10. Por qué los puestos técnicos están convergiendo

Uno de los participantes cita una observación: los mejores product managers, diseñadores y desarrolladores creen que ya no necesitan tanto a los otros dos perfiles.

La idea no es que una profesión haya absorbido completamente a las demás. Lo que ocurre es que la IA permite a cada una ejecutar tareas que antes estaban fuera de su alcance:

* Un product manager puede construir prototipos.
* Un diseñador puede producir una aplicación funcional.
* Un ingeniero puede diseñar interfaces y redactar especificaciones.
* Un consultor puede crear software.
* Un especialista de negocio puede automatizar su propio proceso.

Por eso el valor se desplaza hacia las personas capaces de combinar perspectivas y completar ciclos de trabajo más amplios.

En Sierra, según la segunda charla, las líneas entre **product engineering** y **forward deployed engineering** también se están borrando. El buen ingeniero de producto necesita comprender al cliente, y el buen FDE debe pensar en cómo su solución afecta al producto general. Incluso un ingeniero de infraestructura debe pensar en cómo se desplegará y utilizará el software. 

---

# 11. Agentes, agent engineering y harness engineering

La ponente de Sierra había propuesto el término **agent engineering** como una subdisciplina de la ingeniería de IA.

Un agente de IA no se limita a contestar una pregunta. Puede recibir un objetivo, consultar información, usar herramientas, tomar decisiones intermedias y ejecutar acciones.

**Agent engineering** incluye diseñar:

* Las instrucciones del agente.
* Sus herramientas.
* Los datos a los que accede.
* Sus límites.
* La memoria o contexto.
* Los criterios de evaluación.
* Las medidas de seguridad.
* La intervención humana.
* Su despliegue y monitorización.

La charla también menciona **harness engineering** como una disciplina emergente dentro o alrededor de agent engineering. El “harness” es el entorno de control que rodea al modelo: herramientas, permisos, flujos, evaluaciones, comprobaciones y mecanismos que hacen que el modelo opere de manera fiable.

La conclusión de la ponente es que agent engineering no sustituye al FDE. Es una variante de este: utiliza agentes para producir resultados concretos para clientes.

Finalmente amplía la idea y sostiene que casi toda la ingeniería está moviéndose hacia el modelo forward deployed: ingeniería de producto, de agentes, de IA, de soluciones y de cliente están adquiriendo mayor responsabilidad sobre el despliegue y el resultado. 

---

# 12. Cuando el código se abarata, el resultado gana importancia

La segunda charla conecta el FDE con un cambio en el modelo económico del software.

## Precio por asiento

La empresa paga por cada usuario autorizado.

Este modelo es lógico cuando el software es principalmente una herramienta que mejora el trabajo de una persona. Microsoft 365 o un CRM suelen venderse de este modo.

## Precio por uso

La empresa paga por consumo: llamadas a una API, tokens, almacenamiento o volumen procesado.

Es el modelo habitual de muchos proveedores de modelos fundacionales, porque pueden medir cuánto se utiliza el sistema, pero no siempre qué valor empresarial produjo.

## Precio por resultado

La empresa paga cuando se obtiene un resultado verificable:

* Una consulta de cliente resuelta.
* Una venta completada.
* Una cita programada.
* Una reclamación procesada.
* Una tarea administrativa terminada.

Los agentes hacen más viable este modelo porque tienen mayor **agencia y autonomía**. No se limitan a ofrecer una herramienta a un empleado: pueden completar una parte mayor del trabajo.

Pero cobrar por resultado implica que el proveedor debe ser capaz de garantizarlo. Ahí el FDE adquiere importancia: tiene que configurar, integrar y adaptar el sistema hasta que produzca el resultado acordado en el entorno real del cliente. 

---

# 13. Empresas pequeñas frente a grandes organizaciones

Las compañías medianas o pequeñas pueden tener una ventaja porque sus empleados están acostumbrados a desempeñar varias funciones. Sus estructuras suelen estar menos “calcificadas”.

Además, los principales directivos pueden comprender una parte bastante grande de la empresa y tomar decisiones rápidamente. Cuando esos líderes conocen profundamente el negocio y apoyan la transformación, una organización mediana puede avanzar con mucha velocidad.

En una empresa muy grande:

* Nadie comprende el sistema completo.
* Existen muchos departamentos.
* Hay procesos históricos.
* Las responsabilidades están fragmentadas.
* Las decisiones atraviesan varias jerarquías.
* Cambiar un proceso afecta a carreras, presupuestos y poder interno.

Incluso un excelente CEO de una empresa Fortune 500 tiene dificultades para modificar rápidamente todo el sistema. 

---

# 14. Por qué las estructuras organizativas actuales chocan con este modelo

Muchas empresas fueron diseñadas alrededor de la especialización y la división del trabajo:

* El negocio define necesidades.
* Producto redacta requisitos.
* Diseño crea interfaces.
* Ingeniería programa.
* Operaciones despliega.
* Soporte atiende incidencias.
* Formación enseña al usuario.

El FDE atraviesa estas fronteras. Eso genera problemas con:

* Descripciones de puestos.
* Salarios.
* Evaluaciones.
* Promociones.
* Organigramas.
* Asignación presupuestaria.
* Responsabilidad por fallos.
* Colaboración entre países y proveedores.

Los sistemas de carrera fueron construidos primero alrededor de **Waterfall**, después adaptados parcialmente a **Agile** y, en muchas empresas, combinados con equipos onshore, nearshore y offshore.

Ahora no existe una trayectoria clara para enseñar a un ingeniero arquitectura, negocio, producto, IA y gestión del cambio, ni para enseñar a un product manager suficiente ingeniería y arquitectura. 

---

# 15. El “sunny day engineer”

El debate utiliza la expresión **sunny day engineer** para describir a un desarrollador que funciona muy bien cuando:

* El problema está bien definido.
* La infraestructura funciona.
* Las dependencias se comportan como se esperaba.
* El caso encaja con patrones conocidos.
* No aparecen excepciones imprevistas.

Ese perfil tiene dificultades cuando el sistema falla de maneras nuevas.

El desarrollo con agentes es menos predecible. Los modelos pueden producir resultados variables, las integraciones cambian y cada implantación puede ser bastante específica. Por eso se necesitan ingenieros más flexibles, capaces de investigar, improvisar, probar hipótesis y abandonar la solución académicamente “perfecta” cuando no funciona en la práctica. 

---

# 16. Gestión del cambio

Resolver técnicamente el problema no garantiza que la solución sea adoptada.

Una transformación de IA puede modificar:

* Responsabilidades.
* Autoridad.
* Flujos de aprobación.
* Métricas.
* Plantillas.
* Horarios.
* Relaciones con clientes.
* Número y tipo de puestos.
* Conocimientos considerados valiosos.

Los procesos antiguos no siempre son arbitrarios. Muchos controles aparecieron después de un error, un fraude, una pérdida o una crisis. Con el tiempo se convirtió en “comodidad ganada”: la organización confía en ellos porque han reducido riesgos durante años.

Desmontarlos produce miedo incluso entre personas razonables y abiertas al cambio. Por eso el FDE necesita capacidad de **change management**: comunicar, formar, negociar, obtener apoyo, introducir la solución gradualmente y demostrar que los nuevos controles funcionan. 

---

# 17. ¿La IA eliminará empleos de software?

El panel no cree que la consecuencia principal vaya a ser una desaparición masiva de la demanda.

Su razonamiento es el siguiente:

El mundo real contiene millones de procesos específicos y excepciones que antes no podían automatizarse porque desarrollar software era demasiado caro. Cuando ese coste cae, aparecen muchos más proyectos posibles.

Una aplicación que solo utilizará una persona podía ser económicamente absurda. Con herramientas de IA, esa persona puede construirla en horas o días.

Por eso, según los participantes:

* Los buenos ingenieros están trabajando más, no menos.
* Los buenos consultores también están más ocupados.
* Las empresas que adoptan IA siguen contratando.
* Algunos despidos pueden representar una reconstrucción de la plantilla y del conjunto de habilidades, no una desaparición del trabajo.
* El número de tareas y proyectos intentados está aumentando.

El riesgo más serio no sería la falta absoluta de trabajo, sino que muchas personas no adquieran las habilidades nuevas que exige este modelo. 

---

# 18. Qué ocurre con los desarrolladores junior

El panel matiza la afirmación de que el puesto de programador junior está muriendo.

Las tareas que tradicionalmente permitían aprender están siendo automatizadas:

* Escribir código repetitivo.
* Preparar hojas de cálculo.
* Crear consultas sencillas.
* Corregir errores básicos.
* Transformar datos.
* Implementar especificaciones pequeñas.

El problema es que esas tareas no solo producían trabajo. También permitían al junior observar la empresa, familiarizarse con los sistemas y comprender cómo se toman las decisiones.

Los ingenieros sénior aprovechan mejor la IA no únicamente porque programen mejor, sino porque comprenden:

* A los usuarios.
* El producto.
* El negocio.
* Las restricciones.
* Qué especificación dar al modelo.
* Cómo evaluar si el resultado es correcto.

Por tanto, el puesto junior no desaparece necesariamente, pero debe evolucionar. El junior necesita adquirir antes competencias de negocio, evaluación, IA y resolución de problemas. 

---

# 19. El posible regreso del aprendizaje por oficio

Como muchas tareas iniciales desaparecen, los participantes proponen recuperar un modelo parecido al **apprenticeship** o aprendizaje mediante acompañamiento.

El junior observa cómo una persona experimentada:

* Formula el problema.
* Investiga una anomalía.
* Elige herramientas.
* Descarta hipótesis.
* Habla con el cliente.
* Evalúa las respuestas de la IA.
* Decide cuándo algo es suficientemente bueno.

Una práctica descrita consiste en reunir al equipo mientras una persona comparte pantalla y trabaja. Los demás observan, preguntan y comentan. Aunque al principio resulte incómodo, permite transmitir conocimiento tácito que no aparece en manuales.

Esto es especialmente importante en trabajo remoto, donde los profesionales sénior pueden resolver todo solos y los demás pierden la oportunidad de ver cómo piensan. 

---

# 20. Qué deberían hacer las universidades

El panel critica que algunas universidades se limiten a prohibir la IA.

Reconoce que los estudiantes deben aprender fundamentos y desarrollar pensamiento independiente, pero sostiene que también deben aprender a utilizar y evaluar herramientas de IA.

Se describe un curso universitario en el que los alumnos probaron plataformas de ciencia de datos asistida como **Deepnote** y **Hex**, y compararon la capacidad de **Gemini** y **Claude** para resolver proyectos completos.

El objetivo no era aceptar automáticamente el resultado, sino analizar:

* Si el prompt era inadecuado.
* Si la herramienta fallaba en ingeniería de datos.
* Si el código generado era correcto.
* Si eligió el método estadístico apropiado.
* Cómo comparó distintas alternativas.
* En qué fase necesitó intervención humana.

Ese tipo de enseñanza desarrolla una competencia central: no solo usar IA, sino saber diagnosticar por qué funciona o falla. 

---

# 21. El perfil final: el “Renaissance person”

Los dos textos describen, en el fondo, un perfil de **generalista con profundidad media o alta en varias áreas**.

No tiene que ser la persona más experta del mundo en cada una, pero debe combinar:

**Negocio.** Comprender procesos, incentivos, métricas, usuarios y valor económico.

**Tecnología.** Entender software, arquitectura, APIs, infraestructura, seguridad y despliegue.

**Datos.** Saber de dónde proceden, cómo se relacionan, qué calidad tienen y qué representan.

**IA.** Utilizar modelos, agentes y herramientas de programación, además de evaluar sus errores.

**Producto.** Diferenciar una solución aislada de una capacidad reutilizable.

**Consultoría.** Formular preguntas, sintetizar versiones contradictorias y comunicar decisiones.

**Operaciones.** Conseguir que el sistema funcione en producción.

**Gestión del cambio.** Lograr que las personas adopten el nuevo proceso.

A este perfil se lo denomina en el panel **“Renaissance person”**, una persona renacentista capaz de unir disciplinas que las organizaciones habían separado. 

---

# Conclusión general

El FDE no debe entenderse como “un programador que visita clientes”. Tampoco es únicamente un consultor con conocimientos técnicos.

Es el profesional que cierra el espacio entre una tecnología potencialmente útil y un resultado empresarial real.

Su valor aparece porque la IA abarata la construcción, pero no resuelve automáticamente los aspectos más difíciles:

* Elegir el problema correcto.
* Comprender el proceso real.
* Integrar los datos.
* Manejar excepciones.
* Diseñar la arquitectura.
* Conseguir la adopción.
* Medir el resultado.
* Transformar una solución particular en producto.

Por eso la aparente contradicción de la segunda charla tiene sentido:

> **Forward deployed engineering está “muerto” como categoría precisa, porque ya no designa una profesión única. Pero está más vivo que nunca como modelo de trabajo, porque una parte creciente de la ingeniería se está acercando al cliente, al despliegue y al resultado.**

La idea más importante de ambos textos es que **la programación deja de ser el centro exclusivo de la ingeniería**. La nueva ventaja competitiva está en combinar código, IA, negocio, datos, producto y ejecución para convertir problemas ambiguos en sistemas que funcionan.
