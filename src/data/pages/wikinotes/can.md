---
slug: can
uid: "giue07uO"
address: "networks//network protocols//CAN"
name: "CAN"
date: "2026-09-06"
aliases: ["Controller Area Network", "CAN bus", "CAN-H CAN-L"]
---
**Controller Area Network** is a shared bus where intelligent nodes exchange messages identified by a **CAN ID**, born to connect the electronic controllers of a vehicle. Intelligence is already distributed in the nodes; there is no master reading everyone.
- A node publishes a frame with an identifier; every node on the bus sees it and the interested ones read it. Conceptually close to [[I87NKxE8|publish-subscribe]], although CAN is not MQTT: there is no broker, the bus itself is the medium, and the identifier doubles as the priority.
- Physically it is a differential pair, CAN High and CAN Low, terminated at both ends, robust against noise. Collisions are resolved by [[RE6GdytM|arbitration]] on the identifier bits, which gives efficient real-time behavior for embedded systems. [[Qs03T05L|J1939]] is the higher-level protocol used on top of it in heavy vehicles and machinery.
- Against a request-response fieldbus: in Modbus a PLC reads devices one by one; in CAN multiple controllers share messages on the bus. CAN is the natural fit for distributed systems with many peer nodes ([[DVHQFIq1|Modbus]]).
