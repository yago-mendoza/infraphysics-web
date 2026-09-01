---
uid: "JsSUul6f"
address: "Math//information theory//entropy"
name: "entropy"
date: "2026-02-24"
---
A measure of average uncertainty in a probability distribution: how many bits you need, on average, to identify an outcome.
- Formula: \(H(X) = -\sum_i p(x_i) \log_2 p(x_i)\). Maximum when all outcomes are equally likely (uniform distribution), zero when the outcome is certain.
- In ML: the output distribution over tokens has an entropy. High entropy = the model is uncertain (many plausible next tokens). Low entropy = the model is confident (one token dominates)
- [[Et5mN8wJ|Extended thinking]] works by reducing entropy: each reasoning token narrows the distribution over next tokens, making the correct continuation more probable. This is a [[Ds3fR7kX|distributional shift]] toward a [[Ba6mR3kL|basin of attraction]] where correct answers cluster.
- The connection to [[q3MjogvW|cross-entropy]] loss: cross-entropy \(H(p, q) = H(p) + D_{KL}(p \| q)\). Minimizing cross-entropy means both reducing the model's surprise AND aligning its distribution with the true one.
- In physics: Boltzmann entropy \(S = k_B \ln W\) counts microstates. Shannon entropy counts distinguishable messages. Same math, different domains.
- Temperature in [[5qpyTXdv|sampling]]: high temperature raises entropy (flattens distribution, more randomness), low temperature lowers it (sharpens, more deterministic). Temperature literally controls the entropy of the output distribution.

## Interactions

- [[avUhQygt|Information Theory]] : : Entropy is the foundational quantity of information theory: everything else (mutual information, channel capacity, coding theorems) builds on it
- [[Ds3fR7kX|distributional shift]] : : Thinking tokens reduce entropy by triggering distributional shifts, moving the model toward lower-entropy regions of latent space where correct continuations dominate
- [[q3MjogvW|cross-entropy]] : : Cross-entropy loss decomposes into true entropy plus KL divergence: training minimizes both the inherent uncertainty and the model's misalignment with it
