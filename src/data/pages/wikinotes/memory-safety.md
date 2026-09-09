---
slug: memory-safety
uid: "c235ffd9"
address: "computer science//memory safety"
name: "memory safety"
date: "2026-09-08"
aliases: ["memory-safety"]
---
Memory safety constrains memory access so that a program does not read or write through invalid references or beyond the storage it is permitted to use. A language can enforce these constraints through static checks, runtime checks or restricted operations. Different mechanisms have different costs and guarantees.

The distinction matters because a valid algorithm can still be implemented with invalid memory accesses. [Why Rust exists](/blog/essays/why-rust-exists) explains one language-level approach; [[u4ZNJKCV|security]] covers the broader question of what an attacker can do with a defect.
