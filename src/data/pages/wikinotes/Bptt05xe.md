---
uid: "Bptt05xe"
address: "ML//RNN//backpropagation through time"
name: "backpropagation through time"
date: "2026-07-04"
---
[[aufHHy2p|Backpropagation]] applied to an [[mBCcy7bn|RNN]] by unrolling the loop across timesteps and treating it as one deep feedforward net.
- The error at the end of a sequence flows backward through every timestep, multiplying by the recurrent matrix once per step.
- Those repeated multiplications are exactly what cause the [[7IHpnRNx|vanishing gradient]] (and exploding gradient) problem.
- Truncated BPTT caps how many steps back the gradient travels, trading memory of the distant past for stable training.
