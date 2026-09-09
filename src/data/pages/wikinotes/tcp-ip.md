---
slug: tcp-ip
uid: "d0JwXdPu"
address: "networks//network protocols//TCP/IP"
name: "TCP/IP"
date: "2026-09-06"
aliases: ["TCP", "UDP", "IP", "Internet protocol suite"]
---
The Internet stack: **IP** provides addressing and routing, **TCP** and **UDP** are transport protocols on top of it (TCP ordered and reliable with connections, UDP a bare datagram). Together they move bytes between addressed hosts; they say nothing about what the bytes mean.
- That last point is the one automation people insist on: TCP/IP transports data but does not define what each industrial value is. The meaning is the application protocol above, [[F23amQnv|Modbus TCP]], [[rAb5Cn20|OPC UA]], [[9y91dC7S|MQTT]] or [[g9jb8QD1|HTTPS]] ([[uWeRvnh7|protocol stack]]).
- Moving a serial protocol onto TCP/IP changes the transport, not the vocabulary: Modbus TCP keeps Modbus's registers and swaps a serial address for an IP address.
- TCP's reliability comes from retransmission and waiting, which is exactly what a hard real-time loop cannot afford; industrial Ethernet variants that need bounded timing bypass or constrain the TCP/IP path ([[xHZIkyPb|determinism]]).
