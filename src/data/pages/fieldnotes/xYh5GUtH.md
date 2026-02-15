---
uid: "xYh5GUtH"
address: "RAM//kernel space"
name: "kernel space"
date: "2026-02-05"
---
- Protected region of [[jBm8Zuu2|RAM]] reserved for the OS kernel, device drivers, and interrupt handlers
- User programs cannot access kernel memory directly — they cross the boundary via [[x6yC1n1U|syscall]]
- Has full hardware access, including [[Yu2rpig0|MMIO]] registers and [[2p1K1HEC|DMA]] descriptors
- A fault here crashes the entire system
