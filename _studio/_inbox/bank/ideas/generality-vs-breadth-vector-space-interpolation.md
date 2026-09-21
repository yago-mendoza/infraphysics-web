---
date: "2026-09-14"
status: unverified
tags: ["AI", "generalization", "vector-spaces", "deep-structure", "compression"]
---

# Generality vs. Breadth: Why Models Win Through Interpolation

When AI compresses 20 years of materials discovery into a week, or answers a consulting case and a physics problem with the same weights, it's tempting to say AI is good at general-purpose problem-solving. But let's start with what the model is actually doing.

## The Substrate is Geometric, Not Linguistic

Language is just input and output format. Tokens come in, get projected into a continuous, high-dimensional vector space. Every actual computation happens in that geometric interior, which is not linguistic at all.

**The move is: leave language for a substrate where interpolation is cheap, do the work there, project back into language at exit.**

## Generality ≠ Breadth

- **Breadth:** coverage. More things in the pipeline.
- **Generality:** compression. One structure beneath many things, learned once and spent everywhere.

The old way: a chess engine for chess, a translator for translation. Different system for every domain, hand-built to the shape of its problem.

The new way: one substrate, every problem projected onto it. A consulting case, a physics problem, a line of code—all become sequences in the same space, processed by the same machinery.

## Why This Produces Generality

These problems share deep structure even when surface content is unrelated. That's the load-bearing insight:

- Decouple the problem
- Track what constrains what
- Weigh options against criteria
- Hypothesize and check

In a shared substrate, that structure gets learned once and reused everywhere.

## The Expert Analogy

Give a beginner a pile of physics problems, they sort by appearance: ramp problems here, pulley problems there. An expert sorts the same pile by what governs the problems: this is conservation-of-energy, no matter what it looks like on the surface. **You throw away the surface and keep the thing running underneath it.**

An AI model now does this at scale for almost nothing.

## The Interpolation Edge

If the game is fitting new problems into existing structural frameworks—**it may become indefinitely difficult to beat an interpolator at interpolation.**

---

**Note:** Stored as idea because it's a conceptual observation, not a complete argument. Could expand into essay on model capabilities, or integrate into existing InfraPhysics material on structure and compression.
