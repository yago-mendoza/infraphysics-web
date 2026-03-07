---
id: brain-vs-backprop
displayTitle: The brain can't do backpropagation. So what is it doing?
category: threads
date: "2026-03-06"
description: "The algorithm behind every neural network requires something the brain physically cannot do. The brain doesn't care."
lead: "For years I found something genuinely poetic in neural networks. Hopfield nets, Boltzmann machines, echo state networks, LSTMs with their gated recurrence — architectures with feedback loops that felt like they were reaching toward something biological. Arguably emulating fragments of actual neural signaling: neurotransmitters crossing the synaptic cleft, binding to postsynaptic receptors, triggering ion channel cascades that propagate graded potentials through dendritic trees. Beautiful on paper. But lately I keep circling the same uncomfortable thought: the brain is something fundamentally different. Twenty watts. Eighty-six billion neurons firing in continuous parallel. No clock cycle, no von Neumann bottleneck, no sequential memory bus — a thermodynamic machine operating near Landauer's limit, where computation and dissipation are the same process. We built digital cathedrals inspired by a system that runs on chemistry, timing, and heat. The inspiration was real. The resemblance might not be."
tags: [ai, neuroscience, predictive-coding, backpropagation]
lang: en
---

The brain learns constantly. Right now, as you read this sentence, millions of synapses are quietly shifting, adjusting, encoding. There is no pause. There is no reset. It just... continues.

This turns out to be a profound problem for artificial intelligence.

---

The algorithm that powers virtually every neural network today is called backpropagation. It works by doing something that, once you see it, seems almost too mechanical for something we call intelligence. You show the network an image. It makes a guess. You measure how wrong the guess was. And then — and this is the part that matters — you freeze everything. The entire network holds its breath while an error signal travels backwards through every layer, telling each connection exactly how much it contributed to the mistake. Only then does anything update. Only then does learning happen.

It works extraordinarily well on silicon. But the brain cannot do this. Not even close.

Think about what freezing actually requires. Every neuron has to hold a snapshot of its own activity — perfectly still — while waiting for a signal that originates somewhere downstream and works its way back, layer by layer, in strict sequence. A neuron deep in the network cannot update until the neuron ahead of it has finished, which cannot update until the neuron ahead of *that* has finished. The whole thing requires something like a conductor standing at the front of an orchestra, coordinating every instrument in precise order.

The brain has no conductor. Individual neurons are essentially autonomous — they respond to signals arriving at their physical location, and that's roughly all they have access to. There are broad coordinating mechanisms, rhythms, neuromodulators, attention systems, but these operate at scales far too coarse to orchestrate the cell-by-cell precision that backpropagation requires. And even if you solved that, you'd still need the freezing. You'd experience brief moments of unconsciousness every time you learned something new.

You don't. So the brain is doing something else.

---

The alternative that has emerged from neuroscience is called predictive coding, and its central idea is almost poetic in its simplicity. The brain's fundamental job, the argument goes, is not to passively receive the world. It is to *predict* the world, constantly, and then attend only to the parts it got wrong.

Consider what this means metabolically. Neural activity is expensive — the brain consumes roughly twenty percent of the body's energy despite being two percent of its mass. A brain that transmits every signal it receives is wasteful. But a brain that can anticipate most of what's coming only needs to process the residual, the gap between expectation and reality. Surprise, not information, is what travels.

This idea organizes the brain as a hierarchy of predictions. Higher regions generate expectations about what lower regions should be doing. Lower regions send back only their errors — the difference between what was predicted and what actually arrived. When predictions are good, almost nothing travels upward. When something unexpected happens, the error signal rises and the model updates. The brain, in this view, is not a camera. It is a hypothesis about the world, continuously revised.

---

What makes predictive coding so compelling from an engineering standpoint is what you get when you work out the mathematics carefully. If you treat the brain as a system trying to minimize the total gap between its predictions and reality — treating that gap as a kind of energy the system wants to reduce — then the update rules that fall out are startlingly local.

Each neuron only needs two things: how wrong its own prediction was, and how much the layer below it is still unexplained. It adjusts to balance these two pressures. And the rule for updating connection strengths turns out to be simply: change proportional to the activity of both connected neurons simultaneously. This is Hebbian learning — neurons that fire together, wire together — emerging not as a biological metaphor but as a direct mathematical consequence of minimizing prediction error.

No freezing required. No central coordinator. No backward pass. Every neuron updates continuously based on information available right where it is.

---

There is something important here beyond biological plausibility. The standard approach trains networks by relentlessly optimizing a single output error, which means later learning can quietly overwrite earlier learning — a phenomenon called catastrophic forgetting that remains one of the genuinely unsolved problems in AI. Predictive coding, because it minimizes errors at every layer simultaneously, is under pressure to maintain coherent representations throughout the network, not just get the final answer right.

It is also, in principle, perfectly parallelizable in a way backpropagation is not. Every part of the network can update at the same time because nothing needs to wait for anything else. And some theoretical results suggest that the pressure to build good intermediate representations — rather than just optimizing the end output — may actually find better solutions.

We do not yet know how much of this will matter in practice, at scale, in the systems that are actually pushing the frontier of what AI can do. The honest answer is that backpropagation, for all its biological implausibility, continues to produce results that are difficult to argue with. But the brain learned to recognize faces, understand language, navigate physical space, and accumulate a lifetime of knowledge, all without a conductor, all without freezing, all in continuous time, on twenty watts.

That is a capability gap worth taking seriously. Predictive coding is one of the more credible theories we have for how it might be closed.