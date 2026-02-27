---
uid: "q5OQMvfy"
address: "ML//agent//MemGPT"
name: "MemGPT"
date: "2026-02-26"
---
- Long-running [[WA8fVNaT|agent]] memory system: virtual context with main memory (active) and external storage (archived)
- Inspired by OS memory hierarchy — "page out" older memories to archival, "page in" when relevant
- Adopted by [[Wb0yDrNZ|ChatGPT]] (memory feature) and LangGraph. Variants in MetaGPT, AutoGen, Smallville
- Solves the fundamental problem: [[JUby2DIy|context windows]] are finite but agent conversations can be infinite
---
[[JUby2DIy|context window]] :: MemGPT works around context limits — manages what's "loaded" like an OS manages RAM pages
