---
slug: automation-pyramid
uid: "WY7g1n8W"
address: "industrial//industrial automation//automation pyramid"
name: "automation pyramid"
date: "2026-09-06"
aliases: ["ISA-95", "Purdue model", "levels 0 to 4"]
---
The classic ISA-95 stack of an industrial plant, from the physical world to the business, one level per kind of decision.

{bkqt/keyconcept|Levels}
Level 0, physical process: temperature, pressure, flow, motors, pumps, valves, tanks.
Level 1, sensors and actuators: transmitters of temperature, pressure, flow, level, proximity and position; motors, valves, servos, contactors, drives.
Level 2, control: PLC, PAC or DCS, where the control logic executes ("if level is above 90 %, close the valve"). The strictest determinism and real-time requirements live here.
Levels 2 to 3, HMI and SCADA: the operator sees the process, changes setpoints, acknowledges alarms, watches trends; SCADA also acquires and aggregates data.
Level 3, MES or MOM: production orders, traceability, batches, quality, OEE, detailed scheduling, consumption, actual output. The bridge between OT and IT.
Level 4, ERP: purchasing, sales, inventory, logistics, finance, business planning.
{/bkqt}

- The one-line summary: the [[o6N4rqGz|ERP]] decides what to make, the [[lrh44ra6|MES]] organizes how to make it, and the [[mfLejTTj|PLC]] or [[7NrcWZUv|DCS]] make it physically happen.
- What each layer is for, in the plant's own words: PLC and DCS are base control; [[es6Sv4Zb|SCADA]] and [[NgpDKDPB|HMI]] are real time, alarms and supervision; MES and MOM are orders, traceability, quality and productivity; ERP is finance, purchasing, sales, logistics and HR. That last level is the corporate one.
- The whole story of industrial digitalization is getting data to climb from the bottom without turning the architecture into chaos: the modern version inserts an edge and a data layer between control and the upper levels ([[KApGpKIt|data]]).
