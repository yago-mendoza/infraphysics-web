---
id: whats-ai
displayTitle: Why nobody actually understands AI (and how to fix that in one thread)
category: threads
date: "2026-03-06"
subtitle: "Nodes, weights, connections — words that feel technical but explain nothing. Most people still think these systems consult a giant database somewhere."
lead: "Understanding AI is one thing. Building the intuition — finetuning a model, debugging a loss curve, writing a training loop, labeling data at 2am, watching a GAN collapse, deploying an endpoint, reading a confusion matrix — is another. But you need the first one to not embarrass yourself with the second. I've talked to too many people convinced that these systems are rule-based programs written by code monkeys, consulting a giant real-time database with all of the internet stored in the dungeons, as if training on data meant keeping it locked in a vault for the model to browse whenever it pleased. You need the basics. Not to build AI. To stop saying nonsense about it."
tags: [ai, neural-networks, shannon, information-theory]
lang: en
---

---

**1/**

Most people don't understand AI.

Not because they're dumb. Not because it's too technical.

Because they're missing one specific intuition — a mental image so small and so obvious that once you have it, everything else clicks into place almost embarrassingly fast.

I'm going to give you that image. Buckle up.

---

**2/**

Here's what usually happens when I try to explain neural networks to someone:

Me: "Okay so it's a network of nodes connected by—"

Them: "Wait. What's a node?"

Me: "It's like... a unit that receives a signal and—"

Them: "A signal? Like WiFi?"

Me: "No, more like a number that—"

Them: "A number. Okay. And what are the connections?"

Me: "They're... weights that scale how much each number—"

Them: "Okay. Then why did you say *connection* in the first place."

*[long pause]*

Me: "...do you want to get lunch."

---

**3/**

And here's the thing — they're not wrong to ask.

"Node" and "connection" and "weight" are words that feel technical but explain nothing. They're labels slapped on top of math by people who forgot what it's like to not already know the math. And I say this with full awareness that most of them don't really understand what a node is either — they just stopped asking. Half the people confidently talking about AI on the internet never sat down to actually *get* the fundamentals. Not to calculate them. Not even to understand them. Just to hold a working mental image of what's happening. And that gap — that missing floor — is why so much public reasoning about AI is broken. People are building arguments on top of concepts they've never looked at directly.

So let me try something different.

---

**4/**

Forget the word "node" for a second.

A "node" is just... a number.

That's it. A single number, sitting somewhere in memory. Not glowing. Not thinking. Not doing anything particularly impressive. Just: `0.73`. Sitting there.

The reason it's called a "node" isn't to sound expensive — it's because "node" actually helps you picture it correctly. A node in a graph is a point, a location, something that *connects to other things*. That spatial image is useful. But the thing that lives at that location is just a number. A plain, boring, deeply unimpressive number.

And once you really have that, something starts to loosen.

---

**5/**

Because that number doesn't exist in isolation.

It was *computed* from other numbers. Which were computed from other numbers. Which were computed from other numbers. Which were computed from...

You see where this is going.

Numbers, all the way down. A cascading waterfall of arithmetic, from raw input to final output. Each layer taking the layer before it, doing some math, and handing the result forward.

*That's* a neural network. That's the whole thing.

Now — here's where it gets interesting.

---

**6/**

"Okay," you say, "but my calculator does that. Is my calculator AI?"

No. Fair point.

Your calculator's pipeline is *fixed*. Hardcoded. `2 + 2 = 4`, always, forever, end of story.

A neural network's pipeline is *adjustable*. The math has dials — millions of tiny dials — and training is the process of turning those dials, automatically, over and over, until the output stops being garbage and starts being useful.

Think of it like plumbing, but weird. You have a system of pipes, and depending on how wide each pipe is on the inside, water that enters from the left comes out of different exits on the right. Training is the process of adjusting those widths — not by hand, not by anyone deciding anything — but by running water through, checking which exit it came out of, comparing to where you wanted it to go, and automatically making tiny adjustments to the pipes until it reliably goes where you want.

Nobody decides the rules. Nobody programs what to look for. The network finds it.

That's the shift. That's what makes it different.

---

**7/**

Let me make this stupidly concrete.

You want to build a spam filter.

Old way: You write rules. "If email contains 'Nigerian prince' → spam." You spend 6 months writing rules. Spammers spend 6 minutes changing words. You lose forever.

Neural network way: You show it 1,000,000 emails labeled spam/not-spam. It adjusts its pipes until it gets reliable at the pattern. It discovers structure you never thought of — structure you couldn't articulate even if you tried. Combinations of signals too subtle and too many for a human to consciously track.

It learned. You didn't teach. There's a difference, and that difference is the whole ballgame.

---

**8/**

Now. Here's the thing about abstraction that most people miss — and it matters here.

Those pipes I mentioned — those dials, those "weights" — do they *actually exist*?

Yes and no. And the answer is more interesting than it sounds.

They're numbers stored in RAM. And RAM is electrons moving through silicon. And electrons are quantum fields vibrating in configurations that — well, look, if you follow *anything* far enough down, it stops looking like the thing you started with.

An apple doesn't "really" exist either, if you go small enough. At the quantum level it's mostly empty space and probability clouds doing things that have essentially nothing to do with "apple." But we don't say apples don't exist. We say apples exist *at the level of description where apples are useful.* Where the concept has traction. Where it does work for us.

Nodes exist the same way. Abstractions are real. They're just real at a particular altitude.

And here's Newton's point, which is actually the most important thing in this thread: we're in the 21st century. We have enough accumulated math, enough intellectual infrastructure, enough shared conceptual scaffolding that we can think clearly about the structure of intelligence without having to re-derive everything from quantum fields. You don't need to understand transistors to understand neural networks. You don't need to understand neurons to understand learning. You don't need to climb the mountain to use the view from the top.

Don't be the person who refuses to look because they feel guilty for not having built the ladder themselves. The view is the point. Use it.

---

**9/**

Which brings me to Claude Shannon.

1948. Bell Labs. A 32-year-old mathematician writes a 55-page paper that quietly rearranges the furniture of the universe.

The paper is called "A Mathematical Theory of Communication."

His central claim: **information can be measured.** Precisely. Mathematically. Like weight, like temperature, like distance.

The unit is the *bit*.

---

**10/**

Before Shannon, people thought information was fuzzy. Philosophical. Tied to meaning, to context, to the messy particularities of human language and interpretation.

Shannon said: no. Strip all of that away. Information, at its core, is the *reduction of uncertainty.* And you can count it.

"Will it rain tomorrow?" — 1 bit in the answer. Yes or no.

"What's the exact temperature at noon, to 10 decimal places?" — many more bits. Many more possible answers. Much more surprise potential.

The content doesn't matter. The *surprise* does. The more something could have gone differently, the more information the answer carries.

A message that tells you something you already knew carries zero information. "The sun rose today." Zero bits. You knew that.

"The sun didn't rise today." An enormous amount of bits. Because you absolutely did not see that coming.

Information is surprise. Shannon gave us the math to measure it.

---

**11/**

Why does this matter for AI?

Because it means that *any process that transforms information can be described mathematically.* Any of it.

Your brain processing a face. A frog's eye detecting a fly. A stock market integrating a million opinions into a single price. Your nose catching the smell of something baking from two floors away and your whole body knowing, before you consciously think anything, that something warm and sweet is happening downstairs.

All of these are the same thing at a structural level. Input comes in. Uncertainty goes down. Output comes out. Information was processed in between.

And here's the thing that still gets me, years after first really sitting with it: any such process — any function that maps input to output, no matter how complicated, no matter how biological or physical or abstract — can be approximated by a neural network. This was proven mathematically in 1989 by a guy named Cybenko. It's called the Universal Approximation Theorem and it basically says: if there's a pattern in the data, there's a neural network that can find it.

*Any* pattern. *Any* data.

---

**12/**

So here's the Big Claim. The one I actually want you to take away from this.

Neural networks are not a technology we invented.

They're a structure we *discovered* — one that was always latent in the mathematics of information, waiting.

We didn't build AI the way we built cars, from scratch, from engineering decisions, from human design. We built AI the way we built telescopes: we made a tool precise enough to see something that was already there.

And what was already there is a little bit mind-bending.

---

**13/**

The universe runs on input-output transformations.

DNA reads a sequence and folds a protein. That's a function. The retina compresses 130 million photoreceptors into 1 million fibers before the signal even reaches your brain — it's doing CNN-style processing before the visual cortex gets involved. Evolution itself is gradient descent: the "loss function" is mortality, the "parameters" are your genes, and it's been running for four billion years. Ant colonies solve optimization problems with no central coordinator. The immune system learns to classify self vs. non-self and generalizes to pathogens it's never seen — it's doing few-shot learning, in meat, right now, inside you.

Graphs and pipes. That's what it all is, if you squint right. Anything complex enough to do something interesting is a graph passing information around until something useful comes out the other side. I wrote a whole thread about this — *Everything Is a Pipe* — because the pattern is so universal it deserves its own treatment.

Neural networks look like neurons, by the way — that's not an accident, that's why they're called that. But they work quite differently. The brain can't freeze its weights the way a neural network does during training. It can't run backpropagation the way we do, pushing error signals backward through the whole system simultaneously. Biological neurons are doing something messier and in some ways more impressive — they're controlling thousands of outputs at once from a single continuous tissue, which is nothing like a deterministic computer going clock-clock-clock on a fixed instruction set. That's a whole other thread. *[link]*

The point is: the structure is everywhere. We just got precise enough to implement it on silicon.

---

**14/**

So the next time someone tells you AI is mysterious, or magical, or fundamentally beyond human comprehension —

It's not.

It's numbers doing math to other numbers, with adjustable pipes, on a scale we couldn't have imagined twenty years ago. It was always going to happen. The math was always there. Shannon laid it out in 1948. Cybenko made it rigorous in 1989. We just needed the compute.

What *is* worth sitting with — actually worth the mental effort — is the implication.

If any information-transforming process can be represented this way. And the universe is full of information-transforming processes. And we've now built machines that can find the patterns in any of them, given enough data...

Then what exactly is the thing we've built?

Not a tool. Not quite.

More like a mirror. Held up to the structure of everything.

---

*That's the thread. If your brain hurts a little, that's the intended effect.*

*Go deeper: Shannon (1948), Cybenko (1989), Kolmogorov complexity, Geoffrey West on scaling laws in natural systems.*

---

And look — if you've made it this far, let me leave you with something that I keep coming back to, the thing that sits underneath all of this and won't let go. Graph theory. Not as a branch of math you learn in college and forget. As a lens. Maybe the lens. Because every single phenomenon I've described in this thread — every neural network, every protein fold, every ant colony, every retina compressing light into signal — is a graph. Nodes and edges. Points and connections. Things passing information to other things through channels that have a width and a direction and a cost. Pipes. That's all a graph is, when you strip the formalism: a bunch of pipes. And the thing about pipes is that they don't care what flows through them. Water, electricity, bits, neurotransmitters, money, trust, attention — the math doesn't change. The structure doesn't change. What changes is what emerges on the other side. And emergence — that word people throw around when they want to sound deep without committing to a mechanism — emergence is what happens when enough pipes connect to enough other pipes and the information flowing through them starts to do something that none of the individual pipes could do alone. Consciousness might be that. Markets are that. Language definitely is that. And neural networks — artificial ones, the ones we build — are just the version of that phenomenon where we finally got to choose the graph topology, choose the pipe widths, and optimize the whole thing end to end with calculus. We didn't invent a new kind of thing. We took the oldest kind of thing — information flowing through structure — and made it programmable. That's it. That's the whole story. Pipes all the way down.