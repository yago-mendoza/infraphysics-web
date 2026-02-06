---
address: "I/O//syscall"
date: "2026-02-05"
---
A system call — the controlled gate between [[RAM//user space]] and [[RAM//kernel space]]. When a process needs hardware access (read file, send packet, allocate memory), it traps into the kernel via a syscall instruction. The kernel validates arguments, performs the operation, and returns. Syscall overhead (context switch + TLB flush) motivates batching APIs (io_uring, sendmmsg) and [[I/O//DMA]] for bulk transfers.
[[RAM//user space]]
[[RAM//kernel space]]
[[I/O//DMA]]
