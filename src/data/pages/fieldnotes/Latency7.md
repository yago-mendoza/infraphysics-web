---
uid: "Latency7"
address: "Infrastructure//latency"
name: "Latency"
date: "2026-09-04"
---

Latency is the elapsed time experienced by one unit of work. For generated responses, useful measures include time to first token and the delay between subsequent tokens.

Latency is not throughput. A server may process more total tokens by batching requests while making each user wait longer. Tail latency also matters: a pleasant average can hide a small fraction of painfully slow requests that dominate user experience.

Throughput fills the restaurant. Latency is how long your own plate takes to arrive.

## Interactions

- [[Thr0ugh8|throughput]] : : Systems often trade individual response time for greater aggregate work completed per second
