---
slug: instrumentation
uid: "vthpJTg1"
address: "industrial//instrumentation"
name: "instrumentation"
date: "2026-09-06"
aliases: ["field instruments", "transmitters"]
---
The field devices that measure the process and the signals they deliver: transmitters of temperature, pressure, flow and level, and the analog or digital path that carries their value to the controller.
- The classic path is a current loop, [[83sE6PZQ|4-20 mA]], where the sensor hands over a single magnitude and all the meaning lives in the PLC. [[uOw615AL|HART]] adds a digital conversation on top of that same loop; a [[uuLCFmtk|smart sensor]] replaces the loop with a digital protocol and hands over state, diagnostics and identity as well.
- Instruments outlive everything around them. A plant mixes a 1998 HART transmitter, a 2003 Modbus meter and a 2006 PROFIBUS device with a modern PLC, and digitalization means translating all of them into one vocabulary ([[3xSClPzE|data contextualization]]).
