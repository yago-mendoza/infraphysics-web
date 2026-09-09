---
slug: modbus-tcp
uid: "F23amQnv"
address: "industrial//fieldbus//Modbus//Modbus TCP"
name: "Modbus TCP"
date: "2026-09-06"
aliases: ["Modbus over Ethernet"]
---
[[DVHQFIq1|Modbus]] carried over [[d0JwXdPu|TCP/IP]], normally on [[aHC0Nhas|Ethernet]]. The register vocabulary is unchanged; what changes is the transport: devices are identified by IP address instead of a serial address and can sit behind ordinary switches with many other hosts.
- It is the simplest member of the industrial Ethernet family, and its advantage is exactly that: simplicity and interoperability. Almost everything can speak it.
- It offers none of the sophistication of the control-grade networks: no object model, no scheduled real-time traffic, no device diagnostics. For a drive or a remote I/O rack under a PLC, [[dOYR97cR|PROFINET]] or [[1FXDPm6s|EtherNet/IP]] are the usual choice; for reading a meter, Modbus TCP is enough ([[1pkzK8nT|industrial Ethernet]]).

## Interactions

- [[n7tNr1L0|Modbus RTU]] : : Same registers, same function codes, different wire: RTU addresses a device by a number on a shared serial bus, TCP by an IP on a switched network. A gateway that maps one onto the other changes nothing in the meaning of the data
