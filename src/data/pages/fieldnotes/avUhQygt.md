---
uid: "avUhQygt"
address: "Information Theory"
name: "Information Theory"
date: "2026-03-02"
---
Founded by Claude Shannon in "A Mathematical Theory of Communication" (1948), the paper that launched the digital age.
- Core question: how much information can be transmitted reliably through a noisy channel?
- Key quantities: [[JsSUul6f|entropy]] (uncertainty of a source), mutual information (shared information between variables), [[2oN0bPZY|channel capacity]] (maximum reliable transmission rate)
- Shannon showed that information is quantifiable, independent of meaning: a bit is a bit whether it encodes poetry or noise.
- Deep connection to thermodynamics: Boltzmann entropy measures disorder in physical systems, Shannon entropy measures uncertainty in messages. The formulas are structurally identical.

##### Connection to ML

- In ML: the [[q3MjogvW|cross-entropy]] loss function is a direct application: it measures how surprised the model is by the data, in bits. [[2oNdlB5L|Pretraining]] is, at its core, entropy minimization.
- Shannon's noisy-channel coding theorem: if you transmit below [[2oN0bPZY|channel capacity]], error-free communication is possible. Above it, errors are inevitable. This has a deep analogy to model capacity: a model too small for the task will always make errors, no matter how long you train it.

## Interactions

- [[JsSUul6f|Entropy]] : : Entropy is the central quantity of information theory: measures average uncertainty per symbol in a source
- [[2oN0bPZY|Channel Capacity]] : : Channel capacity is Shannon's upper bound on reliable communication: the maximum rate at which information can be transmitted through a noisy channel
- [[q3MjogvW|cross-entropy]] : : Cross-entropy loss is information theory applied to ML: measures the divergence between the model's predictions and the true distribution, in bits
