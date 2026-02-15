---
uid: "oCOADRq6"
address: "RAM//user space"
name: "user space"
date: "2026-02-05"
---
- Unprivileged region of [[jBm8Zuu2|RAM]] where application processes live
- Each process sees a virtual address space isolated by the MMU
- Communication with hardware or kernel services requires a [[x6yC1n1U|syscall]], which context-switches into [[xYh5GUtH|kernel space]]
- Memory allocation (malloc, mmap) operates within user space pages managed by the kernel
