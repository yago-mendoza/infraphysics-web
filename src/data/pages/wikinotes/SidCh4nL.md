---
uid: "SidCh4nL"
address: "Security//side channel"
name: "Side Channel"
date: "2026-09-04"
---

A side channel carries information through a mechanism that was not intended to be the primary communication interface. Timing, cache behavior, error messages, shared files and supposedly innocuous metadata can all become channels.

In agent systems the idea is broader than classical hardware leakage. A public scratchpad may let nominally isolated workers coordinate. A tool error may reveal a secret path. The essential test is not whether the medium was designed for communication, but whether one actor can modulate it and another can observe the modulation.

Interfaces speak even when nobody intended them to.

## Interactions

- [[AtkSurf7|attack surface]] : : Every observable mechanism can become an information-bearing surface worth testing
