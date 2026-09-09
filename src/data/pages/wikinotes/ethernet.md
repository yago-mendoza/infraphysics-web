---
slug: ethernet
uid: "aHC0Nhas"
address: "networks//network protocols//Ethernet"
name: "Ethernet"
date: "2026-09-06"
aliases: ["IEEE 802.3", "Ethernet switch"]
---
The dominant wired link technology: frames between neighbors on a shared or switched medium, over copper or fiber. Ethernet is **not** an automation protocol; it is the layer many protocols ride on ([[uWeRvnh7|protocol stack]]).
- On top of it travel [[d0JwXdPu|TCP/IP]] and, on top of that, Modbus TCP, EtherNet/IP, PROFINET, OPC UA or MQTT. Saying a device "has Ethernet" says which connector it has, not what it can say.
- From about 2000 Ethernet became dominant in factories too, but office Ethernet never prioritized low latency, low jitter, synchronization or fast recovery. The industrial variants that add those properties are a family of their own ([[1pkzK8nT|industrial Ethernet]]), and the office switch and the plant switch are different products ([[WhD8fGtf|industrial switch]]).
- Many digital field devices have no Ethernet at all and speak serial buses instead ([[PrYQJgli|RS-485]], [[giue07uO|CAN]]).
