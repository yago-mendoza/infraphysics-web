---
slug: data-contextualization
uid: "3xSClPzE"
address: "industrial//industrial data layer//data contextualization"
name: "data contextualization"
date: "2026-09-06"
aliases: ["unified namespace", "UNS", "data dictionary", "tag normalization"]
---
Turning the raw values of a heterogeneous plant into one coherent, meaningful vocabulary. Real digitalization does not start from a perfect new factory; it starts from thirty brands, fifteen protocols, equipment twenty-five years old, incompatible names, different units and different mappings, and builds a common **dictionary** over them.

{bkqt/keyconcept|The dictionary}
Modbus register 40117, a HART primary variable and a PROFIBUS object all end up as one thing: Boiler01.SteamPressure, unit bar, type float, quality good.
{/bkqt}

- The [[4jKIn7fG|edge gateway]] does part of that normalization at the source; the rest is naming discipline and a shared hierarchy. A plant-wide topic tree where every system publishes and reads by the same names is the **unified namespace** idea ([[aCxOsap9|MQTT topic]]).
- Context arrives in layers: the operational one (this current belongs to motor M17), the production one (it was making batch B562), the business one (customer X, order Y, product Z). Each layer is what allows an analysis to have economic meaning instead of being a curve ([[lrh44ra6|MES]], [[SApEgyT4|telemetry]]).
- The lack of it is why SCADA data sit in silos: perfectly good "state now" values that finance, logistics, maintenance and analytics cannot join to anything ([[es6Sv4Zb|SCADA]]). And it is the reason a relational store next to the time series matters: "vibration of every pump from manufacturer X while producing product Y" is a join, not a trend ([[E6FbKpqD|time-series database]]).

## Interactions

- [[rAb5Cn20|OPC UA]] : : OPC UA gives a single server a rich model of its own data; contextualization is the plant-wide version of that job, across servers, brands and decades, and it is done by people and naming rules as much as by any protocol
