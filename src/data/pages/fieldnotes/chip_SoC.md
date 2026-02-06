---
address: "chip//SoC"
date: "2026-02-05"
---
System-on-chip — a [[chip]] integrating [[CPU//core]] clusters, [[GPU]], [[ML//NPU]], memory controller, modem, and [[peripheral]] blocks onto a single die or package. Examples: Apple M-series, Qualcomm Snapdragon, NVIDIA Orin. SoCs dominate mobile and edge computing because tight integration reduces latency, power, and board area vs. discrete [[chip//MPU]] + [[GPU//discrete]] designs.
[[chip]] :: parent category — SoCs are the most integrated chip class, packing heterogeneous compute
[[CPU//core]] :: multi-core clusters (big.LITTLE) handle OS scheduling and application workloads
[[GPU]] :: integrated GPU handles graphics, display compositing, and increasingly ML inference
[[ML//NPU]] :: dedicated neural processing unit accelerates on-device AI without draining the CPU
[[chip//MCU]] :: MCUs trade integration breadth for determinism and cost — SoCs pack more IP but need an OS
[[chip//MPU]] :: SoCs evolved from MPUs by integrating GPU, modem, and memory controller on-die
[[GPU//discrete]] :: discrete GPUs offer higher throughput but consume far more power and board space
