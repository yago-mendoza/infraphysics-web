---
slug: data-holders
uid: "oWY2KCh3"
address: "industrial//industrial ecosystem//data holders"
name: "data holders"
date: "2026-09-06"
aliases: ["machine data ownership", "telemetry negotiation", "data access licensing"]
---
A machine can generate enormous amounts of data, and immediately the commercial questions appear: who owns the datum, who can extract it, does the OEM allow access, is a license needed, can the customer connect directly to the PLC, is there an API, does the vendor charge for it.
- Owning the machine does not always mean having easy, structured access to all of its data. The controller may be closed, the protocol undocumented, the [[DML5M3qP|register map]] withheld, the cloud connection routed through the OEM's platform.
- This is becoming a real source of tension between the asset owner, the [[pC4MKpUX|OEM]], the [[cb9f4huK|integrator]] and the digital platform, because [[hso3itYC|fleet data]] are most valuable to whoever aggregates them and the [[o0FC5b14|aftermarket]] increasingly runs on them.
- Technically the plant's counter-move is the [[4jKIn7fG|edge gateway]]: read what the fieldbus exposes, normalize it, and keep a copy under its own control ([[SApEgyT4|telemetry]]).

## Interactions

- [[DataRs6D|Data Residency]] : : Data residency asks in which jurisdiction data may be stored; data holders in a plant is the prior question of whether the plant may even read its own machine's data before anyone decides where to keep it
