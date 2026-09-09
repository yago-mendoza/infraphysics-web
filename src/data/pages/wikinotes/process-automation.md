---
slug: process-automation
uid: "fYkOo9I6"
address: "industrial//industrial automation//process automation"
name: "process automation"
date: "2026-09-06"
aliases: ["continuous process", "continuous processing"]
---
Automation of processes whose variables change continuously: oil and gas, chemicals, power, water treatment. Pressure, temperature, level and flow are regulated rather than sequenced.
- The task is to hold many interacting variables at their setpoints at once (pressure at 5 bar, level at 65 %, temperature at 180 degrees, flow at 200 t/h), which means tens to thousands of control loops, mostly PID, managed as a whole. This is the home ground of the [[7NrcWZUv|DCS]].
- The field side is instrumentation rather than switches: transmitters on [[83sE6PZQ|4-20 mA]] and [[uOw615AL|HART]], valves as actuators, and long plant lifetimes that keep several generations of instruments alive together ([[vthpJTg1|instrumentation]]).
- A geographically spread process (a pipeline, a water network) adds the remote layer: [[3a0xpk7U|RTUs]] and a [[es6Sv4Zb|SCADA]] center instead of a wired plant network.

## Interactions

- [[5zL83qyU|feedback control]] : : The control note treats one loop with one plant; process automation is what that loop looks like multiplied by a thousand and coupled through the same fluid, where alarm management and loop interaction matter more than any single gain
