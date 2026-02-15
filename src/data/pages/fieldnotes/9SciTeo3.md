---
uid: "9SciTeo3"
address: "ARM//Cortex-R"
name: "Cortex-R"
date: "2026-02-05"
---
- ARM's real-time profile [[Z9W6rweD|core]] family — deterministic, low-latency execution for safety-critical systems
- Found in automotive ECUs (braking, airbags), hard-drive controllers, and baseband modems
- Features tightly-coupled memory, dual-core lockstep (fault detection), and fast interrupt response
- Runs bare-metal or RTOS, not Linux
- Bridges the gap between [[OQmzx1Vg|Cortex-M]] and [[7wngT1lE|Cortex-A]]
- LOCKSTEP: two identical cores run the same instructions and cross-check; any mismatch triggers a fault
- Zero jitter; applications: ABS brakes, airbags, flight control, dialysis machines
- Does not support a full OS; bare-metal or RTOS only
