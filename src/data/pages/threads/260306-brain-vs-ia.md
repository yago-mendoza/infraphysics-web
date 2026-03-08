---
id: brain-vs-backprop
displayTitle: The brain can't do backpropagation. So what is it doing?
category: threads
date: "2026-03-06"
subtitle: "The algorithm behind every neural network requires something the brain physically cannot do. The brain doesn't care."
lead: "I spent a year thinking neural networks were loosely inspired by the brain. Hopfield nets, Boltzmann machines, LSTMs with their gated recurrence — architectures that felt like they were reaching toward something biological. Then I actually looked at how the brain learns, and the resemblance fell apart in about ten minutes."
tags: [ai, neuroscience, predictive-coding, backpropagation]
complexity: 7
lang: en
---

The brain learns constantly. Right now, reading this sentence, millions of synapses are shifting. No pause. No reset. It just continues.

This is a bigger problem for AI than most people realize.

# The freeze

The algorithm behind virtually every [[YrmsQuhU|neural network]] today is [[aufHHy2p|backpropagation]]. Here's how it works: you show the network an image. It makes a guess. You measure how wrong the guess was. And then — this is the part — you --freeze everything--. The entire network holds still while an error signal travels backwards through every layer, telling each connection exactly how much it contributed to the mistake.

Only then does anything update. Only then does learning happen.

It works extraordinarily well on silicon. The brain cannot do this.

Think about what freezing requires. Every neuron has to hold a snapshot of its own activity — perfectly still — while waiting for a signal that originates downstream and works its way back, layer by layer, in strict sequence. A neuron deep in the network can't update until the one ahead of it has finished. The whole thing needs a conductor standing at the front of an orchestra, coordinating every instrument in precise reverse order.

The brain has no conductor. Individual neurons are autonomous — they respond to signals arriving at their physical location, and that's roughly all they have access to. There are broad coordinating mechanisms (rhythms, neuromodulators, attention systems), but these operate at scales far too coarse to orchestrate the cell-by-cell precision backpropagation demands.

And even if you solved that, you'd still need the freezing. You'd experience brief moments of unconsciousness every time you learned something new.

You don't. So the brain is doing something else.

# Prediction, not reception

I found predictive coding through an Artem Kirsanov video at 2 AM on a Tuesday. Ten minutes in I realized every explanation of "how the brain learns" I'd seen before was just backprop with extra steps — and this was the first one that wasn't.

The central idea: the brain's job is not to passively receive the world. --It's to predict the world, constantly, and attend only to the parts it got wrong.--

Consider what this means metabolically. Neural activity is expensive — the brain burns roughly twenty percent of the body's energy despite being two percent of its mass. A brain that transmits every signal it receives is wasteful. But a brain that can anticipate most of what's coming only needs to process the residual — the gap between expectation and reality. Surprise, not information, is what travels.

{bkqt/keyconcept|The hierarchy}
Predictive coding organizes the brain as a hierarchy of predictions. Higher regions generate expectations about what lower regions should be doing. Lower regions send back only their errors — the difference between what was predicted and what actually arrived.

When predictions are good, almost nothing travels upward. When something unexpected happens, the error signal rises and the model updates.

The brain is not a camera. It's a hypothesis about the world, continuously revised.
{/bkqt}

# The math falls out

What makes predictive coding compelling is what happens when you actually work out the math. Treat the brain as a system trying to minimize the total gap between its predictions and reality — treat that gap as a kind of energy to reduce — and the update rules that fall out are local.

Each neuron only needs two things: how wrong its own prediction was, and how much the layer below it is still unexplained. It adjusts to balance these two pressures. And the rule for updating connection strengths turns out to be: --change proportional to the activity of both connected neurons simultaneously.--

That's Hebbian learning. Neurons that fire together, wire together — not as a biological metaphor, but as a direct mathematical consequence of minimizing prediction error.

No freezing. No conductor. No backward pass. Every neuron updates continuously based on information available right where it is.

Compare that to backprop: [[Gd5tR8wP|gradient descent]] requires global coordination — every weight update depends on the final [[DxaRVjHg|loss]]. Predictive coding gets you local updates that collectively minimize the same kind of objective. Same destination, completely different path.

# Why this isn't just academic

There's a practical consequence here that I think gets undersold.

Backprop's standard training loop optimizes relentlessly for a single output error. Later learning can quietly overwrite earlier learning — [[Cf8cD3vX|catastrophic forgetting]], one of the unsolved problems in the field. You train a model on task A, then train it on task B, and it forgets how to do A. The fix right now is either freezing weights (defeating the purpose) or replay buffers (expensive, fragile).

Predictive coding, because it minimizes errors at every layer simultaneously, is under pressure to maintain coherent representations throughout the network — not just get the final answer right. The intermediate layers have their own objectives. They resist being bulldozed by a new task because they're serving multiple masters, not just the output.

It's also perfectly parallelizable in a way backprop isn't. Every part of the network can update at the same time because nothing needs to wait. And some theoretical results suggest that the pressure to build good intermediate representations — rather than just optimizing the end output — may find better solutions in the long run.

# Twenty watts

Backprop works. The results are difficult to argue with. But the brain — the thing that actually learned to recognize faces, understand language, navigate three-dimensional space, and accumulate a lifetime of knowledge — did all of that without a conductor, without freezing, in continuous time, --on twenty watts--.

My GPU rig idles at three hundred.

I don't know if predictive coding will scale to frontier models. Nobody does. The objection that biological plausibility doesn't matter for engineering is fair — up to a point. But we're spending billions on cooling systems and power substations to train networks that still can't learn a second task without forgetting the first. The brain does both, on the energy budget of a dim lightbulb, while also keeping you breathing.

At some point "the biology doesn't matter" stops being pragmatism and starts being cope.

---

Artem Kirsanov, [[https://www.youtube.com/watch?v=l-OLgbdZ3kk&t=448s|"The Brain Doesn't Do Backpropagation"]].
