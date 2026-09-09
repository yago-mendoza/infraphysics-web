---
slug: motion-control
uid: "fnuKFZ2c"
address: "industrial//industrial automation//motion control"
name: "motion control"
date: "2026-09-06"
aliases: ["CNC", "coordinated axes", "servo control"]
---
Controlling several axes so that they behave as **one coordinated mechanical system**, not as independent motors A, B and C. For a tool to follow a curve, X(t), Y(t) and Z(t) must be synchronized with great precision; CNC machines and multi-axis robots live here.
- It is the most demanding timing regime in the plant: not just fast, but synchronized to the microsecond across nodes. That is why networks built for motion, above all [[gWjNvMXi|EtherCAT]], are described as hyper-deterministic, and why [[mfLejTTj|PLC]] scan cycles of milliseconds are not enough on their own.
- Each axis is closed by a servo drive ([[keWFUA5P|drive]]); the motion controller distributes setpoints to all of them on a common clock. A [[hgytSVXF|robot controller]] is a motion controller specialized for an arm.

## Interactions

- [[pHiCzY68|discrete automation]] : : Discrete automation asks whether an event happened in time; motion control asks whether five axes were at the right place at the same microsecond. Both are "machines", the second needs a clock the first can ignore
