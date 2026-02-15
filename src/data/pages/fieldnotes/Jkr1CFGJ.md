---
uid: "Jkr1CFGJ"
address: "electronics//chip//MPU"
name: "MPU"
date: "2026-02-05"
---
- Microprocessor unit — a [[MTfcKkH5|chip]] containing only the [[Z9W6rweD|core]] (and caches)
- Requires external [[jBm8Zuu2|RAM]], storage, and peripheral chips on the [[26t2rDup|PCB]]
- Desktop and server processors (Intel Core, AMD Ryzen, Apple M-series) are MPUs
- Modern ones are blurring into [[trkh9gwv|SoC]] territory by integrating GPU, NPU, and memory controllers on-package
- 1 processor with 1-12+ [[HaT1Oozw|ARM]] [[Z9W6rweD|core]]s (multi-core)
- Multicore != multiprocessor (multiprocessor = multiple MPUs on a [[26t2rDup|PCB]])
- Only has space for cache on-die ⟶ requires external [[jBm8Zuu2|RAM]] (heavy) and ROM/SSD (save state)
- On iPhones, [[jBm8Zuu2|RAM]] is stacked ON the MPU package (tiny); Windows allows RAM upgrading, macOS does not (RAM inside MPU package)
- [[a2FkPabO|integrated]] GPU inside (nail size, ~30 W, lightweight inference) vs [[LxUj37D3|discrete]] GPU outside (hand size, ~450 W, heavy streams)
---
[[jBm8Zuu2|RAM]] :: external DRAM required — MPUs lack on-die memory, relying on DDR modules via memory bus
[[trkh9gwv|SoC]] :: modern MPUs are converging with SoCs as they integrate GPU, NPU, and memory controllers
