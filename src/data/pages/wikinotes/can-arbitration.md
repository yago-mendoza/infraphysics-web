---
slug: can-arbitration
uid: "RE6GdytM"
address: "networks//network protocols//CAN//CAN arbitration"
name: "CAN arbitration"
date: "2026-09-06"
aliases: ["bitwise arbitration", "non-destructive arbitration"]
---
How [[giue07uO|CAN]] resolves two nodes starting to transmit at the same instant: both send their identifier bit by bit, a dominant bit wins over a recessive one, and the node that sees the bus differ from what it sent backs off. The frame with the highest priority (the lowest identifier) continues **without being destroyed**; the loser retries afterwards.
- No collision is wasted and no central arbiter exists: priority is a property of the message, decided on the wire, in the time of one identifier. That is why CAN behaves so well in real-time embedded systems with many nodes.
- Contrast with classic shared Ethernet, where a collision destroys both frames and both wait a random time, and with a polled bus such as Modbus RTU, where the master decides who speaks by asking.
