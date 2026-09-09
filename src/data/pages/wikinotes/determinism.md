---
slug: determinism
uid: "xHZIkyPb"
address: "networks//network theory//determinism"
name: "determinism"
date: "2026-09-06"
aliases: ["real-time communication", "jitter", "predictable latency"]
---
A communication is deterministic when its timing is **predictable**, not merely fast. If a response usually takes 1 ms but occasionally takes 300 ms, it can be useless for a control loop even though its average looks excellent.
- The real-time recipe is low latency plus low jitter plus bounded worst case. Latency is how long a packet takes; jitter is how much that time varies; the bound is what a controller can actually plan around. Office networks and the public Internet optimize throughput and cost and give no bound at all ([[Latency7|Latency]], [[Thr0ugh8|Throughput]]).
- Industrial networks are built around this property: the [[KgAxnFjV|PLC scan cycle]] is a bounded loop, [[1pkzK8nT|industrial Ethernet]] variants add scheduling and synchronization to ordinary Ethernet, and an [[WhD8fGtf|industrial switch]] is chosen for recovery time, not for port count.
- The demand grows with the task: supervision tolerates seconds, a machine interlock needs milliseconds, coordinated [[fnuKFZ2c|motion control]] needs synchronized microseconds. Determinism is one of the three reasons a REST API is the wrong tool below the control layer ([[N3kQDfIx|fault semantics]]).

## Interactions

- [[Latency7|Latency]] : : The latency note measures how long a plate takes to arrive; determinism is the promise that it will never take longer than a stated time. A low average with a fat tail is fast and not deterministic
