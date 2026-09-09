---
slug: plc
uid: "mfLejTTj"
address: "industrial//industrial automation//PLC"
name: "PLC"
date: "2026-09-06"
aliases: ["programmable logic controller", "PAC"]
---
A **Programmable Logic Controller** is an industrial computer built to control machines and processes. Its architecture is a CPU, memory, inputs, outputs and communications: inputs receive information from sensors, outputs drive actuators.
- A complete automated machine in one line of reasoning: sensors feed the PLC, the PLC runs its logic, outputs act, and for a motor an output usually commands a [[keWFUA5P|variable frequency drive]] rather than the motor directly. The PLC decides what should happen; the drive solves the electrical control of the motor.
- The logic runs in a fixed loop, the [[KgAxnFjV|scan cycle]], written in one of the [[nnXbK36S|IEC 61131-3]] languages: Ladder for relay-like discrete logic, Function Block Diagram for process and control, Structured Text for algorithms.
- A PLC is not a PC that "will do it when it has time". It executes logic with bounded timing, in milliseconds; for a machine it matters to know that a condition will get its response within a known interval. That is the meaning of determinism and the reason classic automation behaves so predictably.
- PLCs dominate [[pHiCzY68|discrete automation]]. In large continuous processes the same role is played, in an integrated way, by a [[7NrcWZUv|DCS]]. Toward the plant, the PLC talks fieldbuses and industrial Ethernet; toward the data layer, gateways and OPC servers read its tags.
- A PLC is also a subsystem's boss, not its servant: a [[hgytSVXF|robot controller]] receives high-level commands from it (start program 17, part available, safe zone) and solves its own kinematics inside.

## Interactions

- [[8dk62Xwk|Robotics]] : : Robotics notes describe sensors feeding an MCU that feeds an MPU; a PLC is the industrial form of that loop, with rugged I/O cards, a scan time and programs an electrician can read
