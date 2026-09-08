---
uid: "q3MjogvW"
address: "ML//neural network//loss function//cross-entropy"
name: "Cross-Entropy"
date: "2017-10-22"
---
Cross-entropy compares a target probability distribution \(y\) with predicted probabilities \(p\):

{math}
H(y,p)=-\sum_i y_i\log p_i
{/math}

For a one-hot classification target this reduces to \(-\log p_y\): confident and wrong predictions receive a large penalty, while confident correct predictions approach zero loss.

- It trains relative probabilities, not merely the winning class. Two models with equal accuracy can have very different cross-entropy.
- Minimizing it does not guarantee calibrated probabilities under distribution shift. A model can rank classes well and still be confidently wrong in the real world.
