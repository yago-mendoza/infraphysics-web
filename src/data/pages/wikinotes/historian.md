---
slug: historian
uid: "OShEuklQ"
address: "industrial//industrial data layer//historian"
name: "historian"
date: "2026-09-06"
aliases: ["process historian", "PI System", "AVEVA PI", "IP.21"]
---
A **process historian** is a database specialized in industrial time-based data: millions or billions of samples of tag, timestamp, value and quality. Historic names: OSIsoft PI, now AVEVA PI; AspenTech IP.21.
- Its classic trait is compression: it does not necessarily store every sample when the value barely changes. A temperature reading 100.000, 100.001, 100.002, 100.000, 100.001 is five nearly identical points; a [[GQxDKEj0|deadband]] or swinging-door algorithm keeps the shape of the signal with a fraction of the storage.
- It is the archive behind every trend on a SCADA screen and the raw material of any later analysis. It coexists with, rather than being replaced by, the modern [[E6FbKpqD|time-series database]]: historian, data lake or cloud, TSDB and SQL each keep a role in a real plant.
- What it stores is the [[hwFvgjuo|tag]]; what it usually lacks is the business context that makes a tag comparable across lines or plants ([[3xSClPzE|data contextualization]]).

## Interactions

- [[E6FbKpqD|time-series database]] : : Both store time-stamped values; the historian was built for a plant's tag namespace, deadband compression and decades of retention, the TSDB for labels, SQL joins and observability-style queries. Plants run both, and the interesting question is which one the MES reads from
