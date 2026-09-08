---
uid: "Bs8fH2xP"
address: "ML//Inference//beam search"
name: "Beam Search"
date: "2026-03-02"
---
A decoding strategy that keeps the top-K most probable partial sequences at each step, instead of committing to a single token. At each [[Ds4pJ8kF|decoding step]], expand all K candidates by one token, score them, keep the best K.
- The middle ground between [[Gk5pJ7mS|greedy decoding]] (K=1, always pick the highest-probability token) and exhaustive search (explore all possibilities, computationally impossible). Beam width K controls the trade-off.
- Why greedy fails: the locally best token isn't always globally best. "The cat sat on the..." could greedily pick "mat" but the full best sequence might start differently. Beam search explores multiple paths simultaneously.
- Dominated machine translation and [[78kjiso5|seq2seq]] tasks for years. But for open-ended text generation, beam search produces repetitive, generic text. It optimizes for probability, which favors "safe" continuations.
- Largely replaced by [[5qpyTXdv|sampling]]-based methods ([[Pr11SIS0|temperature]], [[iMXk0dEJ|top-k]], [[9Tlb16K2|top-p]]) for LLM generation. Sampling introduces randomness, which produces more creative and diverse text. Beam search is still used for tasks with a "correct" answer (translation, ASR)
- Conceptually related to [[Ts5nR2mH|tree search]] in [[Kp4jIz9L|reasoning models]]: both explore multiple paths. But beam search scores by token probability, while tree search scores by reasoning validity (using [[Pr7mK4nX|PRM]]s). Same structure, different evaluation.

## Interactions

- [[Ts5nR2mH|Tree Search]] : : Beam search explores by probability (which token is most likely), tree search explores by validity (which reasoning step is most correct). Beam search is token-level, tree search is thought-level
