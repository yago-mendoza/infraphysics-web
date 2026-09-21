---
type: project-idea
status: concept
created: 2026-08-06
---

# Cyber-physical garage lab

Construir una microplanta autónoma y observable que reproduzca, a escala doméstica, los problemas de sistemas críticos:

```text
máquina física → sensores → protocolos → edge compute → red
→ telemetría → diagnóstico → decisión → actuación segura → verificación
```

Posible planta: circuito de agua o refrigeración con bombas, válvulas, ventiladores, motores y sensores de temperatura, presión, vibración y consumo.

## Capacidades que debe integrar

- PLC o microcontroladores para control determinista.
- Raspberry Pi, Jetson o mini-PC como edge.
- CAN, Modbus, OPC UA, MQTT y Ethernet.
- Prometheus, Grafana u OpenTelemetry; historian o base de series temporales.
- Operación local cuando fallen cloud o red.
- Alarmas, interlocks, estados degradados y parada segura.
- Inyección controlada de fallos: sensor congelado, deriva, packet loss, latencia, bomba degradada o pérdida de alimentación.
- Diagnóstico de causa raíz y mantenimiento predictivo.
- Identidad, segmentación, certificados, actualizaciones y threat model.
- IA subordinada al sistema y comparada con reglas simples o control clásico.

## Proyectos satélite

1. **Banco de motores y vibración:** detectar desalineación, desgaste y anomalías mediante acelerómetros, corriente y temperatura.
2. **Mini data center térmico:** controlar carga, consumo y refrigeración de un pequeño rack.
3. **Rover o robot instrumentado:** deployment, comunicaciones, fleet telemetry, actualizaciones, fallos y operación remota.
4. **Microgrid segura de baja tensión:** solar, batería, cargas, forecasting, control y estados degradados.
5. **Banco edge-cloud resiliente:** operar con pérdida de red, clocks incorrectos, poco ancho de banda y versiones incompatibles.

## Lo que realmente impresiona a una empresa top

No el tamaño del aparato ni una demo vistosa, sino evidencia de que sé:

- formular requisitos, invariantes y criterios de aceptación;
- diseñar arquitectura e interfaces;
- instrumentar el sistema completo;
- provocar fallos de forma controlada;
- medir latencia, disponibilidad y recuperación;
- justificar decisiones y trade-offs;
- comparar control clásico, reglas e IA;
- documentar incidentes y convertirlos en cambios permanentes;
- publicar código, arquitectura, datos y vídeos reproducibles;
- operar y mejorar el sistema durante meses.

El entregable ideal es un único sistema que evolucione durante uno o dos años, acompañado de repositorio, diagramas, vídeos de commissioning, métricas, postmortems y un *failure atlas*. Vale más que muchos prototipos desconectados.

## Herramientas open source

Extraer del laboratorio herramientas pequeñas y reutilizables, en lugar de publicar solamente el proyecto completo:

- inyector de fallos para sensores y telemetría: drift, freeze, ruido, pérdida, duplicación y datos fuera de orden;
- orquestador reproducible de fallos edge-red-cloud: latencia, particiones, clock skew, resource pressure y caída de nodos;
- correlador de eventos que construya una línea temporal entre dispositivo, red, kernel, servicio y actuador;
- librería de instrumentación OpenTelemetry para MQTT, Modbus u OPC UA;
- generador de datasets etiquetados a partir de fault injection controlado;
- comprobador de invariantes, estados degradados e interlocks;
- plantilla abierta para experimentos, postmortems y *failure atlases*.

Cada herramienta debe resolver un problema real encontrado durante la operación, incluir pruebas y ejemplos reproducibles y poder utilizarse fuera de mi propio laboratorio. Publicar pocas herramientas mantenidas y usadas por terceros tiene más valor que abrir muchos repositorios abandonados.

## Posicionamiento demostrado

> No necesito ser el mejor mecánico, roboticista o investigador de ML por separado. Mi especialidad es convertir sus componentes en un sistema físico desplegable, observable, seguro, diagnosticable y recuperable.
