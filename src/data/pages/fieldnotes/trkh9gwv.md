---
uid: "trkh9gwv"
address: "electronics//chip//SoC"
name: "SoC"
date: "2026-02-05"
---
- System-on-chip — a [[MTfcKkH5|chip]] integrating [[Z9W6rweD|core]] clusters, [[WEUTQwqv|GPU]], [[1yDGHLLU|NPU]], memory controller, modem, and [[PrATEjcr|peripheral]] blocks onto a single die or package
- Examples: Apple M-series, Qualcomm Snapdragon, NVIDIA Orin
- Dominates mobile and edge computing — tight integration reduces latency, power, and board area
- Vs. discrete [[Jkr1CFGJ|MPU]] + [[LxUj37D3|discrete]] designs
- SoC [[7wngT1lE|Cortex-A]] ⟶ high-end smartphone processors (Snapdragon, Apple M1)
- SoC [[OQmzx1Vg|Cortex-M]] ⟶ very smart [[uuLCFmtk|sensor]]s
- [[xVyHlNQa|ESP32]] as SoC: [[QSPGKDnh|sensor]] + [[gKR2I1Nu|MCU]] + radio + antenna; could communicate by itself (floating dark box), but needs electricity ⟶ power ⟶ [[26t2rDup|PCB]] + [[nlro5GOJ|capacitor]]s
- General-purpose like [[gKR2I1Nu|MCU]]: can be a toaster, a drone, a watch
---
[[gKR2I1Nu|MCU]] :: MCUs trade integration breadth for determinism and cost — SoCs pack more IP but need an OS
[[Jkr1CFGJ|MPU]] :: SoCs evolved from MPUs by integrating GPU, modem, and memory controller on-die
[[LxUj37D3|discrete]] :: discrete GPUs offer higher throughput but consume far more power and board space
