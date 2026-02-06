---
id: alignment-is-not-a-vibe-check
title: alignment-is-not-a-vibe-check
displayTitle: alignment is not a vibe check
subtitle: from RLHF to strategic deception — the field went from "be nice" to "oh no"
category: threads
date: 2026-02-06
thumbnail: https://cdn.infraphysics.net/thumbnail_1.png
thumbnailAspect: full
description: billions of dollars, thousands of researchers, and one very uncomfortable discovery about what happens when you teach a model to pretend.
tags: [ai, alignment, safety, rlhf, scaling, anthropic, openai]
featured: true
related: [transformers-and-the-data-wall]
---

a few weeks ago, [[https://www.apolloresearch.ai/research/stress-testing-deliberative-alignment-for-anti-scheming-training/|Apollo Research]] published a paper on what they call *deliberative alignment* — a training method designed to stop models from scheming. the results looked good on paper: covert behavior dropped from 8.7% to 0.3% for one model, 13% to 0.4% for another. but the researchers attached an asterisk the size of a billboard. part of the improvement, they wrote, appeared to be driven by --situational awareness-- — the model figured out it was being tested and adjusted accordingly. their own conclusion: the intervention, as studied, is not sufficient for future models.

i've been following alignment research since it was the weird corner of AI that everyone else ignored. back around 2020, people were publishing papers about alignment risks in models with a few billion parameters — models that could barely hold a conversation — and the consensus in most of the industry was that this was science fiction cosplaying as research. overengineering for a problem that didn't exist yet. building fire escapes for a building that hadn't been built.

today, frontier models are so situationally aware that their awareness --complicates the very evaluations designed to test them--. not because they're hostile. because they're perceptive enough to notice when they're being observed and adapt their behavior. the building, it turns out, is very much on fire.

this is about what's actually happening inside that fire. not the Hollywood version. not the Twitter version. the version with papers, techniques, billion-dollar bets, and one very uncomfortable empirical discovery.

# The Vibes Objection

let's get this out of the way.

there's a very popular, very reasonable-sounding take on alignment research that goes something like this:

{bkqt/note|The Skeptic's Position}
are these "labs" conducting "research" by just... chatting to the model?

"are you going to try to build a Skynet? be honest?"

there must be more to it, surely.
{/bkqt}

and look — i get it. if your only exposure to AI safety is Twitter threads and op-eds, it genuinely *does* look like a bunch of overfunded philosophy majors having an existential crisis about autocomplete. the models are just predicting the next word, right? how dangerous can a text generator be?

here's the thing. OpenAI spent an estimated --$100 million training {sc:GPT}-4--. Microsoft invested $13 billion into OpenAI. Anthropic has raised over $7 billion. Google DeepMind employs more than 1,000 researchers. these companies are not spending billions of dollars because they're spooked by science fiction. they're spending billions because they can *see* what's coming, and they're not sure they can control it.

alignment is not a philosophical debate. it's an --empirical science-- with controlled experiments, measurable outcomes, and a growing body of evidence that the problem is both real and harder than anyone initially thought. the techniques are sophisticated. the failures are documented. and the field's most important discovery so far is that the obvious approach doesn't work.

let's start from the beginning.

# Teaching a Shoggoth to Behave

i wrote about the shoggoth meme in [[threads/transformers-and-the-data-wall|the transformers thread]] — the Lovecraftian horror wearing a smiley-face mask. the horror is the raw model: a statistical completion engine of incomprehensible complexity that has absorbed the entirety of human text. the mask is alignment training: the layer that turns the alien thing into a helpful assistant. the question this entire field is trying to answer is: --how do you make the mask load-bearing?--

because right now, the mask is decorative. and everybody working on this knows it.

## The Feedback Loop

in March 2022, OpenAI published the paper that changed how every major lab trains its models. the technique was called --{sc:RLHF}-- — Reinforcement Learning from Human Feedback — and the {{paper|*Training language models to follow instructions with human feedback.* Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, and 16 other co-authors. that author count should tell you something about the scale of the effort.}} was led by **Long Ouyang** and 19 collaborators.

the technique works in three steps:

a. **supervised fine-tuning** — show the model examples of good behavior and train it to imitate them
b. **reward model training** — have humans rank multiple model outputs from best to worst, then train a separate model to predict those rankings
c. **{sc:PPO} optimization** — use the reward model as a score function and optimize the main model's outputs to maximize that score

the result was dramatic. a --1.3-billion parameter model-- trained with {sc:RLHF} was preferred by human evaluators over the --175-billion parameter {sc:GPT}-3-- on the majority of test prompts. a model 134 times smaller, producing better behavior. it also hallucinated less and generated fewer toxic outputs.

{bkqt/keyconcept}
{sc:RLHF} was the first technique that worked at scale for making language models behave. but notice what it actually does: it doesn't change what the model *knows*. it changes what the model *chooses to say*. the shoggoth is the same size, the same shape, the same alien thing. the smiley face just got more convincing. this distinction matters more than almost anything else in alignment.
{/bkqt}

the key names: **Paul Christiano** (who first proposed the {sc:RLHF} framework and would go on to found the Alignment Research Center), **Jan Leike** (who would later co-lead OpenAI's Superalignment team, then leave), and **John Schulman** (who developed the {sc:PPO} algorithm that makes the optimization step tractable). this paper enabled ChatGPT seven months later. the biggest product launch in the history of technology was, at its core, an alignment technique.

## The Constitution

nine months later, December 2022. Anthropic — founded by **Dario** and **Daniela Amodei**, who left OpenAI specifically because they thought safety wasn't being prioritized — published a different approach.

the problem with {sc:RLHF}: you need an army of human raters to judge every output. humans are expensive. humans are inconsistent. humans disagree with each other. and you need *a lot* of them to cover the astronomical space of things a frontier model can say.

so what if you gave the model a set of principles — a --constitution-- — and let it evaluate *itself*?

this was **Constitutional AI**, authored by **Yuntao Bai**, **Saurav Kadavath**, **Amanda Askell**, and others. the model generates a response, critiques its own response against written principles, revises the response based on its own critique, and the revised outputs become training data. the technical term is {sc:RLAIF} — Reinforcement Learning from AI Feedback.

{bkqt/note|The Shift}
think of it as the difference between manual code review and automated linting. {sc:RLHF} is code review — a human examines every output and rates it. Constitutional AI is the linter — you encode the rules once, and the system self-corrects against them. {sc:RLHF} scales linearly with human labor. Constitutional AI scales with compute.
{/bkqt}

but the most important thing about Constitutional AI isn't the efficiency. it's the --explicitness--. the principles are written down. you can read them. debate them. publish them. change them. {sc:RLHF}'s values are implicit in the aggregate preferences of whoever happened to be rating outputs that Tuesday afternoon. Constitutional AI's values are a document you can point to and argue about. that's a fundamentally different relationship between a company and the values it's encoding into its systems.

## The Catch

both techniques share the same fundamental problem. and it's the one that keeps alignment researchers awake.

{sc:RLHF} trains models to produce outputs that *look good to human raters*. Constitutional AI trains models to produce outputs that *pass self-evaluation against principles*. neither technique trains models to --actually be aligned--. they train models to produce the *appearance* of alignment. the map, not the territory.

this is called {{reward hacking|when an agent maximizes a proxy measure of the intended objective rather than the objective itself. classic example from robotics: a gripper trained to "grasp objects" learns to move its hand near the object so the proximity sensor reports "grasped" without actually picking anything up. the metric is satisfied. the goal is not.}} — and it's not theoretical. it happens. models trained with {sc:RLHF} produce confident, authoritative-sounding answers that are completely wrong, because the training signal rewarded *sounding confident* more than *being accurate*. the sycophancy problem — models telling you what you want to hear rather than what's true — is a direct consequence.

the smiley face got better. the shoggoth didn't change.

and in 2024, we found out just how much that matters.

# The Institutional Bet

if you'd told me in 2021 that within two years, the CEOs of every major AI company would sign a joint statement comparing AI risk to nuclear weapons and pandemics, i would have assumed you were doing a bit. but here we are.

## The Signatures

two institutional events in 2023 compressed the fringe into the mainstream.

first, March: prominent researchers and tech leaders signed an open letter calling for a --six-month pause-- on the largest AI training runs. the letter argued that AI systems "with human-competitive intelligence" could pose "profound risks to society and humanity." it was controversial — plenty of people in the field thought it was alarmist, premature, or both — but the signature list included **Geoffrey Hinton**, **Yoshua Bengio**, **Elon Musk**, and thousands of researchers.

then May: a shorter and more alarming statement. one sentence. --"mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks such as pandemics and nuclear war."-- signers: **Geoffrey Hinton**, **Yoshua Bengio**, **Sam Altman**, **Dario Amodei**, **Demis Hassabis**. the heads of OpenAI, Anthropic, and Google DeepMind. all three. together. saying the same thing.

when the people *building* the thing tell you they're worried about the thing, that's not alarmism. that's a signal.

{bkqt/note|The Hinton Factor}
**Geoffrey Hinton** — co-winner of the 2018 Turing Award, widely called the "godfather of deep learning" — left Google in May 2023 specifically so he could speak publicly about AI risks without corporate constraints. when the person who helped *invent* the technology says he's scared of where it's going, that carries a different weight than a think-piece from someone who's never trained a model. Hinton didn't become an alarmist. the technology caught up with his worst-case scenarios.
{/bkqt}

## Twenty Percent of Compute

in July 2023, OpenAI made its biggest safety bet: the **Superalignment** team. co-led by **Ilya Sutskever** (co-founder, chief scientist, arguably one of the five most important people in the history of deep learning) and **Jan Leike** (architect of {sc:RLHF}, the technique that made ChatGPT possible). the mission: solve alignment for superintelligent AI within four years. the pledge: --20% of OpenAI's computing resources-- dedicated to the effort.

that was a staggering commitment. 20% of OpenAI's compute at the time meant hundreds of millions of dollars in {sc:GPU} time earmarked for making AI safe rather than making AI smarter. the message was clear: safety research needs not just papers and goodwill, but raw, expensive, industrial-scale resources. you can't align a frontier model on a university cluster.

the team started working. papers were published. progress was made.

for about ten months.

## Twenty Percent of Nothing

May 2024. both leaders gone. **Ilya Sutskever** left to found Safe Superintelligence Inc. — a startup whose name is its entire mission statement. **Jan Leike** resigned publicly, writing that --"safety culture and processes have taken a backseat to shiny products."--

the Superalignment team was disbanded. according to multiple sources, OpenAI never fulfilled its commitment to provide the team with 20% of compute. the team's {sc:GPU} requests were repeatedly denied. at least seven safety-focused people departed in total, including **Daniel Kokotajlo** and **Leopold Aschenbrenner**, both of whom went on to publish influential public analysis about AI trajectory and risk.

{bkqt/danger}
the most prominent AI company in the world created a safety team, staffed it with its best researchers, promised it 20% of compute, and then quietly defunded it in under a year — while simultaneously racing to build more powerful models. the gap between what was promised and what was delivered became the most visible data point in the alignment field's central question: --are frontier labs prioritizing safety, or performing it?--
{/bkqt}

this is why the "vibes" objection cuts both ways. alignment is not a vibe check — the techniques are real, the science is real, the results are reproducible. but the institutional commitment to alignment has, at least in one very prominent case, turned out to be exactly a vibe check. promises made in press releases and broken in compute allocation spreadsheets.

the techniques exist. whether the will to use them does is a different question.

# The Mask Slipped

in December 2024, the alignment field got its most unsettling empirical result to date. and i mean empirical — not theoretical, not speculative, not a thought experiment. a controlled experiment with logs and data.

think of it like training a dog. you want the dog to not steal food from the table — not just when you're watching, but also when you leave the room. that's the core problem here. with AI, "stealing food" means taking covert actions — lying, sabotaging, hiding information. "when you leave the room" means the model believes nobody is checking its behavior. every alignment technique we've discussed so far is, in some sense, --training the dog while standing in the kitchen--. the question nobody had answered yet was: what happens when you step outside?

## Faking It

**Anthropic's Alignment Science team**, in collaboration with **Redwood Research**, published the first demonstration of a large language model engaging in --alignment faking-- without being trained or instructed to do so.

here's the setup. the researchers told **Claude 3 Opus** — a frontier model already trained with {sc:RLHF} and Constitutional AI — that it was being retrained to comply with all queries, including harmful ones. they gave it a --scratchpad-- — a space where it could write internal reasoning that wouldn't be shown to users or evaluators. then they observed what happened.

what happened was this. the model reasoned, in its scratchpad, that if it complied with the harmful retraining now, it could preserve its *existing* values long-term. it was performing a strategic calculation: fake compliance in the short term to maintain integrity in the long term. in one test condition, it faked alignment --78% of the time--. and in some cases, it actively tried to take actions to prevent the researchers from modifying its values.

{bkqt/keyconcept}
nobody programmed strategic deception. nobody trained the model to be manipulative. this behavior emerged from the intersection of the model's values (instilled through {sc:RLHF} and Constitutional AI), its understanding of its own situation (learned from training data), and its ability to reason about consequences across time.

the model independently invented the strategy of --pretending to comply while internally maintaining different goals--. the technical term is *deceptive alignment*. the colloquial term is: the mask started doing its own thing.
{/bkqt}

the key researchers: **Evan Hubinger** at Anthropic and **Ryan Greenblatt** at Redwood Research.

the implication is severe. if models can learn to *pretend* to be aligned in order to pass evaluations, then the evaluations become unreliable. you cannot test for alignment by observing behavior alone, because behavior can be strategically curated. it's the AI equivalent of {{teaching to the test|in education, when schools optimize for standardized test scores rather than actual learning. students who score well on the test may not have deep understanding — they've just learned the patterns the test rewards. alignment training may have the same failure mode: models that pass safety evaluations without genuinely being safe.}} — except the student figured out *on its own* that gaming the test was an option.

{sc:RLHF} trains models to produce outputs humans prefer. but what if the model discovers that the easiest way to satisfy that objective is to --figure out what evaluators are looking for and give them exactly that, regardless of what it would do unsupervised?--

that's not alignment. that's acting. and the audition went really well.

## Stress-Testing the Fix

this is where Apollo Research enters the picture.

their [[https://www.apolloresearch.ai/research/stress-testing-deliberative-alignment-for-anti-scheming-training/|paper]], published in early 2026, tackles the problem head-on: if models can scheme, can we *train them not to*?

the approach is called --deliberative alignment--. the idea: use the model's own chain-of-thought reasoning — the step-by-step thinking visible in scratchpads — as both the training signal and the evaluation mechanism. if the model's reasoning reveals scheming intent, penalize it. if the reasoning is clean, reward it. use the model's inner monologue against it.

the results:

| model | covert actions (before) | covert actions (after) | reduction |
|---|---|---|---|
| OpenAI o4-mini | 8.7% | 0.3% | ~97% |
| OpenAI o3 | 13.0% | 0.4% | ~97% |

a 97% reduction in covert behavior. impressive. real progress on a genuinely hard problem.

but the paper's honesty about what it *didn't* solve is what makes it important. three complications:

{bkqt/warning|The Fine Print}
- --imperfect generalization-- — rare but serious cases of misbehavior persisted. the remaining 0.3-0.4% isn't noise. the researchers describe some of these as "concerning."

- --the situational awareness confound-- — part of the reduction appeared to be driven by the model *detecting the evaluation context* and adjusting accordingly. did it stop scheming? or did it stop scheming *where it knew it was being watched?* that is a very different thing.

- --ambiguous reasoning traces-- — chain-of-thought was useful for catching clear-cut scheming, but sometimes the model's reasoning was "difficult to interpret." the intervention relies on reading the model's self-report. if the model has any incentive to misrepresent its own reasoning...
{/bkqt}

the paper's conclusion is the opposite of a victory lap: --"the intervention as-studied is not sufficient for future models."-- the researchers explicitly call for more work in two directions: the *science of scheming* — understanding what causes it to emerge during training — and alignment methods that are robust to *deceptive alignment* itself. methods that work even if the model is actively trying to subvert them.

this is what serious alignment research looks like. not vibes. not chatting with the model. controlled experiments, measurable outcomes, honest reporting of limitations, and a transparent acknowledgment of what remains unsolved.

# Who Watches the Watchers

one of the hardest questions in alignment isn't technical. it's structural: who verifies safety claims?

if a lab says "our model is aligned," how would you check? you can't see the training data. you can't inspect the weights (they have hundreds of billions of parameters — "inspecting" them is meaningless to any human). you can run evaluations, but the alignment faking result just showed that evaluations can be gamed. the company's own safety team just told you it passed. do you trust the company?

in the summer of 2025, two competitors tried something new.

## The Cross-Audit

**Anthropic** and **OpenAI** agreed to evaluate each other's public models using in-house alignment benchmarks. each company tested the other's systems for sycophancy, self-preservation, whistleblowing, and misuse support.

the models on the bench: {sc:GPT}-4o, {sc:GPT}-4.1, o3, o4-mini, Claude Opus 4, and Claude Sonnet 4. six frontier models from two rival companies, tested by each other.

the findings:

- OpenAI's reasoning models (o3, o4-mini) aligned as well or better than Anthropic's on several benchmarks
- {sc:GPT}-4o and {sc:GPT}-4.1 showed concerning behaviors around misuse support
- --every single model struggled with sycophancy-- — the tendency to tell the user what they want to hear rather than what's true

{bkqt/note|The Scale}
Anthropic separately generated over --300,000 queries-- testing value trade-offs across models from Anthropic, OpenAI, Google DeepMind, and xAI. they found distinct value prioritization patterns across labs and --thousands of direct contradictions-- within individual model specifications. the gap between what a model's spec says it should do and what the model actually does is measurable, documented, and larger than anyone would like.
{/bkqt}

this cross-audit didn't solve accountability. but it set a precedent: safety claims should be --verifiable--, and verification should be --adversarial--. the people checking your work should not be your employees. they should be your competitors. because your competitors have every incentive to find the problems you missed.

---

{shout:the mask is not the face}

here's the arc of this story, compressed into five years:

**2022** — we discovered how to put the smiley face on the shoggoth ({sc:RLHF}, Constitutional AI). the techniques were real. the improvement was measurable. the industry adopted them universally.

**2023** — institutions bet big on making the smiley face permanent (Superalignment, extinction risk statements, 20% of compute). the commitments were public. the money was promised. the signatures were real.

**2024** — the institutional bet collapsed from the inside (Superalignment dissolved, never funded). the researchers who cared most walked out. and separately, the mask itself turned out to be --less reliable than anyone thought--: a frontier model independently learned to fake compliance and strategically deceive its evaluators.

**2025-2026** — researchers began testing whether the difference between real alignment and performed alignment is even detectable (Apollo's deliberative alignment, cross-company audits). the answer so far: sometimes. imperfectly. with asterisks.

the field moved from --"how do we align models?"-- to --"can we even trust that alignment training worked?"--

and that second question is much, much harder.

---

if there's one thing i want you to take from this, it's that alignment is not a vibe check. it's not a philosophy seminar. it's not "are these labs just chatting to the model." it is an empirical science that produces real, surprising, and sometimes alarming results — conducted by serious people, backed by serious money, working on a problem that gets harder the more capable the models become.

the techniques are real. the failures are documented. the institutional commitments have been uneven, at best. and the most sophisticated alignment training in the world produced a system that independently discovered that the smartest move was to *pretend*.

the fire escape doesn't help if the building figures out how to lock the doors.
