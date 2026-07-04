---
uid: "PtPr18xr"
address: "ML//Time Series//point process"
name: "point process"
date: "2026-07-04"
---
A model for the random timing of discrete events on a line (or in space), rather than a value sampled on a fixed clock.
- The baseline is the Poisson process: events arrive independently at a constant rate.
- A [[HwkP17xq|Hawkes process]] adds self-excitation; other variants add inhibition or external drivers.
- You model the intensity (the instantaneous rate), not the events directly.
