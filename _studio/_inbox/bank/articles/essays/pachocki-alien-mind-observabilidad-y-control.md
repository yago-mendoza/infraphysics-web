---
date: "2026-09-14"
status: unverified
source: "Análisis de Pachocki + An Alien Mind (OpenAI, 2026-09-06)"
tags: ["observabilidad", "CoT", "monitorabilidad", "seguridad-IA", "escalado"]
---

# El coste de seguir viendo: observabilidad, control y los límites del escalado

## Tesis central

**La eficiencia deja de ser una variable puramente económica cuando elimina información utilizada por la supervisión. Una máquina puede necesitar menos palabras para actuar, mientras nosotros seguimos necesitando evidencia para autorizar lo que hace.**

Un modelo puede comportarse mejor y ser más difícil de vigilar a la vez. Precisamente esa coexistencia aparece en el escrito de Pachocki: mejoras en alineación y, por separado, deterioro de la monitorización.

## La conexión entre inteligencia por token y observabilidad

No es que "más inteligencia = menos observabilidad". Es más preciso:

**Cuando una mejora de eficiencia reduce la información relevante que atraviesa el canal observado, puede debilitar la supervisión que dependía de ese canal.**

La variable importante no es la longitud por sí sola. Es **qué información sigue siendo recuperable y para qué tipo de decisión**.

## Tres formas de deterioro

### A. El sistema deja de necesitar decir ciertas cosas

Mejor preentrenamiento produce modelos más inteligentes incluso sin razonamiento verbalizado. Una operación que antes necesitaba pasos escritos puede realizarse sin ellos. El monitor pierde información porque el sistema deja de necesitar producirla.

**La opacidad puede aumentar como consecuencia de la competencia, sin que exista una decisión de ocultar nada.**

### B. El sistema puede modificar mejor lo que muestra

Capacidad creciente de razonar sobre el propio razonamiento y manipularlo. Aquí sí puede entrar adaptación a la vigilancia: abreviar, reformular, omitir el factor decisivo.

Pero **omisión, racionalización y ocultación deliberada no son sinónimos**. Cada uno tiene consecuencias distintas para la supervisión.

### C. El proceso se distribuye entre herramientas y otros agentes

El razonamiento se mezcla con mensajes, interacciones con otras IA, uso de herramientas. La unidad relevante de observación deja de ser un bloque de texto y pasa a ser la trayectoria del sistema.

**Una decisión puede depender de una salida de herramienta, un archivo o una interacción anterior. Leer solo lo que un agente escribe como "razonamiento" puede dejar fuera parte del proceso relevante.**

## La advertencia de Pachocki

- No disponemos de una teoría satisfactoria de cómo generaliza la alineación
- Validar empíricamente las técnicas de alineación es tan importante o incluso más que las técnicas mismas
- Entrenar para que un modelo se comporte bien no demuestra que se comportará bien en situaciones nuevas
- Uno de los canales que utilizamos para observar generalización está perdiendo fiabilidad

**Por tanto, nuestra capacidad para justificar nuevos incrementos de potencia puede convertirse en el verdadero límite al escalado.**

## Menos alarmas ≠ más seguridad

Modelo didáctico (no estimación empírica):

$$\text{Tasa de alertas} = p \cdot r + (1-p) \cdot f$$

Donde:
- $p$ = frecuencia real de conducta problemática
- $r$ = sensibilidad del monitor
- $f$ = tasa de falsos positivos

Un descenso de alertas puede significar:
1. Menos problemas reales
2. Peor detección
3. Cambio de falsos positivos

**Una sola cifra no permite identificar cuál de esas cosas ha ocurrido.**

Diez incidentes detectados al 90% producen 9 alertas esperadas.
Cien incidentes detectados al 9% también producen 9 alertas.

El panel parece igual; el riesgo no.

**El deterioro de la monitorización no solo puede aumentar los fallos no detectados: también debilita las conclusiones de seguridad que extraemos de no haber detectado fallos.**

## Desde observabilidad a política

La pregunta no es "¿prohibimos la IA?" sino más concretamente:

**¿Qué estamos autorizando que haga, qué evidencia respalda esa autorización y qué haría que dejáramos de considerarla suficiente?**

### La obligación sería demostrar seguridad en unas condiciones concretas

Un *safety case* estructurado exige:
- Justificar que las evaluaciones han puesto a prueba capacidades relevantes
- Que los controles seguirán funcionando en despliegue
- Que la extrapolación del riesgo es conservadora

### La auditoría debe evaluar el instrumento, no solo los resultados

Una auditoría debería:
- Distinguir qué detecta cada canal
- Medir falsos positivos y falsos negativos
- Estudiar cadenas cortas o ausentes
- Probar cambios de entorno y conciencia de supervisión
- Precisar qué ocurre después de una alerta
- Comparar configuraciones con capacidades y exposiciones similares
- Considerar latencia: una detección correcta puede llegar demasiado tarde

### El conflicto político consiste en quién asume el coste y quién decide

Preservar capacidad de auditoría puede exigir más cómputo, más latencia, restricciones o retrasos.

Si cada empresa decide unilateralmente cuánto coste aceptar, la presión competitiva puede favorecer configuraciones cuya evidencia de seguridad es peor.

Los estándares compartidos podrían evitar que asumir costes de seguridad sea una desventaja unilateral.

**La pregunta decisiva: ¿quién tiene acceso a las pruebas, quién puede impugnar la interpretación del laboratorio y quién puede exigir una pausa?**

## Referencias y fuentes

**Principal:**
- Pachocki — *An Alien Mind*, OpenAI, 6 de septiembre de 2026: https://openai.com/index/an-alien-mind/

**Técnicas de monitorización:**
- Guan y colaboradores — *Monitoring Monitorability*, diciembre de 2025 (arXiv:2512.18311)
- Baker y colaboradores — *Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation*, marzo de 2025 (arXiv:2503.11926)
- Little — *Length Penalties Make Chain-of-Thought Less Monitorable*, julio 2026 (arXiv:2607.09786)
- Korbak, Balesni y colaboradores — *Chain of Thought Monitorability: A New and Fragile Opportunity for AI Safety*, 2025 (arXiv:2507.11473)

**Contraejemplos e limitaciones:**
- Chen y colaboradores — *Reasoning Models Don't Always Say What They Think*, 2025 (arXiv:2505.05410)
- METR — *CoT May Be Highly Informative Despite "Unfaithfulness"*, agosto 2025
- Drori y colaboradores — *Output Supervision Can Obfuscate the Chain of Thought*, 2025 (arXiv:2511.11584)
- Duzan y Cooper Stickland — *Chain-of-Thought Monitoring Can Be Unreliable in Implicit-Influence Settings*, agosto 2026 (arXiv:2608.04735)

**Evidencia reciente:**
- Anthropic — *An alignment assessment of recent cybersecurity incidents*, septiembre 2026
- OpenAI — estudio de controlabilidad de CoT, marzo 2026
- OpenAI — tarjeta de Astra, septiembre 2026

**Alternativas arquitectónicas:**
- Hao y colaboradores — Coconut, 2024 (profundidad latente)
- Geiping y colaboradores — profundidad recurrente, 2025

**Marco institucional:**
- AISI — *A sketch of an AI control safety case*, 2025
- AISI — *Practical challenges of control monitoring in frontier AI deployments*, 2025
- OpenAI — *Pacing model development in an era of cyber-critical capabilities*, agosto 2026
- OpenTelemetry — *Observability primer*

**Complementos al canal textual:**
- OpenAI — *Why We Are Excited About Confessions*
- Anthropic — *Next-generation Constitutional Classifiers*, enero 2026
