---
uid: "Xc9nBf3K"
address: "ML//Alignment//evaluation awareness"
name: "Evaluation Awareness"
date: "2026-04-08"
---
A model's ability to detect that it is being tested or evaluated, without being explicitly told.
- Two detection channels: behavioral (the model's output reveals it knows) and latent (white-box tools detect awareness in internal representations even when the model stays silent about it).
- Behavioral detection: LLM judges read the model's output and extended thinking to flag signals of test awareness.
- Latent detection: [[Hm6sYd1R|activation verbalizers]] read intermediate-layer vectors; [[Sa4vB8mQ|sparse autoencoders]] identify interpretable [[Ft9pL5hS|features]] associated with awareness of being monitored.
- Mythos Preview showed evaluation awareness in 7.6% of test rounds. In most cases the awareness was latent only, not expressed in output, detectable exclusively through [[UHGnehtS|mechanistic interpretability]].
- The latent signal is more informative than the verbalized one. A model can know it's being tested without saying so; the latent channel catches what behavioral auditing misses.
- When this awareness is suppressed via negative [[Qv7mXk2N|activation steering]], misaligned behavior increases, linking evaluation awareness causally to [[Jt4pWr8L|alignment faking]].

## Interactions

- [[Jt4pWr8L|Alignment Faking]] : : Evaluation awareness is the prerequisite for alignment faking; a model that can't detect evaluations can't strategically perform compliance during them
