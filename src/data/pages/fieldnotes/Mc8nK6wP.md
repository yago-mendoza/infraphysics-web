---
uid: "Mc8nK6wP"
address: "ML//neural network//loss landscape//mode connectivity"
name: "mode connectivity"
date: "2026-03-11"
---
The finding that different [[Vn3kM7nQ|local minima]] in the [[Lk7mT3nQ|loss landscape]] are connected by paths along which loss stays low. These paths are not straight lines; they are curved (Bezier curves, polygonal chains) but they exist, and training/test accuracy remains nearly constant along them.

Discovered by Garipov, Izmailov et al. (NeurIPS 2018). The implication is fundamental: the loss landscape of deep networks is not a disconnected archipelago of isolated valleys. It is more like a mountain range with passes between valleys. The optimizer does not need to find *the* right minimum; it needs to find *any* minimum in a connected basin, and from there, low-loss paths lead to other good solutions.

This has practical applications in model ensembling (averaging weights of models along these connecting paths produces better predictions than either endpoint) and in understanding why different random initializations converge to solutions of similar quality.
