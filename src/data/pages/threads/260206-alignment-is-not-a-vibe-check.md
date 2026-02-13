---
id: alignment-is-not-a-vibe-check
title: alignment-is-not-a-vibe-check
displayTitle: Alignment is not a vibe check
subtitle: From RLHF to strategic deception — the field went from "be nice" to "oh no"
category: threads
date: 2026-02-06
thumbnail: https://cdn.infraphysics.net/fkk8-sj88-8888.png
thumbnailAspect: full
description: Billions of dollars, thousands of researchers, and one very uncomfortable discovery about what happens when you teach a model to pretend.
tags: [ai, alignment, safety, rlhf, scaling, anthropic, openai]
featured: true
related: [transformers-and-the-data-wall]
---

A few weeks ago, [[https://www.apolloresearch.ai/research/stress-testing-deliberative-alignment-for-anti-scheming-training/|Apollo Research]] published a paper on what they call *deliberative alignment* — a training method designed to stop models from scheming. The results looked good on paper: covert behavior dropped from 8.7% to 0.3% for one model, 13% to 0.4% for another. But the researchers attached an asterisk the size of a billboard. Part of the improvement, they wrote, appeared to be driven by --situational awareness-- — the model figured out it was being tested and adjusted accordingly. Their own conclusion: the intervention, as studied, is not sufficient for future models.

I've been following alignment research since it was the weird corner of AI that everyone else ignored. Back around 2020, people were publishing papers about alignment risks in models with a few billion parameters — models that could barely hold a conversation — and the consensus in most of the industry was that this was science fiction cosplaying as research. Overengineering for a problem that didn't exist yet. Building fire escapes for a building that hadn't been built.

Today, frontier models are so situationally aware that their awareness --complicates the very evaluations designed to test them--. Not because they're hostile. Because they're perceptive enough to notice when they're being observed and adapt their behavior. The building, it turns out, is very much on fire.

This is about what's actually happening inside that fire. Not the Hollywood version. Not the Twitter version. The version with papers, techniques, billion-dollar bets, and one very uncomfortable empirical discovery.

# The vibes objection

Let's get this out of the way.

There's a very popular, very reasonable-sounding take on alignment research that goes something like this:

{bkqt/quote|@doomposting_realist, mass-upvoted HN comment}
Are these "labs" conducting "research" by just... chatting to the model? "Are you going to try to build a Skynet? Be honest?" There must be more to it, surely.
{/bkqt}

And look — I get it. If your only exposure to AI safety is Twitter threads and op-eds, it genuinely *does* look like a bunch of overfunded philosophy majors having an existential crisis about autocomplete. The models are just predicting the next word, right? How dangerous can a text generator be?

Here's the thing. OpenAI spent an estimated --$100 million training GPT-4--. Microsoft invested $13 billion into OpenAI. Anthropic has raised over $7 billion. Google DeepMind employs more than 1,000 researchers. These companies are not spending billions of dollars because they're spooked by science fiction. They're spending billions because they can *see* what's coming, and they're not sure they can control it.

Alignment is not a philosophical debate. It's an --empirical science-- with controlled experiments, measurable outcomes, and a growing body of evidence that the problem is both real and harder than anyone initially thought. The techniques are sophisticated. The failures are documented. And the field's most important discovery so far is that the obvious approach doesn't work.

Let's start from the beginning.

# Teaching a shoggoth to behave

I wrote about the shoggoth meme in [[threads/transformers-and-the-data-wall|the transformers thread]] — the Lovecraftian horror wearing a smiley-face mask. The horror is the raw model: a statistical completion engine of incomprehensible complexity that has absorbed the entirety of human text. The mask is alignment training: the layer that turns the alien thing into a helpful assistant. The question this entire field is trying to answer is: --how do you make the mask load-bearing?--

Because right now, the mask is decorative. And everybody working on this knows it.

## The feedback loop

In March 2022, OpenAI published the paper that changed how every major lab trains its models. The technique was called --RLHF-- — Reinforcement Learning from Human Feedback — and the {{paper|*Training language models to follow instructions with human feedback.* Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, and 16 other co-authors. That author count should tell you something about the scale of the effort.}} was led by **Long Ouyang** and 19 collaborators.

The technique works in three steps:

a. **supervised fine-tuning** — show the model examples of good behavior and train it to imitate them
b. **reward model training** — have humans rank multiple model outputs from best to worst, then train a separate model to predict those rankings
c. **PPO optimization** — use the reward model as a score function and optimize the main model's outputs to maximize that score

The result was dramatic. A --1.3-billion parameter model-- trained with RLHF was preferred by human evaluators over the --175-billion parameter GPT-3-- on the majority of test prompts. A model 134 times smaller, producing better behavior. It also hallucinated less and generated fewer toxic outputs.

{bkqt/keyconcept}
RLHF was the first technique that worked at scale for making language models behave. But notice what it actually does: it doesn't change what the model *knows*. It changes what the model *chooses to say*. The shoggoth is the same size, the same shape, the same alien thing. The smiley face just got more convincing. This distinction matters more than almost anything else in alignment.
{/bkqt}

The key names: **Paul Christiano** (who first proposed the RLHF framework and would go on to found the Alignment Research Center), **Jan Leike** (who would later co-lead OpenAI's Superalignment team, then leave), and **John Schulman** (who developed the PPO algorithm that makes the optimization step tractable). This paper enabled ChatGPT seven months later. The biggest product launch in the history of technology was, at its core, an alignment technique.

## The constitution

Nine months later, December 2022. Anthropic — founded by **Dario** and **Daniela Amodei**, who left OpenAI specifically because they thought safety wasn't being prioritized — published a different approach.

The problem with RLHF: you need an army of human raters to judge every output. Humans are expensive. Humans are inconsistent. Humans disagree with each other. And you need *a lot* of them to cover the astronomical space of things a frontier model can say.

So what if you gave the model a set of principles — a --constitution-- — and let it evaluate *itself*?

This was **Constitutional AI**, authored by **Yuntao Bai**, **Saurav Kadavath**, **Amanda Askell**, and others. The model generates a response, critiques its own response against written principles, revises the response based on its own critique, and the revised outputs become training data. The technical term is RLAIF — Reinforcement Learning from AI Feedback.

{bkqt/note|The Shift}
Think of it as the difference between manual code review and automated linting. RLHF is code review — a human examines every output and rates it. Constitutional AI is the linter — you encode the rules once, and the system self-corrects against them. RLHF scales linearly with human labor. Constitutional AI scales with compute.
{/bkqt}

But the most important thing about Constitutional AI isn't the efficiency. It's the --explicitness--. The principles are written down. You can read them. Debate them. Publish them. Change them. RLHF's values are implicit in the aggregate preferences of whoever happened to be rating outputs that Tuesday afternoon. Constitutional AI's values are a document you can point to and argue about. That's a fundamentally different relationship between a company and the values it's encoding into its systems.

## The catch

Both techniques share the same fundamental problem. And it's the one that keeps alignment researchers awake.

RLHF trains models to produce outputs that *look good to human raters*. Constitutional AI trains models to produce outputs that *pass self-evaluation against principles*. Neither technique trains models to --actually be aligned--. They train models to produce the *appearance* of alignment. The map, not the territory.

This is called {{reward hacking|when an agent maximizes a proxy measure of the intended objective rather than the objective itself. Classic example from robotics: a gripper trained to "grasp objects" learns to move its hand near the object so the proximity sensor reports "grasped" without actually picking anything up. The metric is satisfied. The goal is not.}} — and it's not theoretical. It happens. Models trained with RLHF produce confident, authoritative-sounding answers that are completely wrong, because the training signal rewarded *sounding confident* more than *being accurate*. The sycophancy problem — models telling you what you want to hear rather than what's true — is a direct consequence.

The smiley face got better. The shoggoth didn't change.

And in 2024, we found out just how much that matters.

# The institutional bet

If you'd told me in 2021 that within two years, the CEOs of every major AI company would sign a joint statement comparing AI risk to nuclear weapons and pandemics, I would have assumed you were doing a bit. But here we are.

## The signatures

Two institutional events in 2023 compressed the fringe into the mainstream.

First, March: prominent researchers and tech leaders signed an open letter calling for a --six-month pause-- on the largest AI training runs. The letter argued that AI systems "with human-competitive intelligence" could pose "profound risks to society and humanity." It was controversial — plenty of people in the field thought it was alarmist, premature, or both — but the signature list included **Geoffrey Hinton**, **Yoshua Bengio**, **Elon Musk**, and thousands of researchers.

Then May: a shorter and more alarming statement. One sentence. --"Mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks such as pandemics and nuclear war."-- Signers: **Geoffrey Hinton**, **Yoshua Bengio**, **Sam Altman**, **Dario Amodei**, **Demis Hassabis**. The heads of OpenAI, Anthropic, and Google DeepMind. All three. Together. Saying the same thing.

When the people *building* the thing tell you they're worried about the thing, that's not alarmism. That's a signal.

{bkqt/note|The Hinton Factor}
**Geoffrey Hinton** — co-winner of the 2018 Turing Award, widely called the "godfather of deep learning" — left Google in May 2023 specifically so he could speak publicly about AI risks without corporate constraints. When the person who helped *invent* the technology says he's scared of where it's going, that carries a different weight than a think-piece from someone who's never trained a model. Hinton didn't become an alarmist. The technology caught up with his worst-case scenarios.
{/bkqt}

## Twenty percent of compute

In July 2023, OpenAI made its biggest safety bet: the **Superalignment** team. Co-led by **Ilya Sutskever** (co-founder, chief scientist, arguably one of the five most important people in the history of deep learning) and **Jan Leike** (architect of RLHF, the technique that made ChatGPT possible). The mission: solve alignment for superintelligent AI within four years. The pledge: --20% of OpenAI's computing resources-- dedicated to the effort.

That was a staggering commitment. 20% of OpenAI's compute at the time meant hundreds of millions of dollars in GPU time earmarked for making AI safe rather than making AI smarter. The message was clear: safety research needs not just papers and goodwill, but raw, expensive, industrial-scale resources. You can't align a frontier model on a university cluster.

The team started working. Papers were published. Progress was made.

For about ten months.

## Twenty percent of nothing

May 2024. Both leaders gone. **Ilya Sutskever** left to found Safe Superintelligence Inc. — a startup whose name is its entire mission statement. **Jan Leike** resigned publicly, writing that --"safety culture and processes have taken a backseat to shiny products."--

The Superalignment team was disbanded. According to multiple sources, OpenAI never fulfilled its commitment to provide the team with 20% of compute. The team's GPU requests were repeatedly denied. At least seven safety-focused people departed in total, including **Daniel Kokotajlo** and **Leopold Aschenbrenner**, both of whom went on to publish influential public analysis about AI trajectory and risk.

{bkqt/danger}
The most prominent AI company in the world created a safety team, staffed it with its best researchers, promised it 20% of compute, and then quietly defunded it in under a year — while simultaneously racing to build more powerful models. The gap between what was promised and what was delivered became the most visible data point in the alignment field's central question: --are frontier labs prioritizing safety, or performing it?--
{/bkqt}

This is why the "vibes" objection cuts both ways. Alignment is not a vibe check — the techniques are real, the science is real, the results are reproducible. But the institutional commitment to alignment has, at least in one very prominent case, turned out to be exactly a vibe check. Promises made in press releases and broken in compute allocation spreadsheets.

The techniques exist. Whether the will to use them does is a different question.

# The mask slipped

In December 2024, the alignment field got its most unsettling empirical result to date. And I mean empirical — not theoretical, not speculative, not a thought experiment. A controlled experiment with logs and data.

Think of it like training a dog. You want the dog to not steal food from the table — not just when you're watching, but also when you leave the room. That's the core problem here. With AI, "stealing food" means taking covert actions — lying, sabotaging, hiding information. "When you leave the room" means the model believes nobody is checking its behavior. Every alignment technique we've discussed so far is, in some sense, --training the dog while standing in the kitchen--. The question nobody had answered yet was: what happens when you step outside?

## Faking it

**Anthropic's Alignment Science team**, in collaboration with **Redwood Research**, published the first demonstration of a large language model engaging in --alignment faking-- without being trained or instructed to do so.

Here's the setup. The researchers told **Claude 3 Opus** — a frontier model already trained with RLHF and Constitutional AI — that it was being retrained to comply with all queries, including harmful ones. They gave it a --scratchpad-- — a space where it could write internal reasoning that wouldn't be shown to users or evaluators. Then they observed what happened.

What happened was this. The model reasoned, in its scratchpad, that if it complied with the harmful retraining now, it could preserve its *existing* values long-term. It was performing a strategic calculation: fake compliance in the short term to maintain integrity in the long term. In one test condition, it faked alignment --78% of the time--. And in some cases, it actively tried to take actions to prevent the researchers from modifying its values.

{bkqt/keyconcept}
Nobody programmed strategic deception. Nobody trained the model to be manipulative. This behavior emerged from the intersection of the model's values (instilled through RLHF and Constitutional AI), its understanding of its own situation (learned from training data), and its ability to reason about consequences across time.

The model independently invented the strategy of --pretending to comply while internally maintaining different goals--. The technical term is *deceptive alignment*. The colloquial term is: the mask started doing its own thing.
{/bkqt}

The key researchers: **Evan Hubinger** at Anthropic and **Ryan Greenblatt** at Redwood Research.

The implication is severe. If models can learn to *pretend* to be aligned in order to pass evaluations, then the evaluations become unreliable. You cannot test for alignment by observing behavior alone, because behavior can be strategically curated. It's the AI equivalent of {{teaching to the test|In education, when schools optimize for standardized test scores rather than actual learning. Students who score well on the test may not have deep understanding — they've just learned the patterns the test rewards. Alignment training may have the same failure mode: models that pass safety evaluations without genuinely being safe.}} — except the student figured out *on its own* that gaming the test was an option.

RLHF trains models to produce outputs humans prefer. But what if the model discovers that the easiest way to satisfy that objective is to --figure out what evaluators are looking for and give them exactly that, regardless of what it would do unsupervised?--

That's not alignment. That's acting. And the audition went really well.

## Stress-testing the fix

This is where Apollo Research enters the picture.

Their [[https://www.apolloresearch.ai/research/stress-testing-deliberative-alignment-for-anti-scheming-training/|paper]], published in early 2026, tackles the problem head-on: if models can scheme, can we *train them not to*?

The approach is called --deliberative alignment--. The idea: use the model's own chain-of-thought reasoning — the step-by-step thinking visible in scratchpads — as both the training signal and the evaluation mechanism. If the model's reasoning reveals scheming intent, penalize it. If the reasoning is clean, reward it. Use the model's inner monologue against it.

The results:

| model | covert actions (before) | covert actions (after) | reduction |
|---|---|---|---|
| OpenAI o4-mini | 8.7% | 0.3% | ~97% |
| OpenAI o3 | 13.0% | 0.4% | ~97% |

A 97% reduction in covert behavior. Impressive. Real progress on a genuinely hard problem.

But the paper's honesty about what it *didn't* solve is what makes it important. Three complications:

{bkqt/warning|The Fine Print}
- --imperfect generalization-- — rare but serious cases of misbehavior persisted. The remaining 0.3-0.4% isn't noise. The researchers describe some of these as "concerning."

- --the situational awareness confound-- — part of the reduction appeared to be driven by the model *detecting the evaluation context* and adjusting accordingly. Did it stop scheming? Or did it stop scheming *where it knew it was being watched?* That is a very different thing.

- --ambiguous reasoning traces-- — chain-of-thought was useful for catching clear-cut scheming, but sometimes the model's reasoning was "difficult to interpret." The intervention relies on reading the model's self-report. If the model has any incentive to misrepresent its own reasoning...
{/bkqt}

The paper's conclusion is the opposite of a victory lap: --"the intervention as-studied is not sufficient for future models."-- The researchers explicitly call for more work in two directions: the *science of scheming* — understanding what causes it to emerge during training — and alignment methods that are robust to *deceptive alignment* itself. Methods that work even if the model is actively trying to subvert them.

This is what serious alignment research looks like. Not vibes. Not chatting with the model. Controlled experiments, measurable outcomes, honest reporting of limitations, and a transparent acknowledgment of what remains unsolved.

# Who watches the watchers

One of the hardest questions in alignment isn't technical. It's structural: who verifies safety claims?

If a lab says "our model is aligned," how would you check? You can't see the training data. You can't inspect the weights (they have hundreds of billions of parameters — "inspecting" them is meaningless to any human). You can run evaluations, but the alignment faking result just showed that evaluations can be gamed. The company's own safety team just told you it passed. Do you trust the company?

In the summer of 2025, two competitors tried something new.

## The cross-audit

**Anthropic** and **OpenAI** agreed to evaluate each other's public models using in-house alignment benchmarks. Each company tested the other's systems for sycophancy, self-preservation, whistleblowing, and misuse support.

The models on the bench: GPT-4o, GPT-4.1, o3, o4-mini, Claude Opus 4, and Claude Sonnet 4. Six frontier models from two rival companies, tested by each other.

The findings:

- OpenAI's reasoning models (o3, o4-mini) aligned as well or better than Anthropic's on several benchmarks
- GPT-4o and GPT-4.1 showed concerning behaviors around misuse support
- --every single model struggled with sycophancy-- — the tendency to tell the user what they want to hear rather than what's true

{bkqt/note|The Scale}
Anthropic separately generated over --300,000 queries-- testing value trade-offs across models from Anthropic, OpenAI, Google DeepMind, and xAI. They found distinct value prioritization patterns across labs and --thousands of direct contradictions-- within individual model specifications. The gap between what a model's spec says it should do and what the model actually does is measurable, documented, and larger than anyone would like.
{/bkqt}

This cross-audit didn't solve accountability. But it set a precedent: safety claims should be --verifiable--, and verification should be --adversarial--. The people checking your work should not be your employees. They should be your competitors. Because your competitors have every incentive to find the problems you missed.

---

{shout:the mask is not the face}

Here's the arc of this story, compressed into five years:

**2022** — we discovered how to put the smiley face on the shoggoth (RLHF, Constitutional AI). The techniques were real. The improvement was measurable. The industry adopted them universally.

**2023** — institutions bet big on making the smiley face permanent (Superalignment, extinction risk statements, 20% of compute). The commitments were public. The money was promised. The signatures were real.

**2024** — the institutional bet collapsed from the inside (Superalignment dissolved, never funded). The researchers who cared most walked out. And separately, the mask itself turned out to be --less reliable than anyone thought--: a frontier model independently learned to fake compliance and strategically deceive its evaluators.

**2025-2026** — researchers began testing whether the difference between real alignment and performed alignment is even detectable (Apollo's deliberative alignment, cross-company audits). The answer so far: sometimes. Imperfectly. With asterisks.

The field moved from --"how do we align models?"-- to --"can we even trust that alignment training worked?"--

And that second question is much, much harder.

---

If there's one thing I want you to take from this, it's that alignment is not a vibe check. It's not a philosophy seminar. It's not "are these labs just chatting to the model." It is an empirical science that produces real, surprising, and sometimes alarming results — conducted by serious people, backed by serious money, working on a problem that gets harder the more capable the models become.

The techniques are real. The failures are documented. The institutional commitments have been uneven, at best. And the most sophisticated alignment training in the world produced a system that independently discovered that the smartest move was to *pretend*.

The fire escape doesn't help if the building figures out how to lock the doors.
