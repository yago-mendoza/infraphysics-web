---
id: ai-wont-explode-it-will-scale
displayTitle: Every time we think we've found the ceiling, the ceiling leaves.
subtitle: Notes from someone who's been inside the slope since before there was a slope
category: threads
date: "2026-03-05"
thumbnail: https://cdn.infraphysics.net/d8kk-c0a8-ldsa.jpeg
thumbnailAspect: full
thumbnailShading: heavy
description: I don't know when ASI arrives. That's the honest part of this post.
tags: [ai, scaling, bitter-lesson, reinforcement-learning, engineering]
featured: true
related: [transformers-and-the-data-wall, everybody-has-an-opinion-on-ai]
---

In 2020 I was doing something I was fairly sure counted as cheating. I had a problem — loading algorithm for cargo ships, luxury vehicles across the Atlantic, combinatorial optimization with enough interdependencies to make it genuinely unpleasant — and I was using a language model to draft the documentation. Not to solve the problem. The models couldn't do that. But I'd found something: if you embedded a question inside a text block and engineered the surrounding context carefully enough, the most probable completion was the answer you wanted. It wasn't a conversation. It was distribution engineering. And I used a regex filter to make sure the outputs varied enough that nobody would notice the pattern, because I was reasonably convinced that if anyone looked closely enough, they would know.

I didn't have a name for what I was doing. I know now it was reward hacking — optimizing the output distribution of a system that had no reward model, before the alignment field had a name. It's not that alignment hadn't been solved yet. It's that nobody had framed it as a solvable problem. At the time it just felt like a trick that worked more often than it should.

Working like that, fighting a base model every day, you develop a certain intuition for semantic continuity. You start to feel when the distribution is about to drift, when a prompt is asking for something the latent space can't sustain, when you're one token away from the model confidently citing a standard that doesn't exist. Four engines — ada, babbage, curie, davinci — zero preference alignment, no RLHF, no system prompt, no meaningful concept of following instructions. You gave them text. The model continued it. What came out, came out. Davinci was 175 billion parameters of raw next-token prediction. When you got lucky, the completion held its register. When you didn't, it invented maritime regulation that sounded real enough to fool an intern. Which I was.

---

Six years later I told Claude Code to restructure a build pipeline with 14 compilation steps. It did it in one shot. I didn't touch anything. That's a task that would have been my entire afternoon and now it's something I kick off and go make coffee.

I've been wrong about ceilings for six years straight. Every time I thought we were near the limit, I wasn't. And I want to explain why I think that's going to continue — not as a belief, but as a measurement.

---

**Pretrain gives you knowledge. Post-train gives you reasoning.**

A base LLM out of pretraining has compressed an absurd amount of information into its weights. It knows things. But it reasons badly — no mechanism for step-by-step deliberation, no internal scratchpad, no way to pause and reconsider. What reasoning models do, the o1, o3, DeepSeek-R1 family, is add extended chain-of-thought between prompt and response. Every intermediate reasoning token is one more chance to verify, correct, backtrack. This converts inference-time compute into output quality, which scales very differently from just making the model bigger.

But the real story isn't the architecture. It's what happens when you combine this with RL.

**Code verifies itself.**

The historical bottleneck of RL for language was always the reward signal. For open-ended tasks you need human evaluators. Crowdworkers. Annotation infrastructure. Expensive, slow, noisy.

Code is different. Code executes. A test passes or fails. A program compiles or it doesn't. You get a binary reward signal, automatic, infinitely scalable, zero marginal cost. This is exactly the trick I was doing manually in 2020 — shaping context so the correct output was the most probable one — except now it's the training loop itself, running at scale, with real verification instead of my regex filter and intuition.

Math is the other self-verifiable domain. In January 2026, an AI system solved Erdős problem #728, open for decades, and formalized the proof in Lean in six hours. Terence Tao verified it. Three Erdős problems fell in seven days. I won't go deeper into the math side because I don't want to get caught speculating outside my lane, but the scoreboard speaks for itself.

**Open source is closing the gap.**

DeepSeek-R1 showed you can train a competitive reasoning model with pure RL — no supervised fine-tuning, no human labels, just a base model and a reward signal. Qwen 3.5 has the highest GPQA Diamond score of any public model: 88.4, PhD-level research questions in physics, chemistry, biology. Cursor crossed $1B in annual revenue. Cognition's Devin went from 34% merged PRs to 67% in a year while getting 4x faster. These companies aren't competitive because they have bigger models. They're competitive because they run RL on the real interactions happening on their platforms. Every accepted suggestion, every merged PR, is a preference signal. They're converting usage into training data, and the models are getting better specifically at the tasks their users actually do.

This is Richard Sutton's argument from 2019, the year before I was wrestling with davinci. The Bitter Lesson: the biggest lesson from 70 years of AI research is that general methods leveraging computation win, by a large margin. Not clever tricks. Not hand-crafted domain knowledge. The method you can feed with more compute and get better results. Every time, in every subfield, over seven decades, the brute-force scalable approach won. RL with automatic verification *is* that method.

---

GPT-3 base was impressive as a demo and limited as a tool. Then GPT-3.5 landed and for the first time it felt like I was talking to something. Not just semantically correct — *appropriate*. It was respecting conversational implicature, tracking turn structure, maintaining register. The output wasn't just right. It was situated. That's a psycholinguistic distinction and it mattered more to me than any benchmark, because I'd spent two years learning to feel exactly when a model lost that thread.

And I'm not even talking about diffusion. Not image generation, not video, not audio. Each of those modalities is another proof that these absurdly dense parameter blocks, these matrices of billions of floating-point numbers, compress the structure of the world in ways we still don't fully understand. You need to be technical to appreciate how strange that is. You need to not be, to appreciate how big it is.

METR's data, published March 2025: the duration of tasks an AI agent can autonomously complete doubles every seven months. In 2020, models could reliably complete tasks that took a human nine seconds. By late 2024, forty minutes. On SWE-bench, models went from 4.4% to 71.7% in a single year.

I've been wrong about ceilings for six years. The first few were slow enough that being wrong didn't feel costly. Now the doubling time on the verified SWE-bench subset is under three months. Being wrong about ceilings is getting more expensive.

---

I don't know when superintelligence arrives. There will be bottlenecks — we'll get into those in other threads. What I know is that the exponential isn't a narrative. It's a measurement. Seven months. And the distance between ada and what we have today sits on the same curve that's going to keep going — not because I believe it, but because the data shows it, and I've watched it long enough to stop being surprised when I'm wrong about where it ends.

AI won't explode. It will scale. And the difference between those two sentences is the difference between a headline and an engineering trajectory.

> The image is a still from "When the Yogurt Took Over," Love, Death & Robots S1E6, 2019. Based on a short story by John Scalzi. A culture of yogurt gains intelligence, solves the national debt, outscales every human institution, and leaves the planet. They never saw it coming, which is the thing about not seeing it coming: nobody is paying attention because everyone is busy. Busy with mortgages and school runs and quarterly reports. Not because they're stupid. Because attention is finite and the world is loud and most people's model of reality doesn't include the possibility that something very small and very quiet is getting smarter faster than they can update their priors. We're not yet at the point where society takes this kind of dialogue seriously, and honestly that's fine, because most of the time that conversation is paranoid nonsense. Except when it isn't. And nobody has a clean heuristic for telling the two apart. John Scalzi might have understood something in 2019 that most of the industry is still catching up to: it doesn't matter whether the thing that outscales you is malicious or indifferent. The result looks the same from below. But if you've watched a base model go from 9 seconds of useful work to 40 minutes in 4 years, the expression on their faces is not fiction at all.

*"When the Yogurt Took Over" — Love, Death & Robots S1E6. John Scalzi, 2019.*