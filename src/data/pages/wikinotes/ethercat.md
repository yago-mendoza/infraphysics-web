---
slug: ethercat
uid: "gWjNvMXi"
address: "industrial//industrial Ethernet//EtherCAT"
name: "EtherCAT"
date: "2026-09-06"
aliases: ["Beckhoff network", "processing on the fly"]
---
The industrial Ethernet developed by Beckhoff for extremely fast and deterministic communication: motion control, servos, high-speed machinery.
- Its defining trick: a single frame travels through every node in a chain (master, then servo, then servo, then servo) and each device reads and writes its bytes **on the fly** while the frame passes, instead of receiving, processing and answering it. Latency is measured in microseconds and all nodes share a distributed clock.
- That is what "hyper-deterministic" means in practice, and why it is the network behind coordinated axes and CNC-grade motion ([[fnuKFZ2c|motion control]]).
- The price is a dedicated segment: EtherCAT frames are not routed like normal IP traffic, so the motion network is a separate world from the plant network that carries SCADA, OPC UA and MQTT ([[uWeRvnh7|protocol stack]]).

## Interactions

- [[dOYR97cR|PROFINET]] : : PROFINET keeps each device a normal Ethernet node and schedules around it; EtherCAT turns the chain of devices into one long shift register that a single frame sweeps through. The second is faster and tighter, the first fits better into an ordinary switched plant
- [[d0JwXdPu|TCP/IP]] : : EtherCAT deliberately avoids the TCP/IP path: no addressing per packet, no retransmission, no waiting. It reuses Ethernet frames and discards the Internet stack to buy a bound on timing
