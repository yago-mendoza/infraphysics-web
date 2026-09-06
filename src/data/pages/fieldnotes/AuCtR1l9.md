---
uid: "AuCtR1l9"
address: "ML//agent//autoregressive control"
name: "Autoregressive control"
date: "2026-09-03"
---

Un modelo autoregresivo general tiene una propiedad bastante extraña si vienes de software tradicional: su comportamiento no está cableado en una secuencia fija de operaciones. Token tras token puede representar código, explicación, una consulta, una tool call, una revisión del plan, un error, otra búsqueda o una decisión de detenerse. Planificación, código, selección de herramientas y lenguaje comparten el mismo canal de salida, de modo que buena parte de la branching policy emerge durante la inferencia en vez de estar escrita como otra rama `if`.

Eso es caro, probabilístico y difícil de verificar, pero explica una parte enorme de la flexibilidad de los agentes. El harness no elimina esa flexibilidad. Le da una física: convierte algunas secuencias simbólicas en observaciones y otras en acciones reales.

## Interactions

- [[Ar7mK4nQ|autoregressive generation]] : : Sequential token generation becomes a general control channel when tokens can express tool calls and stopping decisions
- [[HaRn3sA1|agent harness]] : : The harness gives executable semantics and physical limits to the model's symbolic control stream
