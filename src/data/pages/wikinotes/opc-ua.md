---
slug: opc-ua
uid: "rAb5Cn20"
address: "industrial//industrial data layer//OPC//OPC UA"
name: "OPC UA"
date: "2026-09-06"
aliases: ["OPC Unified Architecture", "information model"]
---
**OPC Unified Architecture** is the modern evolution of [[huvjy4f0|OPC]]: platform independent, no COM/DCOM, no Windows requirement, with built-in security (certificates, encryption, authentication) and, above all, an **information model**: objects, variables, methods and hierarchies with semantics.

{bkqt/keyconcept|What Modbus can say and what OPC UA can say}
Modbus: register 40123 = 72.4.
OPC UA: Boiler1 has a Temperature whose Value is 72.4, Unit is degrees Celsius, Quality is Good and Timestamp is such-and-such; Compressor_17 exposes Speed, Temperature, State, Manufacturer and a Start() method.
{/bkqt}

- That richness is the difference between a number and a datum, and it is why OPC UA is central to digitalization: a consumer can browse a server and discover what exists, with units and types, instead of reading a [[DML5M3qP|register map]].
- It runs over [[d0JwXdPu|TCP/IP]] and so over any stack, including 4G and radio at a remote station ([[uWeRvnh7|protocol stack]]). Modern PLCs embed an OPC UA server; a legacy plant gets one from the [[4jKIn7fG|edge gateway]], which reads Modbus, HART and PROFIBUS and exposes them as OPC UA nodes.
- Its natural partner rather than rival is [[JS0lHIsn|MQTT in the plant]]: OPC UA describes and serves data, MQTT distributes it; a common pattern publishes OPC UA structured payloads over MQTT.

## Interactions

- [[DVHQFIq1|Modbus]] : : Modbus moves a raw number to a numeric address and leaves the meaning in a PDF; OPC UA moves a named, typed, timestamped node with its quality. One is a wire, the other is a description. Forty years apart, and both alive in the same cabinet
- [[OXNcf33H|Configurable Data Model]] : : A schema-driven data model in software and the OPC UA information model solve the same problem in different worlds: make the structure of the data discoverable by the consumer instead of hard-coding it. OPC UA is that idea applied to boilers and compressors
