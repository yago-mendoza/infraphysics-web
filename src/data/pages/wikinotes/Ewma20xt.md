---
uid: "Ewma20xt"
address: "ML//Time Series//EWMA"
name: "EWMA"
date: "2026-07-04"
---
Exponentially-weighted moving average: a running average where recent samples count for more and old ones decay geometrically.
- Each new value bumps it up; between values it decays. One tunable constant sets the memory length.
- A cheap, causal feature for "how active is this stream right now", and an observable stand-in for [[HwkP17xq|Hawkes]] intensity.
- The fast clock in a dual-clock feature set (recent density), paired with a slower accumulator.
