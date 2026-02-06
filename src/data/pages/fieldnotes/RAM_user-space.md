---
address: "RAM//user space"
date: "2026-02-05"
---
The unprivileged region of [[RAM]] where application processes live. Each process sees a virtual address space isolated by the MMU. Communication with hardware or kernel services requires a [[I/O//syscall]], which context-switches into [[RAM//kernel space]]. Memory allocation (malloc, mmap) operates within user space pages managed by the kernel.
[[RAM]]
[[I/O//syscall]]
[[RAM//kernel space]]
