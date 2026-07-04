---
uid: "QGrQxZe0"
address: "CS//complexity theory//PSPACE"
name: "PSPACE"
date: "2026-03-08"
---
The class of decision problems solvable by a Turing machine using polynomial space: problems where the workspace is bounded but computation time may be exponential.
- Key result: PSPACE = NPSPACE (Savitch's theorem, 1970). Nondeterminism does not help when the constraint is space, only when it is time.
- PSPACE-complete problems: quantified Boolean formulas (QBF), many two-player games (generalized chess, Go on arbitrary boards), planning problems with constraints.
- Contains P, NP, and co-NP. Whether P = PSPACE is open, but widely believed false.

##### Connection to extended thinking

- Connection to [[Et5mN8wJ|extended thinking]]: chain-of-thought reasoning gives the model bounded scratch space (the [[JUby2DIy|context window]]) and unbounded steps (as many thinking tokens as the budget allows). This is structurally similar to polynomial-space computation: the model can solve problems that would require exponential brute-force search by using its thinking tokens as working memory.
- The analogy is imperfect: transformers are not Turing machines, and the context window is not true random-access memory. But the key insight holds: intermediate computation (thinking tokens) expands the class of problems the model can solve, just as polynomial scratch space expands the class beyond P.
- [[Wkwgtznl|Compositionality]] is the mechanism: each thinking step composes a new transformation, and the sequence of compositions can express computations far more complex than any single forward pass.

## Interactions

- [[Wkwgtznl|Compositionality]] : : Compositionality is how PSPACE-like computation happens in transformers: each thinking token composes a new transformation, using the context window as polynomial scratch space
- [[Et5mN8wJ|extended thinking]] : : Extended thinking gives models access to PSPACE-like computation: bounded workspace (context window) with many steps (thinking tokens), enabling solutions to problems that would require exponential search in a single forward pass
