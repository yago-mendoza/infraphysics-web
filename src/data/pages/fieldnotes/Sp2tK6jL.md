---
uid: "Sp2tK6jL"
address: "ML//neural network//superposition"
name: "Superposition"
date: "2026-03-06"
---
Every neuron moonlights — representing dozens of concepts at once, because the model has more ideas than it has neurons to store them in. Neurons represent many different [[Ft9pL5hS|features]] simultaneously through linear combination — angles between feature directions are not perfectly perpendicular.
- The model has far more concepts to represent than it has neurons — superposition is the compression trick.
- The more involved a neuron is across features, the more superposition it exhibits.
- Makes [[UHGnehtS|mechanistic interpretability]] extremely hard — you can't point at one neuron and say "this means X".
- The directions in activation space aren't random — they encode structured relationships, but they overlap and interfere.

## Interactions

- [[Mn7cR3xF|monosemanticity]] : : The opposite goal — one neuron, one concept. Superposition is the natural state, monosemanticity is the aspiration
- [[Sa4vB8mQ|sparse autoencoder]] : : SAEs try to decompose superposed activations into clean, interpretable features
