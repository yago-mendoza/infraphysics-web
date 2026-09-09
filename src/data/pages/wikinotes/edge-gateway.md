---
slug: edge-gateway
uid: "4jKIn7fG"
address: "industrial//industrial data layer//edge gateway"
name: "edge gateway"
date: "2026-09-06"
aliases: ["OT/IT gateway", "protocol gateway", "edge node"]
---
The device that sits on the border between OT and IT. It speaks industrial protocols on one side (Modbus, PROFINET, EtherNet/IP, OPC UA toward the PLCs) and IT languages on the other (MQTT, OPC UA server, REST toward applications and cloud): a translator and a concentrator.
- What it can do: read PLCs, translate protocols, normalize tag names and units, run logic, buffer data locally, filter, aggregate, run analytics or models, publish MQTT, act as an OPC UA server. A common chain is a Siemens PLC read over OPC UA, the gateway, MQTT, the cloud.
- It is the practical answer to the legacy problem: a 1998 HART transmitter, a 2003 Modbus meter and a 2006 PROFIBUS DCS all end up as nodes in one OPC UA or MQTT namespace because the gateway did the translation ([[3xSClPzE|data contextualization]]).
- Buffer plus local analysis plus cleaning: if the Internet drops, the PLC keeps producing, the gateway keeps storing, and when the link returns it forwards the backlog. It also removes noise, averages, detects outliers, reduces sampling frequency, converts units and enriches tags, so that not every raw sample has to go up. When it runs models on images and PLC signals it becomes [[sfCH7K8e|edge AI]].
- Edge is hardware plus software: the box is an [[iJg3vN8L|industrial PC]] or a dedicated gateway, but the value is in the drivers, the OPC UA and MQTT stacks, containers, analytics, security and remote management ([[Tm6yRs2K|edge computing]]).

## Interactions

- [[uMaVCTAm|Gateway]] : : A network gateway is a first hop that forwards packets it does not understand; an edge gateway is a translator that has to understand every byte, because it turns a Modbus register into a named, typed, timestamped value on the other side
- [[Tm6yRs2K|edge computing]] : : Infrastructure edge asks where compute should run for latency; the plant edge gateway is also a protocol border, a buffer for when the link dies and the place where two organizations with opposite priorities meet. Proximity is the smaller part of its job
- [[3a0xpk7U|RTU]] : : The RTU buffers measurements for a control center over a bad link; the edge gateway buffers for IT and the cloud. Same store-and-forward reflex, one aimed at operating the process, the other at exploiting its data
