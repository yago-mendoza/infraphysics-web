---
slug: industrial-data-layer
uid: "KApGpKIt"
address: "industrial//industrial data layer"
name: "industrial data layer"
date: "2026-09-06"
aliases: ["plant data architecture", "OT data"]
---
The layer that turns a plant designed to control machines into an industrial data infrastructure. The full path of a datum: sensor, then [[mfLejTTj|PLC]], then an [[4jKIn7fG|edge gateway]] or [[iJg3vN8L|IPC]], then [[JS0lHIsn|MQTT]] or an [[rAb5Cn20|OPC UA]] server, and from there fan-out to SCADA, the [[OShEuklQ|historian]], MES, analytics and the cloud.

{bkqt/keyconcept|Before and now}
Before: sensor, then PLC, then SCADA. One chain, one consumer, built to control.
Now: sensor, then PLC, then edge, and from the edge in parallel to SCADA, historian, MES, analytics, cloud and AI. One source, many consumers, built to exploit data as well.
{/bkqt}

- The unit of data is the [[hwFvgjuo|tag]] with value, timestamp and quality; the other kind of datum is the [[a79KQL3v|event]]. Storage is the historian with [[GQxDKEj0|deadband]] compression, alongside a [[E6FbKpqD|time-series database]].
- The hard part is not moving bytes but meaning: [[3xSClPzE|data contextualization]] is what turns a register value into "motor M17, batch B562, customer X", and [[N3kQDfIx|fault semantics]] is why control protocols cannot be swapped for a REST API. [[huvjy4f0|OPC]] solved interoperability first; OPC UA added the information model.
- Zooming out: [[R1zrc3TC|IIoT]] connects assets to get more from them, [[SApEgyT4|telemetry]] carries their variables out, [[hso3itYC|fleet data]] compares many plants at once, and [[sfCH7K8e|edge AI]] runs the analysis next to the machine. All of it lives on the boundary described in [[1MdZnnvZ|OT]].

## Interactions

- [[WY7g1n8W|automation pyramid]] : : The pyramid stacks systems one above the other and data climbs level by level; the data layer cuts across it, taking every signal at the edge and distributing it sideways to whoever needs it, which is why modern architectures are drawn as a hub rather than a ladder
