---
address: "RAM//kernel space"
date: "2026-02-05"
---
The protected region of [[RAM]] reserved for the operating system kernel, device drivers, and interrupt handlers. User programs cannot access kernel memory directly — they cross the boundary via [[I/O//syscall]]. Kernel space has full hardware access, including [[I/O//MMIO]] registers and [[I/O//DMA]] descriptors. A fault here crashes the entire system.
[[RAM]]
[[I/O//syscall]]
[[I/O//MMIO]]
