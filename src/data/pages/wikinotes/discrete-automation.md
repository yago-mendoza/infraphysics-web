---
slug: discrete-automation
uid: "pHiCzY68"
address: "industrial//industrial automation//discrete automation"
name: "discrete automation"
date: "2026-09-06"
aliases: ["machine automation", "factory automation"]
---
Automation of things that happen in countable events: automotive, packaging, logistics, assembly, machines. A part is present, a robot acts, the conveyor advances, the part leaves. Each step is a clearly defined event and the logic is a sequence of conditions.
- [[mfLejTTj|PLCs]] dominate this world: Ladder logic was invented for exactly this kind of interlocked sequence ([[nnXbK36S|IEC 61131-3]]).
- The machine is often delivered whole by an [[pC4MKpUX|OEM]] with its own controller, sensors, actuators and [[NgpDKDPB|HMI]], and then has to be integrated with the plant. That is where a lot of interoperability trouble is born.
- Where discrete becomes demanding: coordinated axes, servos and robots, which push the timing requirement from "milliseconds" to "synchronized microseconds" ([[fnuKFZ2c|motion control]]).

## Interactions

- [[fYkOo9I6|process automation]] : : Discrete automation reasons in events and states (part present, cycle complete); process automation reasons in continuous variables held at setpoints. The first is a sequence problem, the second a regulation problem, and the tooling split (PLC versus DCS) follows that line
