---
slug: modbus-rtu
uid: "n7tNr1L0"
address: "industrial//fieldbus//Modbus//Modbus RTU"
name: "Modbus RTU"
date: "2026-09-06"
aliases: ["serial Modbus"]
---
[[DVHQFIq1|Modbus]] over a serial line, normally [[PrYQJgli|RS-485]]. One master and several devices share the bus in a chain, each with a Modbus address; the master polls them in turn.
- RS-485 defines the electrical link (the differential A and B pair, the multidrop wiring); Modbus RTU defines how the messages are structured on it, with a compact binary frame and a CRC. Two standards, two layers ([[uWeRvnh7|protocol stack]]).
- It is the form Modbus takes on the oldest and cheapest equipment in a plant, and the reason a "digital" 2003 meter has no IP address ([[ctpMShFs|fieldbus]]).
