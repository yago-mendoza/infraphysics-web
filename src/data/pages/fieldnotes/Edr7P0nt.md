---
uid: "Edr7P0nt"
address: "Security//EDR"
name: "EDR"
date: "2026-09-04"
---

Endpoint Detection and Response (EDR) records and analyzes activity on endpoints such as process creation, file changes, command execution and network connections. It helps security teams investigate and contain suspicious behavior after prevention alone is insufficient.

The advantage over an isolated antivirus is not clairvoyance. It is richer temporal evidence: which process spawned which child, touched which file and contacted which host. That sequence can expose an adaptive attack whose individual artifacts appear harmless.

An endpoint stops being a black box and becomes a timeline.

## Interactions

- [[BehDet9N|behavioral detection]] : : EDR supplies the endpoint telemetry from which behavioral rules and models infer suspicious sequences
- [[Xdr8C0rR|XDR]] : : XDR extends correlation beyond endpoint evidence into identity, cloud, network and messaging systems

