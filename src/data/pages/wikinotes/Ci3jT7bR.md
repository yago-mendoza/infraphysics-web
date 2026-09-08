---
uid: "Ci3jT7bR"
address: "ML//Alignment//mechanistic interpretability//circuit"
name: "Circuit"
date: "2026-03-06"
---
A minimal subgraph of a neural network that implements a specific behavior: the exact set of neurons, [[ml8njOQc|attention]] heads, and [[Pr8dt3wz|MLP]] layers that collaborate to produce a particular computation.
- The core unit of [[UHGnehtS|mechanistic interpretability]]. Instead of asking "what does this model do?", circuits ask "which exact components do this specific thing, and how do they connect?"
- Example: the [[Ih8nK5xW|induction head]] circuit. Two attention heads work together: the first (previous token head) copies position information, the second (induction head) uses it to predict the next token in a repeated sequence. This is a circuit: specific components, specific wiring, specific behavior.
- Finding circuits means ablation: remove or corrupt components and measure what breaks. If deactivating three attention heads kills the model's ability to do indirect object identification but nothing else, those heads ARE the circuit for that task.
- Circuits can be composed: simple circuits combine into more complex behaviors. The [[Sp2tK6jL|superposition]] problem is that circuits overlap; the same neurons participate in multiple circuits, making them hard to isolate.
- This is why [[Sa4vB8mQ|sparse autoencoders]] matter: they decompose [[Sp2tK6jL|superposition]] into individual [[Ft9pL5hS|features]], making it possible to trace which features activate which circuits. SAEs are the microscope, circuits are what you find under it.
- The [[Rs6cD4vX|residual stream]] is the communication bus: circuits write to it and read from it. Understanding circuits means understanding what information flows through the residual stream at each layer.

