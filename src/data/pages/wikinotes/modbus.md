---
slug: modbus
uid: "DVHQFIq1"
address: "industrial//fieldbus//Modbus"
name: "Modbus"
date: "2026-09-06"
aliases: ["Modbus protocol", "master/slave", "client/server"]
---
One of the oldest and simplest industrial protocols, born in the late 1970s, and immortal because it is simple. One device asks and another answers: traditionally master and slave, today client and server.

{bkqt/keyconcept|A Modbus frame, conceptually}
Who: the address of the device being asked.
What operation: the function code (read holding registers, write coil, and so on).
What data: the starting register and how many.
{/bkqt}

- Everything the protocol knows is areas of memory: coils, discrete inputs, input registers, holding registers. It carries numbers and almost no semantics; the meaning of register 40015 is in the vendor's [[DML5M3qP|register map]], which is why the manual is not optional.
- Two transports, one vocabulary: [[n7tNr1L0|Modbus RTU]] over a serial [[PrYQJgli|RS-485]] bus with device addresses, and [[F23amQnv|Modbus TCP]] over TCP/IP with IP addresses and Ethernet switches. Changing the transport does not change what the registers mean ([[uWeRvnh7|protocol stack]]).
- Its simplicity is also its ceiling: no data model, no units, no quality, no timestamps, no events. Reading a device is what it does; distributing data between systems is what MQTT does, and describing data is what OPC UA does ([[JS0lHIsn|MQTT]], [[rAb5Cn20|OPC UA]]).

## Interactions

- [[giue07uO|CAN]] : : Modbus is one master asking one device at a time; CAN is every node announcing to all with priorities settled on the wire. Same cable class, opposite conversation shape, and the reason CAN owns vehicles while Modbus owns instruments
- [[WlyXzixc|REST]] : : Both are request-response, and both push the meaning of the payload onto documentation the protocol does not carry: a REST endpoint's schema and a Modbus register map play the same role, forty years apart
