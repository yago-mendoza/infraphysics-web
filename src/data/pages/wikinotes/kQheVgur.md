---
uid: "kQheVgur"
address: "Hardware//electronics"
name: "electronics"
date: "2026-02-15"
---

Electronics controls energy and information by arranging physical components into circuits. The abstraction looks digital at the software boundary, but underneath it is voltage, current, charge, heat, noise, and timing.

- [[hjMUh5ut|Semiconductors]] provide controllable switches; passive [[funjp65c|components]] shape and store signals; the [[26t2rDup|PCB]] turns the schematic into a physical electromagnetic object.
- A schematic describes intended connectivity. The manufactured circuit also contains unintended resistance, capacitance, inductance, coupling, and thermal paths. At sufficient speed, the drawing stops being the system.
- Most mysterious hardware bugs live at interfaces: power delivery, grounding, clocks, connectors, and assumptions crossing between analog and digital domains.

The useful mental shift is that software asks whether a bit is 0 or 1; electronics asks whether a noisy voltage becomes the correct bit before the clock samples it.
