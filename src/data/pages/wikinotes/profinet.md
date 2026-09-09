---
slug: profinet
uid: "dOYR97cR"
address: "industrial//industrial Ethernet//PROFINET"
name: "PROFINET"
date: "2026-09-06"
aliases: ["Siemens network", "PROFIBUS successor"]
---
The industrial Ethernet of the Siemens ecosystem, the Ethernet-era successor of PROFIBUS. An **expressive control network**: not just numeric registers but structured devices, I/O, diagnostics and identity, with real-time classes that make communication far more deterministic than office Ethernet.
- Its real-time class schedules cyclic I/O traffic below TCP/IP, and its isochronous class synchronizes devices for motion; ordinary TCP/IP traffic coexists on the same wire for everything that is not time-critical ([[xHZIkyPb|determinism]]).
- It is the usual link between a Siemens [[mfLejTTj|PLC]] and its drives ([[keWFUA5P|VFD]]), remote I/O, robots and machinery; a [[hgytSVXF|robot controller]] from another brand joins a Siemens cell by speaking it.
- A 2006 PROFIBUS DCS and a modern PROFINET PLC can share a plant for decades, which is the kind of coexistence a gateway has to bridge ([[4jKIn7fG|edge gateway]]).
