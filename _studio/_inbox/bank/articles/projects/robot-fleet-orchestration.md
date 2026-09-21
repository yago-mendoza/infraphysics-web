---
date: 2026-08-01
updated: 2026-08-01
type: project-idea
status: discovery
topic: robot-fleet-orchestration
related:
  - "[[Horizon]]"
  - "[[InfraPhysics Blueprint — un núcleo técnico, muchas misiones]]"
---

# Robot Fleet Orchestration — una flota que construye y opera un territorio

## Temática

Investigar y prototipar la capa de inteligencia operacional que convierte robots heterogéneos en una flota coordinada. El foco no es diseñar el robot individual, sino comprender una misión y controlar el sistema colectivo:

- representación del territorio y estado compartido;
- descomposición y asignación de tareas;
- routing, scheduling y restricciones de energía/recursos;
- coordinación y prevención de conflictos;
- comunicaciones intermitentes y operación edge;
- robots heterogéneos con capacidades distintas;
- fallos, relevo, rescate y replanificación;
- observabilidad y explicación del estado de la misión;
- human-on-the-loop, permisos, override y responsabilidad;
- simulación y digital twin antes del despliegue físico.
- ciclo de vida: fabricación, commissioning, mantenimiento, reparación, reconfiguración y reciclaje;
- conexión entre la flota y los **Cauldrons** o células autónomas que producen nuevas máquinas.

La referencia visual es *Horizon Zero Dawn*: los Cauldrons como fábricas autónomas conectadas con las flotas y con las necesidades del territorio. El proyecto estudiará la versión industrial y gobernable de esa idea.

## Pregunta de proyecto

> ¿Cómo diseñar una capa de orquestación que asigne, supervise y replantee el trabajo de una flota heterogénea de robots constructores cuando cambian el terreno, los recursos, las comunicaciones o el estado de las máquinas?

## Primera misión posible

Simular una flota que prepara y mantiene una instalación remota:

1. robots exploradores cartografían el terreno;
2. excavadores y transportistas preparan el emplazamiento;
3. robots constructores ensamblan infraestructura;
4. inspectores verifican calidad y detectan daños;
5. el orquestador reasigna trabajo ante averías, batería baja, bloqueo de rutas o pérdida de comunicación;
6. un operador humano observa la misión, aprueba acciones de riesgo y puede intervenir.

La primera versión debe vivir en simulación. El valor inicial está en la arquitectura de coordinación, las restricciones y la evaluación, no en comprar hardware.

## Research inicial

- [ ] Investigar cómo funciona hoy la gestión de flotas de robots: arquitecturas centralizadas, descentralizadas e híbridas; software y estándares; asignación multi-robot; interoperabilidad; observabilidad; seguridad; human oversight; casos industriales y principales limitaciones abiertas.

### Entregable del research

Un mapa del estado actual que responda:

1. ¿Qué capas componen hoy un fleet manager real?
2. ¿Qué resuelven los productos existentes y qué sigue siendo custom?
3. ¿Cómo coordinan flotas homogéneas frente a robots de fabricantes y funciones distintas?
4. ¿Qué ocurre cuando fallan red, localización, energía, robot o plan?
5. ¿Qué decisiones conserva el humano y cómo se implementa el override?
6. ¿Qué simuladores, middleware, protocolos y datasets permitirían construir un MVP?
7. ¿Qué scar tissue y señal profesional produciría este proyecto?
8. ¿Cómo conectar fleet management con MES, digital twins, mantenimiento y fabricación robotizada?
9. ¿Cómo representar un Cauldron que fabrique, repare o reconfigure robots según las necesidades de la misión?

## Regla de alcance

No intentar resolver swarm intelligence general ni construir robots propios en la primera iteración. Elegir una misión, pocos tipos de robot, restricciones observables y fallos inyectables. El MVP debe permitir demostrar y medir que la flota termina mejor la misión gracias a la orquestación y al control humano.
