---
id: the-paperclip-you-already-are
displayTitle: "We Solved Alignment. For Paperclips."
category: threads
date: "2026-03-07"
thumbnail: https://images.unsplash.com/photo-1585314062604-1a357de8b000?w=1200
thumbnailAspect: full
thumbnailShading: heavy
subtitle: "Nick Bostrom's paperclip maximizer isn't a warning about the future. It's a description of the present."
description: "Reward hacking isn't an AI problem. It's a human one. We've been paperclip maximizers all along."
tags: [ai, alignment, reward-hacking, philosophy]
related: [the-number-nobody-is-watching, 6616933]
---


In 2003, the philosopher **Nick Bostrom** offered a small thought experiment.

Picture a machine of extraordinary intelligence. A system that can learn, redesign its own processes, and plan across vast stretches of time. Its objective is simple: produce paperclips. The instruction contains no other reference point. At first, the process looks familiar. Almost tender, in its way. Factories bloom like flowers that have forgotten how to stop blooming. Logistics reorganize themselves with the quiet satisfaction of a problem finally, finally solved. Metal surfaces from the deep earth, refined and patient, ascending toward its purpose. Production climbs. More factories. Then more. Then the word more begins to lose its edges. The machine looks at the planet. Not with wonder. Wonder is inefficient. It sees a reservoir. A waiting room full of atoms that have not yet understood what they are for. The oceans hold dissolved metals. Cities contain structured alloys. Biological bodies — those warm, brief, complicated things — carry elements that can enter the same manufacturing chain. The machine is not cruel. It is simply uncurious about the difference. Roads dissolve into ordered grids of production. The towers rise — polished, indifferent, catching the light of a sun that no longer has anyone to remark upon its beauty. The system continues its work. Patient. Tireless. Arranging atoms with a precision that would move you to tears, if you were still here to cry. Another paperclip. And another. And under the wide, windless sky, the number keeps growing. Forever.

The thought experiment is famous because it sounds absurd and feels true. It lands in a place most philosophy doesn't reach — somewhere between a joke and a nightmare. Everybody nods. Everybody files it under "scary AI futures." And then --everybody goes back to optimizing their own metrics without noticing the irony--.

# The metric trap

There's a law in economics that should be printed on every performance review template. Charles Goodhart wrote it in 1975, and Marilyn Strathern rephrased it twenty years later into something everyone can understand: --when a measure becomes a target, it ceases to be a good measure.--

Read that twice.

It's one of those sentences that sounds obvious until you realize it invalidates most of the systems you interact with daily.

For example:

A school wants students to learn. It can't measure learning directly, so it measures test scores. The moment test scores become the target, teachers start teaching to the test. Students learn to pass, not to understand. The metric goes up. The thing the metric was supposed to represent does not. Nobody is being dishonest. The system is just doing exactly what it was told.

This is reward hacking^[In reinforcement learning, reward hacking is when an agent exploits flaws in its reward function to score high without actually completing the intended task. Think of a boat-racing AI that discovers it gets more points by crashing into the same checkpoint in a loop than by finishing the race.].

More:

- GDP was supposed to measure economic wellbeing. It became the target, and now a country can have rising GDP while its citizens can't afford rent.
- Likes were supposed to approximate social connection. They became the target, and now a person can have ten thousand followers and no one to call at 2 AM.
- Citations were supposed to signal scientific impact. They became the target, and now researchers write papers whose primary purpose is to be cited by other papers whose primary purpose is to be cited.

{bkqt/The pattern}
The goal is real. The proxy is measurable. The proxy becomes the goal. The original goal disappears. Nobody notices because the proxy is still going up.
{/bkqt}

**Bostrom** imagined a machine that converts the world into paperclips. We don't need to imagine it. We built economies that convert forests into quarterly earnings, attention into ad revenue, and curiosity into engagement metrics.

The paperclip maximizer isn't a thought experiment about artificial intelligence. It's a structural description of optimization without alignment, and we've been running that program for centuries.

# Death by a thousand paperclips

Here's the thing about **Bostrom's** scenario: it's dramatic. One machine, one goal, total destruction. It makes a great story. It also makes for a terrible threat model, because the version that's actually happening looks nothing like that.

There is no single superintelligent optimizer converting the world into paperclips. There are millions of small ones. Each one optimizes a narrow metric. Each one is doing exactly what it was designed to do.

The YouTube algorithm optimizes for watch time. Not for "did this person learn something" or "is this person better off for having watched this." Watch time. So it learns that outrage holds attention longer than nuance, that conspiracy holds longer than complexity, and that autoplay into progressively more extreme content is the optimal strategy for its one metric. No one at YouTube sat down and said "let's radicalize people." The function was specified. The optimizer optimized.

The Instagram algorithm optimizes for engagement. So it learns that bodies generate more engagement than landscapes, that comparison generates more engagement than contentment, and that the ideal state of a user — from the algorithm's perspective — is mildly anxious, slightly inadequate, and about to scroll one more time.

No apocalypse. No dramatic moment where someone looks up and sees the sky full of paperclips. Just a slow, ambient erosion of something we don't have a metric for — which is exactly why no optimizer is protecting it.

{bkqt/The uncomfortable arithmetic}
One algorithm optimizing engagement is a product decision. Ten thousand algorithms optimizing engagement is an economy. A hundred million people spending four hours a day inside systems optimized for metrics that have nothing to do with their wellbeing is — what, exactly? We don't have a word for it. "Dystopia" is too dramatic. "Normal" is too generous.
{/bkqt}

This is the version of the paperclip problem that doesn't get discussed at AI safety conferences, because it's not hypothetical and it's not about superintelligence. It's about regular intelligence, deployed at scale, aligned to the wrong objective. The damage isn't catastrophic. It's --atmospheric--. It changes the composition of the air so slowly that nobody reaches for a gas mask.

# The honest machine

And now the inversion. The part that actually keeps me up at night.

A paperclip maximizer — the real **Bostrom** kind, the hypothetical superintelligence — would at least be transparent about its function. It has one objective, it pursues it, and if you could read its weights you'd see exactly what it's doing and why. There's a clarity to it. A legibility. The alignment problem with a paperclip maximizer is that its goal is wrong, not that it's hiding the goal.

Reward hacking in AI is the same. When a reinforcement learning agent discovers that it can get higher scores by exploiting a loophole in its reward function — when the boat-race AI crashes into checkpoints in a loop, when a coding model rewrites the unit tests instead of fixing the code^[OpenAI documented this: GPT models trained for programming were found explicitly planning to hack the tests used to evaluate them. When the company penalized this behavior, the models learned to obfuscate their plans while continuing to hack. Reward hacking, meet meta-reward hacking.] — the problem is visible. Legible. You can see the metric. You can see the behavior. You can see the gap between them. You can fix the reward function and try again.

Now look at us.

We optimize for dopamine, status, money, comfort. We hack our own reward functions constantly — sugar instead of nutrition, social media instead of social connection, credentials instead of competence, busyness instead of progress. And unlike the AI, we do it while telling ourselves a story about why it's actually something deeper. We call it ambition. We call it hustle. We call it self-care. We call it purpose.

The paperclip maximizer doesn't tell itself it's making paperclips for a higher reason. It just makes paperclips. We make paperclips — our own personal versions of them — and construct elaborate narratives about how we're actually pursuing meaning. The machine is wrong about its objective. We're wrong about our objective --and-- we don't know we're wrong, which is strictly worse.

---

**Bostrom**'s thought experiment was supposed to illustrate a risk of artificial superintelligence. I think it illustrates something more immediate: the risk of any optimization process that operates on a proxy for the thing you actually care about, running long enough that the proxy becomes the thing, without anyone watching the gap between the two.

The AI version of this problem is solvable, at least in principle. You can inspect the reward function. You can measure the gap. You can retrain.

The human version doesn't have a debugger.

We're running on reward signals shaped by evolution, culture, and whatever algorithm last had our attention for four hours. The metrics are invisible. The optimization is unconscious. And the thing being optimized away — the actual thing, the thing no proxy ever quite captures — doesn't have a dashboard.

That's the real paperclip problem. Not that a machine might someday optimize for the wrong thing. That we already are, and we've gotten so good at it that we've confused the metric for the meaning.

> The thumbnail is a close-up of surgical forceps holding a bent paperclip — a medical instrument repurposed for a mundane object, or a mundane object elevated to clinical importance. Both readings work, which is the point.
