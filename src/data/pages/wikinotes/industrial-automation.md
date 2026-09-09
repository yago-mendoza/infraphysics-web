---
slug: industrial-automation
uid: "mckHgOqe"
address: "industrial//industrial automation"
name: "industrial automation"
date: "2026-09-06"
distinct: ["blockchain//Besu//automation"]
---
A modern plant is three superimposed systems: the **physical process** (materials, machines, energy), the **information flow** (what the plant is doing: states, alarms, production, temperatures, orders) and the **capital flow** that keeps it alive (buying equipment, paying maintenance, spares, upgrades, contracting integrators). Studying PLCs and protocols is not enough; who buys from whom and who has access to which data is part of the system ([[nLtOMdEo|ecosystem]]).
- The automation system exists to turn the physical state of the plant into digital information, take control decisions, and hand data upward. The layers, from the field to the business, are the [[WY7g1n8W|automation pyramid]]: sensors and actuators, then [[mfLejTTj|PLC]] or [[7NrcWZUv|DCS]], then [[NgpDKDPB|HMI]] and [[es6Sv4Zb|SCADA]], then [[lrh44ra6|MES]], then [[o6N4rqGz|ERP]].
- Two worlds share those layers: [[pHiCzY68|discrete automation]] (machines, events, PLCs) and [[fYkOo9I6|process automation]] (continuous variables, loops, DCS). What both demand from the control layer is determinism.

{bkqt/keyconcept|Evolution, roughly}
1970s to 1990s: analog signals, serial buses, Modbus, DCS.
1990s to 2000: fieldbus, HART, PROFIBUS, CAN.
2000 to 2015: industrial Ethernet (PROFINET, EtherNet/IP, EtherCAT), OPC.
2015 to today: OPC UA, MQTT, IIoT, edge, cloud, time-series databases.
Now: data contextualization, unified namespace, edge analytics, industrial AI.
{/bkqt}

- New does not replace old. A real plant usually contains every one of those generations at the same time, and the digitalization job is to lay a coherent data layer over all of them ([[KApGpKIt|data]], [[ctpMShFs|fieldbus]], [[1pkzK8nT|industrial Ethernet]], [[vthpJTg1|instrumentation]]).
- The thread through the whole subject: automation first solved deterministic physical control, then had to solve interoperability, and now tries to solve contextualization and mass exploitation of data, while carrying forty years of PLCs, buses, DCSs, OEM machines, contracts and proprietary systems that cannot simply be thrown away. That tension explains almost every concept in this tree.

## Interactions

- [[QCZzt6BG|Industrial]] : : The Industrial root is about throughput, variability and bottlenecks; automation is the machinery that measures and acts on the process, and the data layer that lets those operational questions be asked at all
- [[38QY7o3A|Control]] : : Control theory designs the loop; industrial automation is where the loop runs on a PLC or DCS with a scan time, an I/O card, a network and a maintenance contract attached
