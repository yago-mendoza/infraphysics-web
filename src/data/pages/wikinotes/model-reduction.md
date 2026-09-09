---
slug: model-reduction
uid: "8CbvYvCN"
address: "mathematics//dynamical systems//model reduction"
name: "model reduction"
date: "2026-09-07"
aliases: ["reduced-order model", "modal truncation", "dominant modes"]
---
Replacing a system with many state variables by one with a few, keeping the behavior that matters. The tool is the same eigen-structure that explains everything else: the [[Xevpd3GQ|modes]] of the system rank its directions by how fast they evolve.
- The idea in one picture. Decompose the state into eigenvectors; each mode has its own eigenvalue, a rate. Fast modes with strongly negative rates die out almost immediately and only matter in the first instants; slow modes dominate everything after that. Keep the \(r\) slow ones, drop the rest, and the system of \(n\) equations becomes one of \(r\) equations that reproduces the long-run behavior. The three-tank network keeps its constant mode and its slowest disagreement and forgets the fastest one ([[eZ9MJEbt|three-tank network]], [[kRgRUf2W|spectral gap]]).
- For nonlinear systems, first find the equilibria, the points where the field is zero, then take the [[BG0z13Wz|Jacobian]] there: the eigenvectors of that matrix are the local modes, and the reduction is done on them. Away from the equilibrium the Jacobian changes and so do the modes ([[GN4YVrLV|linear field]]).
- What it enables: simulate large systems cheaply, design controllers on a handful of modes, and understand which directions a control input or a sensor actually touches ([[u0TgVFYF|controllability and observability]]).
- Relation to numerical methods. Every simulation is already an approximation ([[SQo89ykf|discretization]]), and the fastest mode sets its time step: an explicit scheme must take steps smaller than the fastest rate allows, even when that mode is physically irrelevant. Removing the fast modes is what makes a stiff system cheap to integrate. The data-driven version of the same operation, taking modes from measured snapshots rather than from a matrix, is [[0WlrLnFU|PCA]] applied to trajectories ([[Vp8NyXtD|projection]]).

## Interactions

- [[Vp8NyXtD|projection]] : : Both keep a few directions and drop the rest; projection by variance keeps what moves most in the data, model reduction keeps what persists longest in the dynamics. Same projection, different criterion, and they can disagree about which direction to throw away
