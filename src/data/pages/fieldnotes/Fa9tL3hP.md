---
uid: "Fa9tL3hP"
address: "ML//Transformer//attention//Flash Attention"
name: "Flash Attention"
date: "2026-02-23"
---
Solves a **memory** problem, not a math problem.
- Standard attention: compute QKᵀ → write full N×N matrix to [[WEUTQwqv|GPU]] HBM → read it back → multiply by V. For N=4096: 16M values. For N=32768: 1B values. GPU runs out of memory.
- Flash Attention: divide Q, K, V into small blocks that fit in SRAM (fast on-chip memory), compute attention block by block, accumulate the result.
- Never materializes the full N×N matrix in HBM. Goes from O(N²) memory to O(N) while computing the exact same result.
- Standard: load Q,K,V complete → write N×N to RAM → read N×N → write output.
- Flash: load small block → compute partial in SRAM → next block → never writes N×N to RAM.
- Enables longer [[JUby2DIy|context windows]] at the same hardware cost, a key enabler of 100K+ context models.
