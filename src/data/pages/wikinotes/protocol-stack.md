---
slug: protocol-stack
uid: "uWeRvnh7"
address: "networks//network theory//protocol stack"
name: "protocol stack"
date: "2026-09-06"
aliases: ["layering", "Ethernet is not a protocol", "digital is not Ethernet"]
---
"It communicates over Ethernet" says much less than it sounds, because a communication is a stack of layers and each layer answers a different question.

{bkqt/keyconcept|One message, several layers}
Application meaning: Modbus, OPC UA, HTTPS, MQTT. What the data means.
Transport: TCP or UDP. Ordering, delivery, ports.
Network: IP. Addressing and routing.
Link: Ethernet, Wi-Fi, RS-485 framing. How neighbors share a medium.
Physical: copper, fiber, radio, 4G. How bits become signals.
{/bkqt}

- [[aHC0Nhas|Ethernet]] is a link technology, not an automation protocol; [[d0JwXdPu|TCP/IP]] transports and addresses data but does not define what an industrial value means. The meaning comes from the top layer: [[DVHQFIq1|Modbus]] as one small vocabulary, [[rAb5Cn20|OPC UA]] as a rich one.
- The same top layer can ride different stacks. OPC UA over TCP/IP over 4G over radio at a remote pipeline station; HTTPS over TCP/IP over Ethernet over fiber in the office. Fiber is a medium, radio is a medium, 4G is a cellular access technology that uses radio, Ethernet is a link technology that can use copper or fiber, IP is the network protocol, TCP and UDP are transports, [[g9jb8QD1|HTTPS]] is HTTP over TLS. They are not alternatives at one level; they stack.
- "Digital is not Ethernet": a digital sensor can speak IO-Link, PROFIBUS, Modbus RTU or CAN with no Ethernet anywhere ([[ctpMShFs|fieldbus]]). And Modbus TCP is the same register vocabulary as Modbus RTU with a different stack underneath.

## Interactions

- [[cgOcsEWf|LAN]] : : The LAN note describes one layer, the local link and its gateway out; the stack view is what tells you that the same LAN can carry Modbus, OPC UA and HTTPS at once and that none of them is "the network"
