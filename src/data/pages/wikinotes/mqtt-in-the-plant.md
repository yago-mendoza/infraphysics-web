---
slug: mqtt-in-the-plant
uid: "JS0lHIsn"
address: "industrial//industrial data layer//MQTT in the plant"
name: "MQTT in the plant"
date: "2026-09-06"
distinct: ["networks//network protocols//MQTT"]
aliases: ["MQTT at OT/IT boundary", "Sparkplug"]
---
How [[9y91dC7S|MQTT]] is used on the OT/IT boundary: a PLC or, more often, an [[4jKIn7fG|edge gateway]] publishes plant data to a [[dDjuFJ6w|broker]], and SCADA, MES, historian, analytics and cloud each subscribe. Telemetry and events, pub/sub on TCP/IP.
- The producer does not need to know its consumers. A new analytics tool is a new subscription, not a new connection to the PLC; that decoupling is what lets a plant add consumers without touching control ([[I87NKxE8|publish-subscribe]]).
- Division of labor with the fieldbuses: Modbus, PROFINET and friends read and write devices; MQTT distributes information between systems. A sound architecture is PLC on a fieldbus, gateway in the middle, MQTT toward IT and the cloud. MQTT was never meant to move a robot axis ([[DVHQFIq1|Modbus]]).
- The [[aCxOsap9|topic tree]] becomes the plant's addressing scheme (factory, line, machine, signal), and with a shared payload convention such as Sparkplug it grows into a unified namespace ([[3xSClPzE|data contextualization]]). Brokers can be on premises, hosted, bridged and redundant; store-and-forward at the gateway covers link outages.

## Interactions

- [[rAb5Cn20|OPC UA]] : : OPC UA is a server you browse and query, MQTT is a stream you subscribe to. The first tells you what the data means, the second gets it to everyone cheaply. Plants that pick one over the other usually end up carrying OPC UA payloads inside MQTT topics
