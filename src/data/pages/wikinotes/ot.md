---
slug: ot
uid: "1MdZnnvZ"
address: "industrial//industrial automation//OT"
name: "OT"
date: "2026-09-06"
aliases: ["operational technology", "OT versus IT", "IT/OT convergence"]
---
**Operational Technology** is everything that physically controls the process: [[mfLejTTj|PLC]], [[7NrcWZUv|DCS]], [[es6Sv4Zb|SCADA]], sensors, drives, robots. Its priorities are safety, availability, determinism and continuity of production.
- **IT** processes business information: servers, cloud, [[o6N4rqGz|ERP]], analytics, databases. Its priorities are data, scalability, integration and applications.
- Industrial digitalization is largely the job of connecting OT and IT correctly without destroying the properties OT needs. The connection point is the [[4jKIn7fG|edge gateway]], which speaks industrial protocols on one side and IT languages on the other, and the data layer built on [[rAb5Cn20|OPC UA]] and MQTT.
- The two cultures also differ in time: an IT system is upgraded every few years, an OT system runs for fifteen to thirty ([[o0FC5b14|aftermarket]]), so the boundary always has legacy on the OT side ([[3xSClPzE|data contextualization]]).

## Interactions

- [[Tm6yRs2K|edge computing]] : : The infrastructure note treats edge as "compute placed near the data"; in a plant the edge is first of all the border between two organizations with opposite priorities, OT (never stop) and IT (always change), and the gateway that sits on it
