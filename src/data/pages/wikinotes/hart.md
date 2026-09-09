---
slug: hart
uid: "uOw615AL"
address: "industrial//instrumentation//HART"
name: "HART"
date: "2026-09-06"
aliases: ["Highway Addressable Remote Transducer"]
---
**Highway Addressable Remote Transducer** superimposes a digital signal on a traditional [[83sE6PZQ|4-20 mA]] loop. The analog current still carries the primary variable; the digital layer carries configuration, diagnostics, secondary variables and device identification.
- It let plants modernize instrumentation without replacing the wiring: the same two wires, the same PLC analog input for the process value, and a digital conversation for everything else. That is why it was central in the transition from purely analog to intelligent instruments in the 1990s.
- A 1998 HART transmitter is exactly the kind of device a gateway still has to translate today, next to Modbus meters and PROFIBUS devices ([[4jKIn7fG|edge gateway]]).

## Interactions

- [[83sE6PZQ|4-20 mA]] : : HART is the loop plus a second channel on the same wire: the analog current keeps its meaning and its speed, the digital overlay adds slow, rich data. Neither replaces the other, and that coexistence is the whole point
