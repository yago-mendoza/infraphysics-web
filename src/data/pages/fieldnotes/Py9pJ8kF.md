---
uid: "Py9pJ8kF"
address: "ML//neural network//polysemanticity"
name: "Polysemanticity"
date: "2026-03-05"
---
A single neuron responds to multiple unrelated concepts: the same neuron fires for "cat photos", "the concept of trust", and "words ending in -tion". This is the default state of neural networks, not the exception.
- The direct consequence of [[Sp2tK6jL|superposition]]: when a model encodes more concepts than it has neurons, concepts must share neurons. Each neuron participates in multiple unrelated representations, creating polysemantic activation patterns.
- This is why naive neuron-level interpretability fails. Looking at what maximally activates a single neuron gives you a confusing collage of unrelated inputs. The neuron isn't "about" any single thing; it's a shared axis in a compressed space.
- [[Mn7cR3xF|Monosemanticity]] is the goal, polysemanticity is the obstacle. The work of [[UHGnehtS|mechanistic interpretability]] is largely about decomposing polysemantic neurons into monosemantic [[Ft9pL5hS|features]] using tools like [[Sa4vB8mQ|sparse autoencoders]]
- The "grandmother cell" debate in neuroscience is the same question: does the brain have one neuron per concept (monosemantic) or does each neuron participate in many concepts (polysemantic)? In artificial networks, the answer is clear: polysemantic is the norm because it's more parameter-efficient.
- Polysemanticity scales with model capacity: smaller models have MORE polysemantic neurons (more compression), larger models trend toward more monosemantic representations (more capacity). This partially explains why larger models are easier to interpret.

