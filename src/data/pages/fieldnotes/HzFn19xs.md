---
uid: "HzFn19xs"
address: "ML//Time Series//hazard function"
name: "hazard function"
date: "2026-07-04"
---
The instantaneous risk that an event happens right now, given it has not happened yet. Core object of survival analysis.
- Turns a [[PtPr18xr|point process]] into a per-window risk you can forecast.
- Distinguishes predicting that a system is fragile from predicting the exact moment it breaks. Most risk models do the first; timing is the hard part.
- Knowing the hazard is high tells you the distribution, not the next draw: a loaded die is not an oracle.
