---
uid: "x6yC1n1U"
address: "I/O//syscall"
name: "syscall"
date: "2026-02-05"
---
- A system call — the controlled gate between [[oCOADRq6|user space]] and [[xYh5GUtH|kernel space]]
- When a process needs hardware access (read file, send packet, allocate memory), it traps into the kernel via a syscall instruction
- The kernel validates arguments, performs the operation, and returns
- Syscall overhead (context switch + TLB flush) motivates batching APIs (io_uring, sendmmsg) and [[2p1K1HEC|DMA]] for bulk transfers
