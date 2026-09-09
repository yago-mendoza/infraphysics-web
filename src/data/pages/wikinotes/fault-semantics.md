---
slug: fault-semantics
uid: "N3kQDfIx"
address: "industrial//industrial data layer//fault semantics"
name: "fault semantics"
date: "2026-09-06"
aliases: ["why not REST", "REST in OT", "request-response versus cyclic"]
---
Why industrial control does not run on a REST API: three properties a control link needs that a request-response web API does not offer. **Determinism**, **physical state** and **fault semantics**.
- REST is excellent at "give me order 1234", "create this user", "fetch this report": stateless requests, one answer each, at IT speeds ([[WlyXzixc|REST]]). Control needs cyclic updates, a watchdog, data quality, timeouts, connection state, change-of-value notification, alarms, precise timestamps and a predictable time behavior ([[xHZIkyPb|determinism]]).
- The failure model is the core difference. An HTTP 500 does not say what "the physical transmitter lost power and the last valid measurement is 3.8 seconds old" says. Control protocols carry that: a [[hwFvgjuo|tag]] has a quality and an age, a fieldbus knows a device fell off the bus, an OPC UA subscription reports a lost connection as data, not as an exception.
- REST is perfectly valid **above** the control layer, between business applications and toward the cloud; it is the wrong tool as a substitute for PROFINET, EtherCAT or OPC UA at the bottom ([[g9jb8QD1|HTTPS]]).

## Interactions

- [[WlyXzixc|REST]] : : REST's stateless request is its strength in IT and its disqualification in OT: a control loop needs to know the difference between "no answer yet", "the device is gone" and "the value is stale", and a status code collapses all three
