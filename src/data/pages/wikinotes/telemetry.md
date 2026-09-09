---
slug: telemetry
uid: "SApEgyT4"
address: "industrial//industrial data layer//telemetry"
name: "telemetry"
date: "2026-09-06"
aliases: ["process telemetry", "remote measurement"]
---
The transmission of process variables toward other systems: temperature, vibration and pressure flowing to an analysis platform. Telemetry is the raw feed; everything that gives it meaning comes later.
- The recent change is not that data appeared. Plants have had data for decades, inside PLCs, DCSs and SCADAs. The change is being able to **extract, contextualize and use it massively**, which is a question of gateways, protocols and naming rather than of sensors ([[4jKIn7fG|edge gateway]], [[3xSClPzE|data contextualization]]).
- From pure telemetry to contextualized data is a chain of enrichment: the measurement, then the event that framed it, then ingestion, then business context, then quality. A motor current of 18.7 A is telemetry; the same current known to belong to motor M17 during batch B562 for customer X is a datum with economic meaning ([[lrh44ra6|MES]]).
- Telemetry is also a commercial object: who may extract it from a machine is negotiated, not given ([[oWY2KCh3|data holders]]).
