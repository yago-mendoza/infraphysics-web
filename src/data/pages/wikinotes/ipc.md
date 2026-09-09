---
slug: ipc
uid: "iJg3vN8L"
address: "industrial//industrial data layer//IPC"
name: "IPC"
date: "2026-09-06"
aliases: ["industrial PC", "N IPCs"]
---
An **Industrial PC**: a ruggedized computer, fanless, DIN-rail or panel mounted, rated for cabinet temperatures and vibration, that runs the software of the edge. It is the usual hardware of an [[4jKIn7fG|edge gateway]] and of [[sfCH7K8e|edge AI]].
- A large plant distributes many of them rather than one giant central server: line 1 has its IPC, line 2 its own, line 3 its own. That is what "N IPCs" means in an architecture drawing, and it keeps a line's data path alive when another line's node is down.
- Some vendors blur the line between IPC and controller: a soft PLC running on an IPC executes the same IEC 61131-3 program as a hardware PLC, with the same scan discipline ([[mfLejTTj|PLC]]).
