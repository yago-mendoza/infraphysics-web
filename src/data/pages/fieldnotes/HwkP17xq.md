---
uid: "HwkP17xq"
address: "ML//Time Series//Hawkes process"
name: "Hawkes process"
date: "2026-07-04"
---
A self-exciting [[PtPr18xr|point process]]: each event temporarily raises the probability of the next, so events arrive in bursts.
- Intensity jumps after every event and decays back down; clusters emerge without any external trigger.
- Models earthquake aftershocks, financial order flow, and neural event streams.
- The observable proxy for its intensity is often an [[Ewma20xt|EWMA]] of the event stream.
