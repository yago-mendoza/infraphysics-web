---
slug: industrial-ethernet
uid: "1pkzK8nT"
address: "industrial//industrial Ethernet"
name: "industrial Ethernet"
date: "2026-09-06"
aliases: ["real-time Ethernet", "Ethernet fieldbus"]
---
From about 2000, [[aHC0Nhas|Ethernet]] became dominant in automation as well, but control networks need properties office Ethernet never prioritized: low latency, low jitter, determinism, synchronization, robustness, redundancy. Each vendor ecosystem solved that its own way, which produced a family of incompatible "industrial Ethernets" and the fragmentation that still exists.
- The members, roughly in order of ambition: [[F23amQnv|Modbus TCP]] (plain TCP/IP, simple and interoperable, no real-time machinery), [[1FXDPm6s|EtherNet/IP]] (Rockwell's world, the CIP object model), [[dOYR97cR|PROFINET]] (Siemens's world, an expressive control network with real-time classes), [[gWjNvMXi|EtherCAT]] (Beckhoff's world, hyper-deterministic, built for motion), plus [[iARep0zC|POWERLINK]] and [[bDoQ6dcM|CC-Link IE]] in their own ecosystems.
- The hardware follows: an [[WhD8fGtf|industrial switch]] is chosen for recovery time and synchronization, not for throughput ([[xHZIkyPb|determinism]]).
- What all of them share with the serial [[ctpMShFs|fieldbuses]] is that they carry a control vocabulary; what none of them carries is the semantics a data layer needs, which is why OPC UA and MQTT sit above them rather than replace them ([[KApGpKIt|data]]).

## Interactions

- [[aHC0Nhas|Ethernet]] : : Office Ethernet sells throughput per euro; industrial Ethernet sells a bound on when the frame arrives. Same connector, same frames at the bottom, and a scheduler, a clock and a recovery mechanism on top that the office never needed
