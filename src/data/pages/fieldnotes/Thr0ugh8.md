---
uid: "Thr0ugh8"
address: "Infrastructure//throughput"
name: "Throughput"
date: "2026-09-04"
---

Throughput is the amount of useful work completed per unit of time: requests per second, tokens per second or jobs per hour. It describes aggregate capacity, not how long one request waits.

Any claim of “twice the performance” is incomplete until the numerator, workload and latency constraint are named. Higher batch sizes may increase token throughput while violating an interactive latency target. A benchmark can also report model tokens per second or total served tokens per second, which answer different questions.

Always ask: more of what, under which waiting-time promise?

## Interactions

- [[Batch1ng|batching]] : : Batching amortizes overhead and raises accelerator utilization to increase aggregate throughput
