---
uid: "zS3Nqz7G"
address: "I/O"
name: "I/O"
date: "2026-02-05"
---
- Input/output — the mechanisms through which a [[OkJJJyxX|CPU]] communicates with the external world
- Covers storage, network, sensors, and displays
- Software triggers I/O via [[x6yC1n1U|syscall]] (user-to-kernel boundary)
- Hardware uses [[Yu2rpig0|MMIO]] (memory-mapped registers) or [[2p1K1HEC|DMA]] (direct memory access bypassing the CPU)
- I/O latency often dominates real-world performance far more than raw compute speed
