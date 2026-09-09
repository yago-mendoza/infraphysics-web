---
slug: rtu
uid: "3a0xpk7U"
address: "industrial//industrial automation//SCADA//RTU"
name: "RTU"
date: "2026-09-06"
aliases: ["remote terminal unit", "store-and-forward"]
---
A **Remote Terminal Unit** is conceptually like a [[mfLejTTj|PLC]] but built for remote installations: wells, pipelines, electrical substations, water systems, oil and gas.
- Typical traits: remote communications (radio, cellular, satellite), low power, autonomous operation, environmental ruggedness.
- The defining behavior is **store-and-forward**. An RTU is designed for places where the link can drop: it keeps acquiring measurements, stores them locally, and when communication returns it sends the accumulated data. A PLC assumes its network is there; an RTU assumes it sometimes is not.
- The distributed SCADA chain reads, in order: sensors, the RTU, a long-distance link (radio, 4G, fiber), the [[0bRULBNr|master station]], and the [[es6Sv4Zb|SCADA]] on top. A 1,000 km gas pipeline cannot be wired with continuous Ethernet; it gets RTUs at remote stations instead.

## Interactions

- [[mfLejTTj|PLC]] : : Same brain, opposite assumption about the network: the PLC is built to control with the link always present, the RTU to keep measuring and buffering while the link is gone
