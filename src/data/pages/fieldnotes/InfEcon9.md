---
uid: "InfEcon9"
address: "ML//Inference//inference economics"
name: "Inference Economics"
date: "2026-09-04"
---

Inference economics asks what it costs to turn a trained model into repeated useful outputs. API pay-per-use converts capacity into a variable expense and is excellent when demand is uncertain or operational simplicity matters.

At sustained scale, owning or reserving serving capacity may reduce unit cost, but only if utilization justifies the fixed commitment. Model quality, latency targets, batching, memory footprint, engineering labor and idle hardware all belong in the comparison. Price per token is a useful line item, not the whole business case.

Renting removes the empty room. Owning becomes interesting only when you can keep the room busy.

## Interactions

- [[Thr0ugh8|throughput]] : : Higher utilization spreads fixed serving cost across more completed work
- [[CapEx4Fn|CapEx]] : : Owned accelerators convert future usage expectations into an upfront capital commitment
- [[OpEx7Rn|OpEx]] : : API calls, energy and operations appear as recurring costs with different scaling behavior
