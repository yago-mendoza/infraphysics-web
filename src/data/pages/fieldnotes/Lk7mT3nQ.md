---
uid: "Lk7mT3nQ"
address: "ML//neural network//loss landscape"
name: "Loss Landscape"
date: "2026-03-11"
---
The surface you get when you plot the [[DxaRVjHg|loss function]] value against all possible combinations of a neural network's weights. Each point on the surface represents one specific configuration of weights and how badly the network performs with that configuration. The [[Gd5tR8wP|gradient descent]] optimizer moves across this surface, always trying to go downhill.

The problem: a typical network has millions of parameters, so the landscape lives in millions of dimensions. We cannot see it. Visualization requires [[dr9Kx5mW|dimensionality reduction]] (projecting onto a 2D plane using random orthogonal directions, then plotting loss as the third axis). These projections are imperfect (like a photograph of a 3D scene) but preserve enough structure to generate useful insights about the morphology of the training process.

Key features of loss landscapes include [[Vn3kM7nQ|minima]] (valleys where the optimizer converges), [[Sp5mK8cJ|saddle points]] (points that look like minima in some directions but not others), and the overall smoothness or ruggedness of the terrain (which correlates with how well the network generalizes).

## Interactions

- [[Gd5tR8wP|Gradient Descent]] : : gradient descent is the *process* of moving across the loss landscape; the landscape is the *terrain* it moves through. the shape of the terrain determines whether gradient descent converges quickly, gets stuck, or oscillates
- [[DxaRVjHg|Loss Function]] : : the loss function defines what gets plotted on the vertical axis of the landscape; different loss functions (cross-entropy, MSE) produce different surface geometries for the same set of weights
