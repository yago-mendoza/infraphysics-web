---
date: 2026-08-12
type: project-idea
status: committed
topic: anvil
infraphysics: true
related:
  - "[[Horizon]]"
  - "[[Next move strategy]]"
  - "[[260811 — Qué aporta FDI y FTC a TRACE]]"
  - "[[cyber-physical-garage-lab]]"
---

# ANVIL — el yunque donde se forja la cicatriz

> [!important] Estado
> **Comprometido**, no explorado. Absorbe [[cyber-physical-garage-lab]], que describía el sustrato correcto sin entregable. Su diferencia con aquella nota: flota en vez de banco único, artefactos de evidencia en vez de laboratorio, y una fecha.

## Tesis

El proyecto no debe demostrar que sé **construir** un sistema inteligente. Eso ya está demostrado —TrialGPT, DxGPT—. Debe demostrar lo único que el perfil no puede probar y que compra todo el top del pipeline:

> **que sé ACEPTAR un sistema inteligente desplegado, romperlo, diagnosticarlo, recuperarlo y propagar el arreglo a toda la flota.**

La máquina es la excusa. **El producto son los artefactos de evidencia.**

## La pregunta de la simulación — resuelta

*(2026-08-12)*

No es "planta real contra simulación". Es **cuál es la dosis mínima de realidad**.

### Lo que la simulación sí compra

Todo el bucle TRACE es software y no necesita hardware: esquema de telemetría, correlation IDs, inyección de fallos, latencia de detección, modos degradados, acceptance report, postmortem convertido en test, rollout escalonado con rollback y propagación a la flota.

Y compra tres cosas que el hardware **empeora**:

1. **Ground truth propio.** Sé exactamente qué fallo inyecté, así que puedo medir *isolation accuracy* honestamente. Con hardware real muchas veces no sabes cuál era la causa verdadera.
2. **Reproducibilidad.** Replay, 500 escenarios en CI, comparación apples-to-apples. Eso está *más* cerca de lo que hacen Fugro o ICEYE —suites de escenarios— que un banco físico artesanal.
3. **Velocidad y coste cero.** V0 en días, sin espacio, sin viaje, compatible con salud.

Nota epistemológica: aquí la simulación es legítima **por la razón exacta por la que no lo era en [[thermal-surrogate]]**. Allí el ground truth era CFD que no podía validar solo. Aquí el mundo es cerrado y la física la defino yo — es el mismo argumento de "dueño del ground truth" de [[hvac]].

### Lo que la simulación NO puede comprar

> **Un simulador no puede sorprenderte sobre la física. Sólo encuentras los fallos que escribiste.**

Eso es el límite duro, y es justo el gap que [[Profile audit]] señala: hacer que hardware barato funcione de forma fiable en el mundo real. Lo que sólo da la realidad:

- fallos que nadie diseñó — deriva térmica, EMI, un conector oxidado, masa flotante, brownout, un tornillo que se aflojó por vibración;
- la historia de entrevista *"cuéntame algo que te sorprendió"*, que un simulador no genera;
- credibilidad: en RobCo, Tekever o Fugro han visto cien demos simuladas y descuentan la simulación pura sin decírtelo.

### La arquitectura que resuelve el dilema

```text
N NODOS SIMULADOS      la flota, la escala, la CI, el skew de versiones,
                       los 500 escenarios, el planificador
                       → Python, ~200 líneas de integración numérica

1 NODO FÍSICO          ~50 € · ESP32 + sensor de corriente + acelerómetro
   (el ancla)          + un ventilador o bomba pequeña
                       corre EL MISMO agente y produce fallos que nadie diseñó
```

90% de la velocidad de la simulación, 100% de la credibilidad. Y coincide con la práctica real del sector: **SIL → HIL → campo**. La vacante cerrada de Fugro pedía literalmente *commissioning y testing de vehículos nuevos, en sitio y en remoto*: las dos cosas.

### Sobre C++

- **Para la planta simulada: no.** Escribir el simulador físico en C++ es el desvío elegante que se come tres semanas y no demuestra nada de TRACE. Python, y cuanto más feo mejor.
- **Para el firmware del nodo físico: sí, y es el uso rentable.** ESP32/Arduino es C++ embebido sobre hardware real, que es exactamente el gate que piden Quadsat, ICEYE (avionics/firmware), Ocean Infinity y Fugro.
- **La visual: deliberadamente tonta.** Canvas web o Grafana. Ni Three.js ni gemelo 3D. El riesgo registrado en [[hvac]] es *"juguete bonito"* — la visual sirve a la demo, no a la ingeniería.

## Arquitectura

```text
planta (sim ~200 líneas · o banco físico)
→ agente de control determinista + interlocks
→ Modbus TCP / OPC UA
→ edge (Docker): estimación de estado + health model + fallback a regla
→ MQTT (que se cae a propósito)
→ centro: Timescale + Prometheus + Grafana + OpenTelemetry
→ decisión acotada → actuación o handover al operador
→ verificación
```

**El detalle que vale más que el resto junto:** un trace con correlation ID **desde la muestra del sensor hasta el actuador**. Literalmente la T de TRACE, y casi nadie en la competencia lo tiene.

La IA no es decorativa: (a) health/anomaly model con incertidumbre, abstención y fallback a control clásico; (b) un agente que genera el diagnostic bundle y el borrador de postmortem. **Ambos sometidos a un harness de evaluación propio** — el activo de F29 trasplantado de lo clínico a lo físico.

## Entregables — lo que de verdad se vende

1. **Fault library** — 10 fallos, físicos y digitales: válvula estrangulada, tornillo flojo, sensor congelado, deriva de bias, partición de red, clock skew, broker caído, certificado caducado, config drift, model drift.
2. **Site Acceptance Report generado desde telemetría** — no un PDF a mano: un informe de readiness que el sistema produce. Casi nadie tiene esto en un portfolio.
3. **Release gate** — config o modelo nuevo → suite de fault injection en el gemelo → canary en el nodo físico → flota, con **rollback automático** por violación de SLO.
4. **5-6 postmortems públicos**, cada uno enlazado al **test de regresión** que produjo.
5. **Una historia de propagación** — fallo en la unidad #1 → detector + test + cambio de arquitectura → protege a las tres.
6. **Métricas**: detection latency, isolation accuracy, falsas alarmas/día, MTTR, % de incidentes convertidos en test, % de rollouts con rollback automático.

## Fases

```text
V0 · 12–31 ago 2026   1 nodo sim + 1 nodo físico + 3 fallos + telemetría end-to-end
                      + 1 postmortem → 1 test.  YA CITABLE EN CANDIDATURAS.
V1 · septiembre       health model + evaluación + abstención/fallback + acceptance report
V2 · octubre          3ª unidad con versión distinta + release gate + rollback + propagación
V2b· opcional         sustituir un gemelo por un ROVER o DRON con ROS 2
                      → legible para Tekever, Quadsat, ICEYE-Valencia, Monumental
V3 · bajo demanda     lo que pida una entrevista concreta. Nunca antes.
```

Coste total ~150-200 €. Sin viajes, sin ruido, compatible con la baja.

## Qué candidatura compra cada pieza

| Pieza | A quién le habla |
|---|---|
| Modbus/OPC UA + acceptance report | [[Schneider — Junior Project Application Engineer SCADA]] · Siemens · Theker |
| Diagnóstico remoto + tooling de monitorización | [[Fugro — Uncrewed Surface Vessels Remote Operations Nootdorp]] · [[XOCEAN — USV Remote Operations Louth Ireland]] |
| Función de deployment y commissioning construida desde cero | [[Jaipur Robotics — Forward Deployed Engineer Field Deployment]] |
| Evaluación, guardrails, abstención, traces | [[ICEYE — Forward Deployed AI Engineer Portugal]] · Schneider Barcelona |
| Fault injection + modo degradado + telemetría de vuelo | [[Tekever — Reliability Engineer AR5 Lisboa]] · [[Quadsat — Robotics Engineer Odense]] |
| Propagación del fix a la flota, churn cero | [[Verity — Candidatura espontánea Zurich]] · RobCo · [[Monumental — Forward Deployed Robotics Engineer]] |
| Planificador y asignación de recursos (V2) | [[ICEYE — Senior Software Engineer Tasking and Planning Valencia]] |
| Anomalía, ventana, primer respondedor | [[Open Cosmos — Satellite Flight Operator Barcelona Harwell]] |

Ese solapamiento es la mejor señal de que el proyecto está bien elegido: **una sola pieza de trabajo sirve a nueve candidaturas.**

## Reglas duras

1. **Nada de FDI formal hasta V2.** Cero vacantes de nivel 3 en el pipeline. El observador elegante es procrastinación con ecuaciones.
2. **V0 se publica el 31 de agosto aunque sea feo.** Un proyecto que madura seis meses en privado llega después de que se cierren las fichas.
3. **Toda idea adquiere masa en siete días.** Código, hardware, texto publicado o candidatura enviada. Las notas no cuentan.
4. **Nunca investigar un camino más tiempo del que se ha practicado.**
5. **Terminar sistemas feos.**
6. El riesgo no son los datos malos: es *"juguete bonito"*. Se mata con fallos físicos reales y métricas medidas, no narradas.

## Qué NO es

- No es un laboratorio. [[cyber-physical-garage-lab]] era una lista de la compra; esto tiene entregables y fecha.
- No es un dron por afición. El dron, si llega, es el **segundo nodo** de una flota con gate de aceptación.
- No es data center ni cooling: [[atmos-1]], [[hvac]] y [[thermal-surrogate]] apuntan a un jurado ML/DC que casi no existe en el pipeline real.
- No es una demo. Si al final no hay un postmortem que se convirtió en un test, no se ha hecho el proyecto.
