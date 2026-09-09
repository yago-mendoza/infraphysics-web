---
slug: opc
uid: "huvjy4f0"
address: "industrial//industrial data layer//OPC"
name: "OPC"
date: "2026-09-06"
aliases: ["OPC Classic", "OPC DA", "OPC server"]
---
One of the historic problems of automation was that every vendor exposed its data differently, so a SCADA would have needed to implement every industrial protocol. **OPC** appeared as a standard interface to industrial data: the vendor or integrator implements an OPC server for the PLC, and the SCADA, MES or historian talk OPC to that server instead of the proprietary protocol.
- The original OPC, now called OPC Classic, and its data-access profile **OPC DA** were tied to Microsoft COM and DCOM. It worked on Windows and suffered exactly the problems of that dependency: Windows only, painful DCOM configuration, weak security, firewalls and interoperability. "Windows old" is a fair summary.
- Its successor, [[rAb5Cn20|OPC UA]], dropped COM/DCOM and added an information model. The idea of a server in front of the controller survived both generations, and it is now also a role of the [[4jKIn7fG|edge gateway]].

## Interactions

- [[es6Sv4Zb|SCADA]] : : SCADA is the consumer OPC was invented for: one driver instead of a driver per PLC brand. Without OPC the SCADA vendor owned the protocol problem; with it, the PLC vendor does
