---
uid: "gd9F2E5b"
address: "Systems Theory//emergence"
name: "Emergence"
date: "2026-03-08"
---
Macro-level behavior that arises from micro-level interactions without being explicitly designed or programmed — the whole does something the parts do not.
- First-order emergence: a single surprising behavior appears. [[h7ZzT64Z|Emergent behavior]] in RL-trained models — chain-of-thought reasoning appearing in DeepSeek-R1-Zero, tool use appearing in Cursor's Composer — are first-order: one capability the training signal did not specify.
- Second-order emergence: individually emergent behaviors compose into workflows or strategies no one designed. Cursor's model learned to search, then edit, then self-test, then fix — each step emerged independently via RL, but together they form a coherent strategy. In [[Et5mN8wJ|extended thinking]], individual reasoning steps are first-order, but the model's ability to sequence them into multi-step proofs is second-order.
- Strong vs weak emergence: weak emergence is in principle deducible from the parts (given enough compute). Strong emergence is not. Most ML emergence is weak — surprising to us but implicit in the optimization landscape.
- Connection to [[iTljPiGW|scaling laws]]: many emergent capabilities appear abruptly at certain model scales. Below the threshold, the capability is absent. Above it, it appears suddenly. This is phase-transition-like behavior.
- [[Mc4xR8wP|Model collapse]] is emergence in reverse: a macro-level failure (distribution narrowing) that emerges from micro-level dynamics (training on synthetic data), with no single training step being the cause.

## Interactions

- [[rttI47hN|Systems Theory]] : : Emergence is the central phenomenon systems theory exists to explain — behavior at the system level that cannot be predicted from component-level analysis
- [[h7ZzT64Z|emergent behavior]] : : Emergent behavior in ML (chain-of-thought, tool use, self-correction) is first-order emergence — single capabilities arising from reward optimization without explicit instruction
- [[iTljPiGW|Scaling Laws]] : : Scaling laws predict when emergent capabilities appear — many emerge abruptly at specific parameter/data thresholds, resembling phase transitions
