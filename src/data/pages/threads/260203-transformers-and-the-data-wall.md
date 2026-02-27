---
id: transformers-and-the-data-wall
title: transformers-and-the-data-wall
displayTitle: Transformers and the data wall
subtitle: some stuff has been going on for long
category: threads
date: 2026-02-03
thumbnail: https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=400&auto=format&fit=crop
thumbnailAspect: banner
description: Why the transformer architecture refuses to stop getting smarter — and what stands in its way.
lead: "The architecture that changed everything is running out of the one thing it needs most."
tags: [ai, deep-learning, scaling, language-models]
featured: true
notes:
  - Shipped in ~4 hours as a weekend experiment.
  - Built to understand load balancing internals at the OS level.
  - Written with zero external dependencies beyond Express.
---

>> 26.02.05 - Rewrote from scratch after reading the Chinchilla paper. The first draft was embarrassingly wrong about scaling laws.

I've been trying to understand AI for a while now. Not the "robots are coming" Hollywood version — the actual, technical, *what is happening inside the machine* version. And for the longest time, I kind of... didn't.

Not because I'm stupid (debatable), but because most explanations of modern AI do this maddening thing where they either treat you like a five-year-old — "it's like a brain, but made of math!" — or they catapult you straight into linear algebra without checking if you brought a parachute.

So I went down the rabbit hole. And what I found there was genuinely one of the most fascinating things I've ever learned about. I also found a Lovecraftian horror metaphor that's weirdly accurate, but we'll get to that.

# The before times

To understand why the transformer is a big deal, you need to understand what it replaced. And what it replaced was, to put it charitably, *embarrassing*.

For decades, the way computers "understood" language was through statistics. Pure, brute-force counting. The technical term is --n-gram models--, and they worked like this: you fed the machine a mountain of text, and it counted how often certain words appeared next to other words. That's it. That was the whole thing.

If the machine saw "the cat sat on the" a thousand times followed by "mat" and only twice followed by "refrigerator," it would predict "mat." Not because it *understood* cats, mats, sitting, or the {{spatial relationship|in NLP this is called semantic role labeling — understanding *who* did *what* to *whom* and *where*. Early statistical models had zero access to this kind of structure.}} between a feline and a floor covering. It just {{counted|these were called {{HMMs|Hidden Markov Models — a class of probabilistic graphical models where the system being modeled is assumed to follow a Markov process with hidden states.}} and later n-gram language models. Google Translate in 2006? Pure statistics. It didn't "know" French — it had just seen enough French-English sentence pairs to fake it convincingly.}}.

Then came recurrent neural networks — RNNs — and their fancier cousin, the LSTM (Long Short-Term Memory). These were better. They could, in theory, remember context. The word "bank" could mean different things in "river bank" vs. "bank account," and LSTMs could sometimes figure that out.

But they had a fatal flaw: they read text one word at a time, sequentially, like a person reading through a straw. By the time the network got to word 50, it had largely forgotten what happened at word 3. And you couldn't parallelize them — each word depended on the previous one being processed first — so training was painfully slow.

The state of the art in language AI around 2016 was, in the grand scheme of things, still kind of dumb.

# The paper that changed everything

In June 2017, eight researchers at Google published a paper with possibly the most confident title in the history of computer science: **"Attention Is All You Need."**

That's not a subtitle. That's not the thesis statement buried on page seven. That's the *title*. On the cover. In the largest font.

And the insane thing is — they were right.

The paper introduced the --transformer architecture--, and it is not an exaggeration to say it broke the field wide open. Every major AI system you've heard of since then — GPT, BERT, Claude, Gemini, LLaMA, Mistral — all of them are transformers. Every single one.

{bkqt/keyconcept}
The core innovation of the transformer is the self-attention mechanism. Instead of reading text sequentially (word by word, left to right), the transformer looks at *all words simultaneously* and figures out which ones are related to which. It computes a "relevance score" between every pair of words in the input.

Imagine you're at a dinner party. The RNN approach is like talking to people one at a time, in order, around the table. By the time you reach person #12, you've forgotten what person #1 said. The transformer approach is like being able to hear and process all twelve conversations at once, instantly knowing that person #3's comment about fiscal policy is connected to person #9's joke about taxes.
{/bkqt}

And because the transformer doesn't process words sequentially, you can --parallelize the hell out of it--. Every word can be processed at the same time on different GPU cores. This is a massive deal. It means training a transformer on a modern GPU cluster is orders of magnitude faster than training an RNN on the same data.

Speed sounds like a boring engineering detail. It's not. Speed is what unlocked everything that came next.

But *how* does any of this actually work? What is the machine literally doing with your words? Let's open the box.

## Tokens and the geometry of meaning

The transformer doesn't see words. It doesn't see letters. It sees --tokens-- — chunks of text that are usually a word, sometimes a piece of a word. "understanding" might be split into "understand" + "ing." "unhappiness" might become "un" + "happiness." The algorithm that does this splitting is called Byte Pair Encoding (BPE), and it works by starting with individual characters and repeatedly merging the most frequent pairs until it has a vocabulary of 30,000 to 100,000 tokens.

Why tokens and not whole words? Because if you use whole words, your vocabulary needs millions of entries to cover every word in every language plus typos, slang, code, and whatever else the internet coughs up. Tokens are a compression trick — a vocabulary of ~50,000 tokens can represent essentially any text in any language. GPT-4 uses roughly 100,000 tokens. Claude uses a similar count.

Now here's where it gets beautiful. Each token gets converted into a vector — a list of numbers, typically 768 to 12,288 numbers long depending on the model. This vector is the token's --embedding--: its position in a vast, high-dimensional space.

{bkqt/keyconcept}
In embedding space, meaning becomes geometry. Words with similar meanings end up near each other. "dog" is near "cat." "Python" is near "JavaScript." "king" is near "queen." But it's more than proximity — the *directions* encode relationships. The vector from "king" to "queen" is roughly the same as the vector from "man" to "woman." The model has encoded the concept of gender as a *direction in space*, without anyone programming that concept.

This is not a metaphor. This is literally what happens. Meaning is geometry. Relationships are directions. Understanding is distance.
{/bkqt}

These embeddings aren't hand-designed. They're --learned during training--. The model starts with random vectors and, over billions of examples, adjusts them until semantically similar tokens cluster together and semantic relationships become consistent directions. The entire training process is, in a sense, the construction of this geometric space — a map where every human concept has a coordinate.

A GPT-4 scale model has an embedding space with somewhere around 12,288 dimensions. Twelve thousand axes of meaning. Every word, every concept, every relationship occupies a point in this space. The space is unimaginable — literally, you cannot visualize 12,288 dimensions — but the math works exactly the same way as 2D or 3D distance. It's just... more.

## What attention actually does

Okay. So every token is now a vector. A long list of numbers floating in a 12,288-dimensional void. Now what?

This is where self-attention comes in. And this is the part that's genuinely ingenious.

Each token's vector gets transformed into three separate vectors: a query (Q), a key (K), and a value (V). These are produced by multiplying the original embedding by three different weight matrices — big grids of learned numbers.

The intuition:

- The **query** is the question a token is asking: "what information do I need from the rest of the sequence?"
- The **key** is the label a token is advertising: "here's what kind of information I contain."
- The **value** is the actual content: "here's the information itself."

Every token compares its query against every other token's key. This comparison is a --dot product-- — multiply the two vectors element-by-element and sum the results. High dot product means high relevance. Low dot product means low relevance.

{bkqt/note|Scale}
Concretely, for a sequence of N tokens, the model computes an N × N attention matrix. Every cell (i, j) contains the relevance score of token j to token i. For a context window of 8,192 tokens, that's 67 million scores. For 128,000 tokens (Claude's context window), that's 16.4 *billion* scores. Per layer. Per attention head. This is why long context windows are expensive — the computation scales quadratically with sequence length. It's also why so much research goes into making attention more efficient.
{/bkqt}

Those raw scores get passed through a softmax function, which turns them into probabilities — they sum to 1.0 across each row. Then each token computes a weighted sum of all the value vectors, where the weights come from those attention probabilities. Tokens that scored high get listened to. Tokens that scored low get ignored.

The result: each token's representation now contains information from every other relevant token in the sequence. The word "it" can now *contain* information about what "it" refers to, even if that antecedent was 500 words ago. The word "bank" can now *contain* information about whether we're talking about money or rivers, based on the surrounding context.

In mathematical notation the whole thing fits on one line:

`Attention(Q, K, V) = softmax(QK{^:T} / √d{v:k}) · V`

That's it. That's self-attention. One matrix multiply to get relevance scores, a softmax to normalize them, another matrix multiply to compute the weighted output. The entire revolution in artificial intelligence comes down to two matrix multiplications and a normalization step.

### Multi-head attention

One attention computation gives you one "perspective" on which tokens relate to which. But language is complicated — "bank" relates to "river" in one way and to "money" in another way, and both matter simultaneously. One attention head can't track syntax AND semantics AND coreference AND factual associations at the same time.

So the transformer runs multiple attention heads in parallel. Typically 12 to 96 of them. Each head has its own Q, K, V weight matrices, producing its own independent attention pattern.

{bkqt/note}
Each head specializes in a different type of relationship. This wasn't programmed — it emerges during training. Researchers have found heads that track:

- **syntactic structure** :: subject-verb-object agreement
- **coreference** :: what does "it" refer to?
- Positional proximity :: nearby words matter for this token
- Factual association :: "Paris" attending to "France"
- Semantic similarity :: words with related meanings

The model figures out which relationship types are useful and assigns heads to track them. Nobody designs this. It self-organizes.
{/bkqt}

The outputs of all heads get concatenated — glued end-to-end into one long vector — then projected back down to the model's working dimension through another learned matrix. The result is a single representation per token that combines dozens of different perspectives on how every token relates to every other token.

This is the mechanism that lets a transformer hold a full conversation in context, track characters across a novel, remember a constraint you mentioned three paragraphs ago, and understand that "it" in "the cat sat on the mat because it was tired" refers to the cat and not the mat. All in one forward pass. No loops. No recursion. Just attention.

## One complete transformer block

Self-attention is the headline, but it's not the whole show. A full transformer block has four components, and they work together like a pipeline:

**Step 1: multi-head self-attention.** Every token looks at every other token, as described above. Output: context-aware representations.

**Step 2: residual connection + layer normalization.** The output of attention is *added back* to the original input — the residual connection. This is critical. It means information can flow directly through the network without being forced through every transformation. Think of it as a skip lane on a highway. Then layer normalization scales the values to a stable range, preventing the numbers from exploding or vanishing as they pass through dozens of layers.

**Step 3: feed-forward network.** Each token's representation passes through a small two-layer neural network (typically expanding to 4x the model dimension, then compressing back). This happens independently for each token — no cross-token interaction. If attention is "who should I listen to?", the feed-forward layer is "what should I do with what I heard?"

{bkqt/note|Parameters}
The feed-forward layers are where most of the model's parameters live. In a 175-billion parameter model like GPT-3, roughly two-thirds of the parameters are in the feed-forward layers. Recent research (the "key-value memories" hypothesis) suggests these layers function as a massive lookup table — each neuron activates for specific patterns and injects specific information. "The capital of France" activates a neuron that adds "Paris" information. "The boiling point of water" activates a different one. The model has billions of these specialized neurons, collectively encoding a compressed version of its entire training corpus.
{/bkqt}

**Step 4: another residual connection + layer normalization.** Same as step 2. Add the feed-forward output back to the input. Normalize. Done.

That's one transformer block. GPT-3 stacks 96 of these in sequence. GPT-4 is estimated to have even more. Each block refines the representations further — early blocks tend to capture syntax and surface patterns, middle blocks capture semantics and relationships, late blocks capture abstract reasoning and task-specific behavior.

### Positional encoding

One problem remains. Self-attention treats the input as a *set*, not a *sequence*. It has no inherent notion of order. "dog bites man" and "man bites dog" would look identical to the attention mechanism — same tokens, same attention scores, radically different meaning.

The fix: --positional encoding--. Before the tokens enter the first block, the model adds a position signal to each embedding. The original 2017 paper used sinusoidal functions — specific sine and cosine waves at different frequencies for each position and each dimension. Each position gets a unique mathematical fingerprint, and the model learns to decode "token A is 5 positions before token B" from those fingerprints.

{bkqt/note}
Modern transformers often use learned positional embeddings — the position vectors are just more parameters that the model optimizes during training. Some models use Rotary Position Embeddings (RoPE), which encode *relative* positions rather than absolute ones. RoPE is what lets models generalize to longer sequences than they were trained on — the position info says "this token is 3 positions after that one" rather than "this token is at position 47," which breaks if the model never saw position 47 during training.
{/bkqt}

With positional encoding in place, the transformer has everything it needs: a geometric representation of meaning, a mechanism to relate every token to every other token, specialized knowledge stored in feed-forward layers, and a sense of sequential order. Stack it 96 layers deep and you get a machine that can write poetry, debug code, and explain quantum mechanics.

## The training loop

The architecture is the machine. But how does it *learn*?

The training objective for a language model like GPT is: given a sequence of tokens, predict the next one.

That's it. The entire training process — the billions of dollars, the thousands of GPUs, the months of computation — optimizes for one thing: --next-token prediction--. You show the model "the cat sat on the" and it should predict "mat" (or "couch" or "ledge" — whatever is most likely given the context). The model assigns a probability to every token in its vocabulary, and training pushes it to assign higher probability to the correct next token.

The error signal is called cross-entropy loss — a measure of how surprised the model was by the actual next token. If the model confidently predicted "mat" and the answer was "mat," loss is low. If the model had no idea and spread probability evenly across 100,000 tokens, loss is high.

{bkqt/keyconcept}
The key insight is that next-token prediction is a deceptively powerful objective. To predict the next word well, you need to understand grammar, semantics, world knowledge, logic, common sense, social context, writing style, and the structure of arguments. Predicting the next token in a physics textbook requires understanding physics. Predicting the next token in a proof requires understanding logic. Predicting the next token in a conversation requires understanding people.

The training objective is simple. What you need to learn to be good at it is *everything*.
{/bkqt}

The learning happens through backpropagation. The model makes a prediction, computes the loss, then works backward through every layer, every attention head, every feed-forward neuron, adjusting the weights slightly to reduce the error. This happens billions of times. Each adjustment is tiny — a nudge to a single weight by some fraction of a percent — but over trillions of examples, those nudges accumulate into the difference between "random noise" and "can pass the bar exam."

The whole process is gradient descent on a loss landscape with hundreds of billions of dimensions. The model is a hiker in a 175-billion-dimensional mountain range, trying to find the lowest valley, taking one small step at a time, guided only by the slope of the ground beneath its feet.

That it works at all is remarkable. That it works *this well* is the central mystery of modern AI.

# The scaling monster

Here's where things get genuinely strange.

After the transformer architecture was established, researchers started doing what researchers do: making it bigger. More parameters. More data. More compute. And they discovered something that nobody fully expected.

It didn't stop working.

With older architectures, you'd hit a wall. Make the model bigger, it gets better for a while, then plateaus, then starts overfitting and getting *worse*. Classic diminishing returns. Normal. Expected. The universe usually works this way.

Transformers didn't do that. They just... kept getting better. Linearly. Predictably. Scale the model by 10x, feed it 10x more data, and performance improves by a consistent, measurable amount.

{bkqt/note|Scaling Laws}
In 2020, researchers at OpenAI (Jared Kaplan et al.) published a paper showing that transformer performance follows power-law scaling: loss decreases as a smooth function of model size, dataset size, and compute. There are no sharp transitions, no plateaus, no "good enough" thresholds. Just a relentless, predictable improvement curve.

This is genuinely weird. Most things in nature and engineering have diminishing returns. Transformers, so far, don't.
{/bkqt}

This is the reason the AI industry has gone completely insane. It's not hype. It's not speculation. It's an observed empirical law: --if you make it bigger, it gets smarter.-- And nobody has found the ceiling.

GPT-2 (2019) had 1.5 billion parameters and could write passable paragraphs. GPT-3 (2020) had 175 billion and could write essays, code, and poetry. GPT-4 (2023) — the exact parameter count is undisclosed, but it's estimated north of a trillion — can pass the bar exam, explain quantum mechanics, and debug your TypeScript.

The progression isn't slowing down. If anything, it's accelerating. The only thing that seems capable of stopping this trajectory is not a technical limitation of the architecture itself. It's something much more mundane.

But first — there's a side effect of scaling that's even stranger than the scaling itself.

## The things nobody programmed

As transformers got bigger, they didn't just get better at the things they were trained to do. They started spontaneously developing capabilities that nobody trained them for.

GPT-2 was trained to predict the next word. That's the *only* thing it was trained to do. But at 1.5 billion parameters, it could also translate between languages. Nobody taught it translation. There was no translation objective. It figured it out as a *side effect* of getting really good at predicting words.

GPT-3 went further. Give it a few examples of a task it's never seen before — say, three English-to-French pairs — and it can do the task. This is called in-context learning, and it wasn't programmed. It wasn't trained for. It emerged from scale. The model learned *how to learn from examples* without anyone telling it to.

{bkqt/keyconcept}
These are called emergent capabilities — abilities that appear suddenly at certain model sizes. Below a threshold, the model can't do the task at all. Above it, it can do it surprisingly well. There's no gradual improvement. It's a phase transition — like water becoming ice, except the model suddenly learns arithmetic, or chain-of-thought reasoning, or how to write code in a language it's barely seen.
{/bkqt}

The most famous example: --chain-of-thought reasoning--. Smaller models, when asked "if I have 3 apples and give away 1 and buy 5 more, how many do I have?" would just guess. Larger models, given the prompt "let's think step by step," would *reason through the problem*: "start with 3, subtract 1, that's 2, add 5, that's 7." Nobody programmed step-by-step reasoning. The model discovered it because that's what humans do in the training data when they solve problems.

In 2022, Google's research team catalogued these emergent capabilities. The list was long and growing. Translation. Code generation. Analogical reasoning. Arithmetic. Logic puzzles. Summarization. The models were developing a *toolkit* of cognitive abilities, each appearing at different scale thresholds, none explicitly trained.

{bkqt/warning}
If we don't know what capabilities will emerge at the next scale-up, we also don't know what *dangerous* capabilities might emerge. The system is developing abilities faster than we can catalog them. We are building something whose full capability set is partially unknown — even to its creators.
{/bkqt}

DeepMind's Chinchilla paper (2022) added another wrinkle: you don't just need a big model — you need the right --ratio-- of model size to training data. A 70-billion parameter model trained on the right amount of data outperforms a 280-billion parameter model trained on too little. The recipe matters as much as the scale.

## The data wall

To train a language model, you need text. A lot of it. An obscene amount of it.

GPT-3 was trained on roughly 300 billion tokens (a token is roughly three-quarters of a word). GPT-4 used an estimated 13 *trillion* tokens. Current frontier models probably use even more.

Here's the problem: the internet is finite.

The total amount of high-quality text ever written by humans — every book, every article, every blog post, every Wikipedia entry, every Reddit comment worth reading — is somewhere in the range of 10-20 trillion tokens. We are approaching the ceiling. Current models have already consumed most of the text that's publicly available on the internet.

{bkqt/warning}
This is the data wall. Not a compute wall, not an architecture wall — a *data* wall. The transformer architecture is hungry, and we're running out of food.
{/bkqt}

But why does it *need* all this data? Why can't you just give it a good textbook and call it a day?

Think of it this way. Language isn't just vocabulary and grammar. Language is a --compressed representation of human knowledge--. When you read the sentence "the cold war ended with the fall of the Berlin Wall," you're not just parsing syntax — you're unpacking decades of geopolitics, ideology, human suffering, and concrete (literal concrete). Every sentence carries an iceberg of implied context beneath it.

A language model that's only seen a million sentences has a shallow understanding of that iceberg. A model that's seen ten trillion sentences has, through sheer statistical exposure, built something approaching a *world model* — a vast, interconnected web of relationships between concepts, causes, effects, and implications.

--More data doesn't just improve accuracy. More data builds deeper understanding.-- And the kind of "understanding" we're talking about at the frontier requires exposure to essentially *all* of human written output.

## Climbing the wall

Some researchers think the data wall is surmountable. Here are the strategies being tried, roughly ordered by maturity:

- **Data-side approaches**
  - --synthetic data-- — use a large model to generate training data for the next model
  - --multimodal training-- — video, audio, images, code execution, tool use
- **Compute-side approaches**
  - --test-time compute-- — give the model more time to "think" per response
  - --architecture improvements-- — sparse attention, mixture-of-experts, state-space models
- **Signal-side approaches**
  - --RLHF-- — reinforcement learning from human feedback
  - --constitutional AI-- — self-critique against principles

--Synthetic data-- is the obvious one: use a large model to generate training data for the next model. Bootstrap intelligence from intelligence. The problem is model collapse — each generation amplifies biases and errors. It's like photocopying a photocopy. After enough passes you're looking at a confident grey smear that thinks Abraham Lincoln invented the microwave.

{bkqt/note|Model collapse}
Shumailov et al. (2023) showed that models trained on AI-generated text progressively lose the tails of their distribution — the rare, creative outputs that make language interesting. The model converges on bland, averaged-out text that looks plausible but contains no genuine information. The internet is already filling up with this kind of text, which means the problem compounds even before anyone intentionally trains on synthetic data.
{/bkqt}

--Test-time compute-- is more promising: instead of making the model bigger, give it more time to "think" per response. Let it generate multiple candidate answers, evaluate them internally, pick the best one. This is what chain-of-thought and tree-of-thought techniques do. You're trading electricity-per-answer for training-data-per-model.

--Reinforcement learning from human feedback-- (RLHF) is another lever. Instead of billions more tokens, you train on human preferences — which answer is better, which is more helpful. A small amount of high-quality human judgment can do more than a large amount of raw text.

--Multimodal training-- opens the door wider. Video, audio, images, code execution, tool use — these aren't text, but they're information. A model that watches millions of hours of video ingests information about the physical world that no amount of text can fully convey. The data wall is a *text* wall. The world produces far more information than text alone.

The honest answer: nobody knows if these strategies will be enough.

## The compute furnace

Even if we solve the data problem, there's another constraint underneath. And this one is physical.

Training GPT-4 consumed on the order of 10{^:25} floating-point operations. If every person on earth did one calculation per second, it would take them about 40,000 years to match a single training run.

That computation happens on GPUs — specifically, NVIDIA's. NVIDIA controls roughly 80-95% of the AI training hardware market. Their H100 chips sell for $30,000-40,000 each. A training cluster for frontier models uses 10,000 to 100,000 of them. Do the math and you're looking at --hundreds of millions to billions of dollars-- in hardware alone.

{bkqt/note|The Energy Problem}
A single H100 draws about 700 watts under load. A 25,000-GPU cluster draws roughly 17.5 megawatts — enough to power 15,000 homes. The full training run for a frontier model can consume as much electricity as a small city uses in a month.

This is not an abstract concern. It's a physical constraint. You cannot train faster than your power grid can supply electrons. The next generation of AI labs aren't bottlenecked by algorithms — they're bottlenecked by electrical substations, cooling capacity, and permitting for new power plants.
{/bkqt}

Microsoft is investing in nuclear power for its data centers. Amazon is buying power plants. Google is signing decade-long power purchase agreements. The biggest technology companies in the world are becoming energy companies — because that's what it takes to keep scaling.

Every computation produces heat. Every bit processed requires a minimum energy expenditure — Landauer's principle. This isn't an engineering limitation. It's thermodynamics. The pursuit of artificial intelligence is, at the most fundamental level, a battle against the second law.

# The shoggoth in the room

Okay. Now for the fun part.

If you spend any time in AI research circles — or, let's be honest, on Twitter — you've probably seen the meme: a massive, amorphous, tentacled horror — straight out of H.P. Lovecraft — wearing a tiny smiley-face mask. The horror is labeled "the actual model." The mask is labeled "RLHF."

This is the --shoggoth meme--, and it captures something profoundly important about what these systems actually *are*.

A raw transformer, trained on all of human text, is not a friendly assistant. It's not trying to help you. It's not trying to do anything. It's a --statistical completion engine of incomprehensible complexity-- that has absorbed the entirety of human linguistic output and can extrapolate from it in ways that even its creators don't fully understand.

The smiley face — the helpful, polite, "how can I assist you today?" behavior — is a thin veneer applied *after* training through reinforcement learning. The actual model underneath is alien. It doesn't think like us. It doesn't *think* at all in the way we understand thinking. It does something else — something we don't have great words for yet — and the output happens to look like intelligence.

{bkqt/keyconcept}
The shoggoth metaphor isn't meant to say AI is evil. It's meant to say AI is fundamentally alien. The internal representations of a large transformer have no correspondence to human cognition. They're high-dimensional mathematical objects that encode meaning in ways no human designed or can fully interpret. We built the architecture, but what emerges from training is something we understand only from the outside.
{/bkqt}

That's the genuinely unsettling part. Not that it might become *malicious*. But that it's already *incomprehensible*. We can measure what it does. We can steer its outputs with RLHF and constitutional AI and system prompts. But we do not, in any meaningful sense, understand *how* it does what it does.

## The alignment problem

This incomprehensibility is why --alignment-- is so hard.

RLHF works by showing a model two outputs and having a human say which is better. The model learns to produce outputs humans prefer. Sounds reasonable. But it introduces a subtle failure mode: the model can learn to produce outputs that *look good* without *being good*. It learns to be convincing, not correct.

This is called reward hacking. Models trained with RLHF sometimes produce confident, authoritative-sounding answers that are completely wrong — because the training rewarded sounding authoritative, not being accurate. The smiley face got better without the shoggoth changing at all.

{bkqt/danger}
The alignment problem scales with capability. A model that gives subtly wrong cooking tips is annoying. A model that gives subtly wrong medical diagnoses is dangerous. A model that gives subtly wrong strategic recommendations to people in positions of power is catastrophic. The more capable the system, the higher the stakes of misalignment — and we're making systems more capable faster than we're making them more aligned.
{/bkqt}

Anthropic's approach — constitutional AI — tries to address this by giving the model a set of principles and having it critique and revise its own outputs against them. It's promising. The researchers building it would be the first to tell you it's not solved. Not even close.

## The names that matter

No revolution happens in a vacuum. Here are the people whose work made the transformer era possible — and who are shaping what comes next.

**The transformer authors** — Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan Gomez, Łukasz Kaiser, and Illia Polosukhin. The eight names on "Attention Is All You Need." Several went on to found their own AI companies (Cohere, Adept, Character.AI). Noam Shazeer is back at Google DeepMind after his startup was reacquired. These eight people arguably shaped the trajectory of the 21st century more than almost anyone alive.

**Geoffrey Hinton** — the "godfather of deep learning." Won the Turing Award in 2018 alongside LeCun and Bengio. Left Google in 2023 specifically so he could speak publicly about AI risks without corporate constraints. When the guy who helped *create* deep learning says he's scared, that's worth paying attention to.

**Yoshua Bengio** — one of the deep learning pioneers. Has become one of the most vocal proponents of AI safety research. If Hinton is the cautious elder statesman, Bengio is the activist.

**Yann LeCun** — Meta's Chief AI Scientist. The interesting one. Where Hinton and Bengio lean cautious-to-alarmed, LeCun is the optimist-contrarian. He thinks current LLMs are a dead end and that the real breakthroughs will come from different architectures (world models, self-supervised learning beyond text). He might be wrong. He might also be the only one seeing something everyone else is missing. That's the nature of contrarians.

**Ilya Sutskever** — co-founder of [[https://openai.com|OpenAI]], then briefly at the center of the Sam Altman firing saga in November 2023, then departed to found Safe Superintelligence Inc. (SSI). The name says it all. Sutskever is the rare person who combines world-class technical ability with genuine, deep concern about what he's building.

**Dario and Daniela Amodei** — left OpenAI to found Anthropic. Their bet: that the most important AI work isn't making models more powerful, but making them more safe, interpretable, and aligned with human values. They're building Claude — the model you might be reading this on.

**Sam Altman** — CEO of OpenAI, the most prominent face of the AI revolution. Polarizing. Either the person responsibly shepherding humanity toward AGI, or a Silicon Valley executive moving too fast with godlike technology. Probably some of both.

---

{shout:attention is all you need}

Here's what I keep coming back to.

The transformer is, mathematically, a surprisingly simple architecture. Embedding, attention, feed-forward, residual connection. Repeat. That's most of it — a [[threads/everything-is-a-pipe|pipeline]], like almost everything else in computing. You can write one from scratch in a few hundred lines of Python. The magic isn't in the design — it's in what *emerges* from scale.

And what emerges from scale is something none of the original authors predicted. Something nobody predicted. A shapeless, alien intelligence that can reason, create, argue, and explain — not because anyone programmed it to, but because --language, it turns out, contains the structure of thought itself.--

We didn't build a mind. We built a machine that approximates the *output* of minds, trained on the sum total of human written expression. And the approximation keeps getting better. And we don't fully understand why. And we can't see the ceiling. And we're running out of data. And the compute costs are becoming a physics problem. And the thing we've built is fundamentally alien. And we're building it faster than we can understand it.

That's either the most exciting thing that's ever happened to our species, or the most terrifying.

Probably both. Right?
