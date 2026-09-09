---
slug: master-station
uid: "0bRULBNr"
address: "industrial//industrial automation//SCADA//master station"
name: "master station"
date: "2026-09-06"
aliases: ["MTU", "master terminal unit", "operating center"]
---
The central end of a distributed SCADA: the **Master Terminal Unit** or master station coordinates acquisition from the [[3a0xpk7U|RTUs]] and sends commands back to them. Supervision is built on top of it.
- The **operating center** is where operators drive the process from screens, alarms, histories and the setpoints they are authorized to change. It is a different function from the [[O59rx1hI|engineering station]], where engineers change configuration and logic; both can sit in the same building and must still be kept apart.
- Between an RTU and the master station the stack can be assembled from different layers: OPC UA over TCP/IP over 4G over radio, or HTTPS over TCP/IP over Ethernet over fiber. Saying "it communicates over Ethernet" says much less than it sounds (protocol layering).
