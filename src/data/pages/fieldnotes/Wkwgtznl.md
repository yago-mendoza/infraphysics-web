---
uid: "Wkwgtznl"
address: "Math//compositionality"
name: "Compositionality"
date: "2026-03-06"
---
The principle that complex functions can be built by composing simpler ones: \(f = f_n \circ f_{n-1} \circ \cdots \circ f_1\)
- In transformers: each layer is a function, and the full model is their composition. The [[Rs6cD4vX|residual stream]] carries the intermediate result between compositions.
- In [[Et5mN8wJ|extended thinking]]: each [[Ds4pJ8kF|decoding step]] applies the full transformer stack to a new input (the context including all previous thinking tokens). The chain of thought is a composition of compositions — \(n\) steps, each applying \(L\) layers, for \(n \times L\) total transformations.
- Analogy to Gaussian elimination: solving \(n\) equations requires \(n\) elimination steps. Each step simplifies the system. No shortcut exists — the intermediate steps are necessary because each one depends on the previous. Similarly, complex reasoning requires intermediate thinking tokens because each one changes the context for the next.
- [[QGrQxZe0|PSPACE]] connection: the class of problems solvable with polynomial memory but potentially exponential time. Chain-of-thought reasoning gives the model polynomial "scratch space" (the context window) to solve problems that would require exponential search without it. The thinking tokens are the polynomial workspace.
- Why compositionality matters for training: [[qcqxPFA0|SFT]] can teach the model what compositions look like (imitating reasoning chains), but only [[NYb6zLJ5|RL]] can teach it which compositions are worth computing — which intermediate steps actually help.

## Interactions

- [[Et5mN8wJ|extended thinking]] : : Extended thinking is compositionality in action — each thinking token composes a new transformation, building on all previous ones to navigate toward the correct answer
- [[Rs6cD4vX|residual stream]] : : The residual stream is the physical carrier of composed transformations — each layer adds its contribution, and the stream accumulates the full composition
