---
slug: ethernet-ip
uid: "1FXDPm6s"
address: "industrial//industrial Ethernet//EtherNet/IP"
name: "EtherNet/IP"
date: "2026-09-06"
aliases: ["CIP", "Common Industrial Protocol", "Rockwell network"]
---
The industrial Ethernet of the Rockwell Automation ecosystem. The name does not mean "Ethernet over IP": it is **EtherNet Industrial Protocol**, and the protocol carried is **CIP**, the Common Industrial Protocol.
- CIP gives it an object model far richer than a Modbus register map: devices expose typed objects, attributes and services, so a drive or an I/O module is described, not just addressed ([[DML5M3qP|register map]]).
- It runs on standard [[d0JwXdPu|TCP/IP]] and UDP over ordinary Ethernet, with implicit cyclic I/O messaging for control and explicit messaging for configuration; time-critical variants add synchronization for motion.
- Choosing it is usually choosing the ecosystem: Allen-Bradley PLCs, PowerFlex drives, and the integrators who know them ([[Xu7qzqlL|automation vendor]]).

## Interactions

- [[dOYR97cR|PROFINET]] : : Two answers to the same problem from the two largest vendors: EtherNet/IP keeps standard TCP/IP and puts richness in the CIP object model; PROFINET reshapes the Ethernet layer itself to win determinism. A plant rarely runs both on the same machine, and a gateway is how they meet
