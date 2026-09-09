---
slug: mes
uid: "lrh44ra6"
address: "industrial//industrial automation//MES"
name: "MES"
date: "2026-09-06"
aliases: ["MOM", "manufacturing execution system", "manufacturing operations management"]
---
**Manufacturing Execution System**, or **Manufacturing Operations Management**, manages production itself: manufacturing orders, traceability, batches, quality, OEE, detailed scheduling, consumption, actual output.
- It is the level where the operational world (OT) meets the business world (IT). The [[o6N4rqGz|ERP]] decides what to manufacture; the MES organizes how to manufacture it; the [[mfLejTTj|PLC]] and [[7NrcWZUv|DCS]] make it physically happen.
- MES is also where a raw measurement gains production context: a motor current becomes "motor M17, while making batch B562". That enrichment is what turns telemetry into data with economic meaning ([[3xSClPzE|data contextualization]]).
- In the [[WY7g1n8W|automation pyramid]] it is level 3. In modern architectures it is one of the consumers of the data layer, fed through MQTT or OPC UA rather than by reading controllers directly.

## Interactions

- [[es6Sv4Zb|SCADA]] : : SCADA answers "what is the state now"; MES answers "which order, which batch, which quality". A plant can run on SCADA alone and never know what a downtime cost; it cannot run an MES without the states SCADA supplies
