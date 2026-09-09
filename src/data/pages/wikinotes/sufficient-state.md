---
slug: sufficient-state
uid: "u18hGtFd"
address: "mathematics//dynamical systems//sufficient state"
name: "sufficient state"
date: "2026-09-06"
aliases: ["Markov property", "state variable"]
---
A **sufficient state** keeps all the information from the past that the model needs to predict the future, **given the future inputs**. It does not have to reconstruct the past; it has to distinguish the futures that can still differ.
- In a well-posed deterministic model, knowing \(x(t_0)\) and the later input selects the trajectory. In a stochastic model it determines a distribution of possible evolutions, not necessarily a certain outcome.
- The present has to carry the right memory. In \(\dot x=u-\lambda x\), two different histories that produce the same \(x(t_0)\) share the same future under the same later input: the relevant past has been compressed into one number. But with

{math}
\dot x_1=u-\lambda_1x_1,\qquad
\dot x_2=u-\lambda_2x_2,\qquad y=x_1+x_2,
{/math}

and \(\lambda_1\ne\lambda_2\), knowing only \(y\) is usually not enough. The same total can hold different proportions of fast and slow memory, and the instantaneous output does not reveal them. Mechanics is analogous: position alone cannot continue a second-order motion; position plus velocity can.
- **Markov property.** For a discrete process without explicit inputs,

{math}
\Pr(S_{k+1}\mid S_k,S_{k-1},\ldots,S_0)=\Pr(S_{k+1}\mid S_k).
{/math}

Given the current state, consulting earlier states does not improve the prediction inside the model. This **does not mean physical absence of memory**: the relevant memory is already in the state. It does not mean independence between successive states either, nor is it a synonym of Bayesian inference. A finite [[HF547EI2|Markov chain]] is a particular case; a deterministic equation with a sufficient state shares the idea of sufficiency without being a random walk over a finite list of nodes.
- Sufficient does not mean minimal, observed or controllable. A state can be sufficient and redundant, sufficient and partly hidden, sufficient and contain modes no input can act on. Input-output minimality is a separate question ([[u0TgVFYF|controllability and observability]]).
- With a pure delay, the state may need a segment of history rather than a finite vector. Enlarging the state represents many memories, but does not guarantee compressing them exactly into a few variables. See [[hSeQakhh|delay and lag]].

## Interactions

- [[HdnS06xf|hidden state]] : : An RNN hidden state is engineered to be a sufficient state for the sequence; whether it actually is depends on what the future needs, not on the name
