---
date: 2026-03-21
tags:
  - career
title: atmos-1
aliases:
related:
  - "[[260119 - Bare Metal (ATMOS)]]"
  - "[[260123 - Platform Engineer Path]]"
  - "[[260321 - Software como capa de abstracción]]"
infraphysics: true
status: idea
---

> [!note] Estado
> Posible proyecto, sin compromiso de ejecución ni autoridad sobre la estrategia profesional. Puede cambiar de alcance, fusionarse con otra idea o no desarrollarse.

Tu startup concreta:

Un copiloto de commissioning + operación para data centers de IA.

Producto inicial:

“Detecto que este rack/CRAC/chiller/UPS/PDU está desviándose antes de que cause throttling, downtime o exceso de PUE.”

Qué conectas:

BMS/DCIM/SCADA + sensores térmicos + PDUs + UPS + chillers + datos de GPU utilization + temperatura exterior + precios eléctricos.

Qué vendes:

Alertas predictivas: “en 6 horas este pasillo caliente va a romper margen térmico”.
Setpoints recomendados: temperatura, caudal, chillers, ventiladores, humidificación.
Commissioning automático: comparar diseño vs operación real.
Anomalías energéticas: equipos peleándose entre sí, sobreenfriamiento, válvulas mal configuradas, sensores muertos.
Informe para facility manager: ahorro estimado, riesgo, acción concreta.

Cliente inicial:

No hyperscalers. Demasiado difícil.

Cliente inicial bueno:

colocation mediano, integradores MEP, empresas de commissioning, operadores de edge/data centers, hospitales con CPD, universidades con clusters GPU, industria con sala técnica.

Precio:

5k–20k €/mes por site si ahorras energía o evitas downtime. Si entras por commissioning, puedes cobrar 20k–100k € por proyecto con software + consultoría.

Por qué esto puede hacerte rico: porque estás pegado a CAPEX/OPEX físico. El mercado de cooling de data centers ya se mide en decenas de miles de millones: Fortune Business Insights estima $18.78B en 2025, $21B en 2026 y $54.18B en 2034. El mercado de liquid cooling también está explotando: una estimación lo pone en $4.8B en 2025 y $27.1B en 2035.

El wedge más listo:

No digas “AI for data centers”. Di: “continuous commissioning for AI-density cooling and power.”

Eso suena a dinero. Suena a Vertiv, Schneider, Siemens, Johnson Controls, Eaton, ABB, data center operators, EPCs.

MVP en 60 días:

Coges datos públicos/sintéticos de HVAC + energía + simulación EnergyPlus o datos reales pequeños. Construyes:

dashboard + anomaly detection + forecast térmico + recomendador de setpoints + reporte automático.

Luego haces outreach a:

empresas de commissioning MEP, operadores de CPDs medianos, proveedores de mantenimiento industrial, ingenierías de climatización, data centers pequeños en España/Portugal/Francia.

Frase de venta:

“Your AI racks are not failing because the model is bad. They are failing because power and cooling are now dynamic systems. We detect thermal and electrical drift before it becomes throttling, downtime, or wasted megawatts.”

Mi ranking sincero para hacerte rico:

1. Data center power/cooling OS — mejor ángulo para ti.
2. Grid-interactive compute / demand response para clusters GPU — más difícil, más upside. Papers de 2026 ya hablan de usar data centers de IA como cargas flexibles para la red.
3. Liquid cooling monitoring / leak-risk / flow optimization — nicho más hardware-adjacent.
4. AI para commissioning industrial general — más amplio, menos sexy.
5. Isquemias/medical imaging — buen portfolio, mal camino para hacerse rico rápido.

Agente autónomo que monitoriza infraestructura industrial, detecta anomalías, genera fixes, los valida de forma determinista, y se despliega en edge sin depender de cloud. Codename: Yogurt Agent. Nombre público: **ATMOS-1**.

## Evolución: de copiloto de una instalación a sistema operativo de misión

El data center es el primer entorno, no el límite conceptual. ATMOS puede convertirse progresivamente en un **mission-control kernel** reutilizable para sistemas físicos autónomos:

```text
ATMOS observa una instalación
→ estima su estado y detecta desviaciones
→ asigna o recomienda acciones bajo restricciones
→ valida antes de actuar
→ coordina activos y agentes distintos
→ replantea ante fallos
→ escala decisiones y conserva human override
```

La misma arquitectura puede adquirir sucesivas pieles:

1. **Data center:** cooling, potencia, capacity y commissioning.
2. **Microrred:** generación, almacenamiento, cargas e islanding.
3. **Flota robótica:** estado compartido, task allocation, routing, baterías, comunicaciones, fallos y mission progress.
4. **Cauldron:** fabricación, commissioning, reparación y reincorporación de robots según las necesidades de la misión.
5. **Instalación o hábitat remoto:** coordinación de energía, recursos, infraestructura y flotas como un solo sistema.

No deben construirse cinco productos simultáneos. Cada nueva piel debe reutilizar el núcleo anterior y revelar qué supuestos dejan de funcionar. La extensión de flotas vive en [[robot-fleet-orchestration]].

Filosofía heredada del USB Allocator: LLM genera, código determinista valida.

## Por qué este proyecto es nuclear

Es la tesis profesional hecha código. Literalmente lo que dice [[260119 - Bare Metal (ATMOS)]]: "IaC for hospitals/defense with on-premise AI, managed remotely."

Un solo proyecto que posiciona para todas las ofertas:

| Recruiter | Lo que ve |
|---|---|
| Palantir | "Este tío ya piensa como un FDE" |
| Schneider Electric | "Este tío habla nuestro idioma" |
| Söderberg | "Este tío ya sabe cómo fallan los agentes" |
| Helsing | Edge deployment sin red |
| Yuma AI | Self-hosting con Kubernetes |
| Fitsoftware | Terraform + observability |
| Hugging Face | Modelo open-source desplegado |

## Arquitectura

```
Sensores industriales (datos)
        ↓
Anomaly detection (determinista - scikit-learn)
        ↓
LLM triage ("el compresor 3 se está degradando")
        ↓
Agente genera fix (script, config change, alerta)
        ↓
Guardrail determinista valida el fix
        ↓
Se despliega en edge/self-hosted (sin depender de cloud)
        ↓
Si no hay red, bufferea y sincroniza después
```

3 capas apiladas:

1. **Percepción + Diagnóstico** — Industrial Anomaly Detection + LLM triage
2. **Acción** — Agent Harness (el agente genera, el guardrail valida)
3. **Despliegue** — Self-Hosting en Edge (funciona sin internet, Kubernetes, resource constraints)

## Stack

| Componente | Herramienta | Coste |
|---|---|---|
| Datos industriales | NASA Bearing Dataset, Kaggle predictive maintenance | Gratis |
| Anomaly detection | scikit-learn, pandas | Gratis |
| LLM triage (dev) | Ollama + Llama 3 local | Gratis |
| LLM triage (demo) | Claude API / OpenAI API | ~$5-10 total |
| Agent harness | Python, código propio | Gratis |
| Kubernetes local | k3s o minikube | Gratis |
| Edge simulation | Docker con resource limits | Gratis |
| Buffer offline | SQLite | Gratis |
| Monitoring | Grafana + Prometheus (Docker) | Gratis |
| IaC | Terraform CLI (open source) | Gratis |
| Cloud deploy (opcional) | Hetzner | 0-20€/mes |
| Artículos | InfraPhysics | Gratis |
| Repo | GitHub | Gratis |

**Total: 5-30€.** Tu portátil es tu edge device. Tu Docker es tu restricción de recursos. Tu WiFi apagado es tu simulación de entorno hostil.

## Timeline — Scope mínimo viable (4 semanas)

- [ ] **Semana 1** — Dataset industrial público + anomaly detection + LLM triage. Output: el sistema detecta anomalías y el LLM genera diagnóstico en lenguaje natural.
- [ ] **Semana 2** — Agent harness: el LLM propone fix (script, config change), guardrail determinista valida antes de ejecutar. Filosofía USB Allocator.
- [ ] **Semana 3** — Dockerizado con resource constraints, self-hosted model (Ollama/vLLM), buffer offline (SQLite). Funciona sin internet.
- [ ] **Semana 4** — Terraform deploy en k3s + Grafana dashboard + artículo resumen InfraPhysics.

## Entregables

- Repo público en GitHub
- 3-4 artículos en InfraPhysics (uno por capa)
- 1 artículo resumen: *"I built an autonomous infrastructure agent that works without internet. Here's what broke."*

## Lo que dice de ti sin que tengas que decirlo

No eres un frontend developer que usa APIs de LLM. No eres un prompt engineer que toca configs. Eres un ingeniero industrial que construye sistemas autónomos que funcionan en el mundo real, donde la red se cae, los sensores mienten, y el LLM alucina — y tu sistema sigue funcionando.

## Open-source ecosystem

ATMOS-1 es el flagship. Estos proyectos complementan:

- [[evalforge]] — evaluación de LLMs para EU AI Act. Rust. El "why" regulatorio.
- [[infraprobe]] — monitorización de data centers. Rust. El "what" de métricas.
- **TensorZero** (contribución, no proyecto propio) — LLM eval/observability en Rust. Recomendado como entry point para aprender Rust: contribuir 4-6 semanas, luego lanzar evalforge.

Estrategia: TensorZero contributions (semanas 1-6) → evalforge como flagship → infraprobe si se va hacia hardware.

t-based data center metrics monitor with API for compute scheduling decisions. Metrics: temperature, power consumption, GPU utilization, PUE. Most niche but strongest for hardware roles (Crusoe, CoreWeave, nVent). Complements ATMOS-1 ([[infraprobe]] monitors, [[atmos-1]] acts).
