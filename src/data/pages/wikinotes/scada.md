---
slug: scada
uid: "es6Sv4Zb"
address: "industrial//industrial automation//SCADA"
name: "SCADA"
date: "2026-09-06"
aliases: ["supervisory control and data acquisition"]
---
**Supervisory Control And Data Acquisition** does two things: supervision and data acquisition. It receives information from PLCs, RTUs and other equipment and lets people see states, show alarms, keep histories, send setpoints, plot trends and operate processes remotely.
- Its native question is "what is the state of the plant now?": motor on or off, level 73 %, alarm active, valve open. That present-tense focus is also its limit: SCADA data are not automatically contextualized for finance, logistics, maintenance, analytics or benchmarking, which is how a plant ends up with data silos ([[3xSClPzE|data contextualization]]).
- It serves both factories and geographically distributed infrastructure: electricity, water, gas and oil pipelines. In the distributed case the field side is an [[3a0xpk7U|RTU]] and the center is a [[0bRULBNr|master station]], joined by radio, cellular, fiber or satellite.
- A SCADA should not execute the fast, critical control. That stays in the [[mfLejTTj|PLC]] or [[7NrcWZUv|DCS]]; SCADA supervises. The operator's screen is the [[NgpDKDPB|HMI]], which can be part of a SCADA or a local panel on a machine.
- Historically each PLC vendor exposed data its own way, so a SCADA would have needed a driver per protocol. The OPC layer was created to give it one interface instead ([[huvjy4f0|OPC]]).

## Interactions

- [[7NrcWZUv|DCS]] : : SCADA supervises controllers that stay autonomous; a DCS is control and supervision designed as one system. Lose the SCADA and the PLCs keep running; a DCS operator station is part of the control system itself
