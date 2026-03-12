---
uid: "Vn3kM7nQ"
address: "ML//neural network//loss landscape//minima"
name: "minima"
date: "2026-03-11"
---
A point in the [[Lk7mT3nQ|loss landscape]] where the loss value is lower than all nearby points. A local minimum is lower than its neighbors; a global minimum is the lowest point on the entire surface.

Classical optimization theory worried about local minima trapping the optimizer in suboptimal solutions. In deep learning this turned out to be less of a problem than expected. In high-dimensional networks, most local minima have loss values very close to the global minimum; the real obstacles are [[Sp5mK8cJ|saddle points]], which are far more common. The [[Bx4nK9wP|blessing of dimensionality]] explains why: with millions of dimensions, there are so many escape routes from any point that getting truly stuck in a bad minimum is rare.

The width of a minimum matters as much as its depth. [[Fv6tR3nQ|Flat minima]] are associated with better generalization; sharp minima tend to overfit.
