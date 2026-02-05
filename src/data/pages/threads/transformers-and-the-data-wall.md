---
id: transformers-and-the-data-wall
title: transformers-and-the-data-wall
displayTitle: transformers and the data wall
subtitle: some stuff has been going on for long
category: threads
date: 2026-02-05
thumbnail: https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=400&auto=format&fit=crop
thumbnailAspect: banner
description: why the transformer architecture refuses to stop getting smarter — and what stands in its way.
tags: [ai, deep-learning, scaling, language-models]
featured: true
notes:
  - Shipped in ~4 hours as a weekend experiment.
  - Built to understand load balancing internals at the OS level.
  - Written with zero external dependencies beyond Express.
---

>> 26.01.10 - first draft. rough but the structure is there.
>> 26.02.05 - rewrote from scratch after reading the Chinchilla paper. the first draft was embarrassingly wrong about scaling laws.

i've been trying to understand AI for a while now. not the "robots are coming" Hollywood version — the actual, technical, *what is happening inside the machine* version. and for the longest time, i kind of... didn't.

not because i'm stupid (debatable), but because most explanations of modern AI do this maddening thing where they either treat you like a five-year-old — "it's like a brain, but made of math!" — or they catapult you straight into linear algebra without checking if you brought a parachute.

so i went down the rabbit hole. and what i found there was genuinely one of the most fascinating things i've ever learned about. i also found a Lovecraftian horror metaphor that's weirdly accurate, but we'll get to that.

# the before times

to understand why the transformer is a big deal, you need to understand what it replaced. and what it replaced was, to put it charitably, *embarrassing*.

for decades, the way computers "understood" language was through statistics. pure, brute-force counting. the technical term is --n-gram models--, and they worked like this: you fed the machine a mountain of text, and it counted how often certain words appeared next to other words. that's it. that was the whole thing.

if the machine saw "the cat sat on the" a thousand times followed by "mat" and only twice followed by "refrigerator," it would predict "mat." not because it *understood* cats, mats, sitting, or the {{spatial relationship|in NLP this is called semantic role labeling — understanding *who* did *what* to *whom* and *where*. early statistical models had zero access to this kind of structure.}} between a feline and a floor covering. it just {{counted|these were called {{HMMs|Hidden Markov Models — a class of probabilistic graphical models where the system being modeled is assumed to follow a Markov process with hidden states.}} and later n-gram language models. Google Translate in 2006? pure statistics. it didn't "know" French — it had just seen enough French-English sentence pairs to fake it convincingly.}}.

then came recurrent neural networks — {sc:RNN}s — and their fancier cousin, the {sc:LSTM} (Long Short-Term Memory). these were better. they could, in theory, remember context. the word "bank" could mean different things in "river bank" vs. "bank account," and {sc:LSTM}s could sometimes figure that out.

but they had a fatal flaw: they read text one word at a time, sequentially, like a person reading through a straw. by the time the network got to word 50, it had largely forgotten what happened at word 3. and you couldn't parallelize them — each word depended on the previous one being processed first — so training was painfully slow.

the state of the art in language AI around 2016 was, in the grand scheme of things, still kind of dumb.

# the paper that changed everything

in June 2017, eight researchers at Google published a paper with possibly the most confident title in the history of computer science: **"Attention Is All You Need."**

that's not a subtitle. that's not the thesis statement buried on page seven. that's the *title*. on the cover. in the largest font.

and the insane thing is — they were right.

the paper introduced the --transformer architecture--, and it is not an exaggeration to say it broke the field wide open. every major AI system you've heard of since then — {sc:GPT}, {sc:BERT}, Claude, Gemini, LLaMA, Mistral — all of them are transformers. every single one.

{bkqt/keyconcept}
the core innovation of the transformer is the self-attention mechanism. instead of reading text sequentially (word by word, left to right), the transformer looks at *all words simultaneously* and figures out which ones are related to which. it computes a "relevance score" between every pair of words in the input.

imagine you're at a dinner party. the {sc:RNN} approach is like talking to people one at a time, in order, around the table. by the time you reach person #12, you've forgotten what person #1 said. the transformer approach is like being able to hear and process all twelve conversations at once, instantly knowing that person #3's comment about fiscal policy is connected to person #9's joke about taxes.
{/bkqt}

and because the transformer doesn't process words sequentially, you can --parallelize the hell out of it--. every word can be processed at the same time on different {sc:GPU} cores. this is a massive deal. it means training a transformer on a modern {sc:GPU} cluster is orders of magnitude faster than training an {sc:RNN} on the same data.

speed sounds like a boring engineering detail. it's not. speed is what unlocked everything that came next.

but *how* does any of this actually work? what is the machine literally doing with your words? let's open the box.

## tokens and the geometry of meaning

the transformer doesn't see words. it doesn't see letters. it sees --tokens-- — chunks of text that are usually a word, sometimes a piece of a word. "understanding" might be split into "understand" + "ing." "unhappiness" might become "un" + "happiness." the algorithm that does this splitting is called Byte Pair Encoding ({sc:BPE}), and it works by starting with individual characters and repeatedly merging the most frequent pairs until it has a vocabulary of 30,000 to 100,000 tokens.

why tokens and not whole words? because if you use whole words, your vocabulary needs millions of entries to cover every word in every language plus typos, slang, code, and whatever else the internet coughs up. tokens are a compression trick — a vocabulary of ~50,000 tokens can represent essentially any text in any language. {sc:GPT}-4 uses roughly 100,000 tokens. Claude uses a similar count.

now here's where it gets beautiful. each token gets converted into a vector — a list of numbers, typically 768 to 12,288 numbers long depending on the model. this vector is the token's --embedding--: its position in a vast, high-dimensional space.

{bkqt/keyconcept}
in embedding space, meaning becomes geometry. words with similar meanings end up near each other. "dog" is near "cat." "Python" is near "JavaScript." "king" is near "queen." but it's more than proximity — the *directions* encode relationships. the vector from "king" to "queen" is roughly the same as the vector from "man" to "woman." the model has encoded the concept of gender as a *direction in space*, without anyone programming that concept.

this is not a metaphor. this is literally what happens. meaning is geometry. relationships are directions. understanding is distance.
{/bkqt}

these embeddings aren't hand-designed. they're --learned during training--. the model starts with random vectors and, over billions of examples, adjusts them until semantically similar tokens cluster together and semantic relationships become consistent directions. the entire training process is, in a sense, the construction of this geometric space — a map where every human concept has a coordinate.

a {sc:GPT}-4 scale model has an embedding space with somewhere around 12,288 dimensions. twelve thousand axes of meaning. every word, every concept, every relationship occupies a point in this space. the space is unimaginable — literally, you cannot visualize 12,288 dimensions — but the math works exactly the same way as 2D or 3D distance. it's just... more.

## what attention actually does

okay. so every token is now a vector. a long list of numbers floating in a 12,288-dimensional void. now what?

this is where self-attention comes in. and this is the part that's genuinely ingenious.

each token's vector gets transformed into three separate vectors: a query (Q), a key (K), and a value (V). these are produced by multiplying the original embedding by three different weight matrices — big grids of learned numbers.

the intuition:

- the **query** is the question a token is asking: "what information do i need from the rest of the sequence?"
- the **key** is the label a token is advertising: "here's what kind of information i contain."
- the **value** is the actual content: "here's the information itself."

every token compares its query against every other token's key. this comparison is a --dot product-- — multiply the two vectors element-by-element and sum the results. high dot product means high relevance. low dot product means low relevance.

{bkqt/note|Scale}
concretely, for a sequence of N tokens, the model computes an N × N attention matrix. every cell (i, j) contains the relevance score of token j to token i. for a context window of 8,192 tokens, that's 67 million scores. for 128,000 tokens (Claude's context window), that's 16.4 *billion* scores. per layer. per attention head. this is why long context windows are expensive — the computation scales quadratically with sequence length. it's also why so much research goes into making attention more efficient.
{/bkqt}

those raw scores get passed through a softmax function, which turns them into probabilities — they sum to 1.0 across each row. then each token computes a weighted sum of all the value vectors, where the weights come from those attention probabilities. tokens that scored high get listened to. tokens that scored low get ignored.

the result: each token's representation now contains information from every other relevant token in the sequence. the word "it" can now *contain* information about what "it" refers to, even if that antecedent was 500 words ago. the word "bank" can now *contain* information about whether we're talking about money or rivers, based on the surrounding context.

in mathematical notation the whole thing fits on one line:

`Attention(Q, K, V) = softmax(QK{^:T} / √d{v:k}) · V`

that's it. that's self-attention. one matrix multiply to get relevance scores, a softmax to normalize them, another matrix multiply to compute the weighted output. the entire revolution in artificial intelligence comes down to two matrix multiplications and a normalization step.

### multi-head attention

one attention computation gives you one "perspective" on which tokens relate to which. but language is complicated — "bank" relates to "river" in one way and to "money" in another way, and both matter simultaneously. one attention head can't track syntax AND semantics AND coreference AND factual associations at the same time.

so the transformer runs multiple attention heads in parallel. typically 12 to 96 of them. each head has its own Q, K, V weight matrices, producing its own independent attention pattern.

{bkqt/note}
each head specializes in a different type of relationship. this wasn't programmed — it emerges during training. researchers have found heads that track:

- **syntactic structure** :: subject-verb-object agreement
- **coreference** :: what does "it" refer to?
- positional proximity :: nearby words matter for this token
- factual association :: "Paris" attending to "France"
- semantic similarity :: words with related meanings

the model figures out which relationship types are useful and assigns heads to track them. nobody designs this. it self-organizes.
{/bkqt}

the outputs of all heads get concatenated — glued end-to-end into one long vector — then projected back down to the model's working dimension through another learned matrix. the result is a single representation per token that combines dozens of different perspectives on how every token relates to every other token.

this is the mechanism that lets a transformer hold a full conversation in context, track characters across a novel, remember a constraint you mentioned three paragraphs ago, and understand that "it" in "the cat sat on the mat because it was tired" refers to the cat and not the mat. all in one forward pass. no loops. no recursion. just attention.

## one complete transformer block

self-attention is the headline, but it's not the whole show. a full transformer block has four components, and they work together like a pipeline:

**step 1: multi-head self-attention.** every token looks at every other token, as described above. output: context-aware representations.

**step 2: residual connection + layer normalization.** the output of attention is *added back* to the original input — the residual connection. this is critical. it means information can flow directly through the network without being forced through every transformation. think of it as a skip lane on a highway. then layer normalization scales the values to a stable range, preventing the numbers from exploding or vanishing as they pass through dozens of layers.

**step 3: feed-forward network.** each token's representation passes through a small two-layer neural network (typically expanding to 4x the model dimension, then compressing back). this happens independently for each token — no cross-token interaction. if attention is "who should i listen to?", the feed-forward layer is "what should i do with what i heard?"

{bkqt/note|Parameters}
the feed-forward layers are where most of the model's parameters live. in a 175-billion parameter model like {sc:GPT}-3, roughly two-thirds of the parameters are in the feed-forward layers. recent research (the "key-value memories" hypothesis) suggests these layers function as a massive lookup table — each neuron activates for specific patterns and injects specific information. "the capital of France" activates a neuron that adds "Paris" information. "the boiling point of water" activates a different one. the model has billions of these specialized neurons, collectively encoding a compressed version of its entire training corpus.
{/bkqt}

**step 4: another residual connection + layer normalization.** same as step 2. add the feed-forward output back to the input. normalize. done.

that's one transformer block. {sc:GPT}-3 stacks 96 of these in sequence. {sc:GPT}-4 is estimated to have even more. each block refines the representations further — early blocks tend to capture syntax and surface patterns, middle blocks capture semantics and relationships, late blocks capture abstract reasoning and task-specific behavior.

### positional encoding

one problem remains. self-attention treats the input as a *set*, not a *sequence*. it has no inherent notion of order. "dog bites man" and "man bites dog" would look identical to the attention mechanism — same tokens, same attention scores, radically different meaning.

the fix: --positional encoding--. before the tokens enter the first block, the model adds a position signal to each embedding. the original 2017 paper used sinusoidal functions — specific sine and cosine waves at different frequencies for each position and each dimension. each position gets a unique mathematical fingerprint, and the model learns to decode "token A is 5 positions before token B" from those fingerprints.

{bkqt/note}
modern transformers often use learned positional embeddings — the position vectors are just more parameters that the model optimizes during training. some models use Rotary Position Embeddings ({sc:RoPE}), which encode *relative* positions rather than absolute ones. {sc:RoPE} is what lets models generalize to longer sequences than they were trained on — the position info says "this token is 3 positions after that one" rather than "this token is at position 47," which breaks if the model never saw position 47 during training.
{/bkqt}

with positional encoding in place, the transformer has everything it needs: a geometric representation of meaning, a mechanism to relate every token to every other token, specialized knowledge stored in feed-forward layers, and a sense of sequential order. stack it 96 layers deep and you get a machine that can write poetry, debug code, and explain quantum mechanics.

## the training loop

the architecture is the machine. but how does it *learn*?

the training objective for a language model like {sc:GPT} is: given a sequence of tokens, predict the next one.

that's it. the entire training process — the billions of dollars, the thousands of {sc:GPU}s, the months of computation — optimizes for one thing: --next-token prediction--. you show the model "the cat sat on the" and it should predict "mat" (or "couch" or "ledge" — whatever is most likely given the context). the model assigns a probability to every token in its vocabulary, and training pushes it to assign higher probability to the correct next token.

the error signal is called cross-entropy loss — a measure of how surprised the model was by the actual next token. if the model confidently predicted "mat" and the answer was "mat," loss is low. if the model had no idea and spread probability evenly across 100,000 tokens, loss is high.

{bkqt/keyconcept}
the key insight is that next-token prediction is a deceptively powerful objective. to predict the next word well, you need to understand grammar, semantics, world knowledge, logic, common sense, social context, writing style, and the structure of arguments. predicting the next token in a physics textbook requires understanding physics. predicting the next token in a proof requires understanding logic. predicting the next token in a conversation requires understanding people.

the training objective is simple. what you need to learn to be good at it is *everything*.
{/bkqt}

the learning happens through backpropagation. the model makes a prediction, computes the loss, then works backward through every layer, every attention head, every feed-forward neuron, adjusting the weights slightly to reduce the error. this happens billions of times. each adjustment is tiny — a nudge to a single weight by some fraction of a percent — but over trillions of examples, those nudges accumulate into the difference between "random noise" and "can pass the bar exam."

the whole process is gradient descent on a loss landscape with hundreds of billions of dimensions. the model is a hiker in a 175-billion-dimensional mountain range, trying to find the lowest valley, taking one small step at a time, guided only by the slope of the ground beneath its feet.

that it works at all is remarkable. that it works *this well* is the central mystery of modern AI.

# the scaling monster

here's where things get genuinely strange.

after the transformer architecture was established, researchers started doing what researchers do: making it bigger. more parameters. more data. more compute. and they discovered something that nobody fully expected.

it didn't stop working.

with older architectures, you'd hit a wall. make the model bigger, it gets better for a while, then plateaus, then starts overfitting and getting *worse*. classic diminishing returns. normal. expected. the universe usually works this way.

transformers didn't do that. they just... kept getting better. linearly. predictably. scale the model by 10x, feed it 10x more data, and performance improves by a consistent, measurable amount.

{bkqt/note|Scaling Laws}
in 2020, researchers at OpenAI (Jared Kaplan et al.) published a paper showing that transformer performance follows power-law scaling: loss decreases as a smooth function of model size, dataset size, and compute. there are no sharp transitions, no plateaus, no "good enough" thresholds. just a relentless, predictable improvement curve.

this is genuinely weird. most things in nature and engineering have diminishing returns. transformers, so far, don't.
{/bkqt}

this is the reason the AI industry has gone completely insane. it's not hype. it's not speculation. it's an observed empirical law: --if you make it bigger, it gets smarter.-- and nobody has found the ceiling.

{sc:GPT}-2 (2019) had 1.5 billion parameters and could write passable paragraphs. {sc:GPT}-3 (2020) had 175 billion and could write essays, code, and poetry. {sc:GPT}-4 (2023) — the exact parameter count is undisclosed, but it's estimated north of a trillion — can pass the bar exam, explain quantum mechanics, and debug your TypeScript.

the progression isn't slowing down. if anything, it's accelerating. the only thing that seems capable of stopping this trajectory is not a technical limitation of the architecture itself. it's something much more mundane.

but first — there's a side effect of scaling that's even stranger than the scaling itself.

## the things nobody programmed

as transformers got bigger, they didn't just get better at the things they were trained to do. they started spontaneously developing capabilities that nobody trained them for.

{sc:GPT}-2 was trained to predict the next word. that's the *only* thing it was trained to do. but at 1.5 billion parameters, it could also translate between languages. nobody taught it translation. there was no translation objective. it figured it out as a *side effect* of getting really good at predicting words.

{sc:GPT}-3 went further. give it a few examples of a task it's never seen before — say, three English-to-French pairs — and it can do the task. this is called in-context learning, and it wasn't programmed. it wasn't trained for. it emerged from scale. the model learned *how to learn from examples* without anyone telling it to.

{bkqt/keyconcept}
these are called emergent capabilities — abilities that appear suddenly at certain model sizes. below a threshold, the model can't do the task at all. above it, it can do it surprisingly well. there's no gradual improvement. it's a phase transition — like water becoming ice, except the model suddenly learns arithmetic, or chain-of-thought reasoning, or how to write code in a language it's barely seen.
{/bkqt}

the most famous example: --chain-of-thought reasoning--. smaller models, when asked "if i have 3 apples and give away 1 and buy 5 more, how many do i have?" would just guess. larger models, given the prompt "let's think step by step," would *reason through the problem*: "start with 3, subtract 1, that's 2, add 5, that's 7." nobody programmed step-by-step reasoning. the model discovered it because that's what humans do in the training data when they solve problems.

in 2022, Google's research team catalogued these emergent capabilities. the list was long and growing. translation. code generation. analogical reasoning. arithmetic. logic puzzles. summarization. the models were developing a *toolkit* of cognitive abilities, each appearing at different scale thresholds, none explicitly trained.

{bkqt/warning}
if we don't know what capabilities will emerge at the next scale-up, we also don't know what *dangerous* capabilities might emerge. the system is developing abilities faster than we can catalog them. we are building something whose full capability set is partially unknown — even to its creators.
{/bkqt}

DeepMind's Chinchilla paper (2022) added another wrinkle: you don't just need a big model — you need the right --ratio-- of model size to training data. a 70-billion parameter model trained on the right amount of data outperforms a 280-billion parameter model trained on too little. the recipe matters as much as the scale.

## the data wall

to train a language model, you need text. a lot of it. an obscene amount of it.

{sc:GPT}-3 was trained on roughly 300 billion tokens (a token is roughly three-quarters of a word). {sc:GPT}-4 used an estimated 13 *trillion* tokens. current frontier models probably use even more.

here's the problem: the internet is finite.

the total amount of high-quality text ever written by humans — every book, every article, every blog post, every Wikipedia entry, every Reddit comment worth reading — is somewhere in the range of 10-20 trillion tokens. we are approaching the ceiling. current models have already consumed most of the text that's publicly available on the internet.

{bkqt/warning}
this is the data wall. not a compute wall, not an architecture wall — a *data* wall. the transformer architecture is hungry, and we're running out of food.
{/bkqt}

but why does it *need* all this data? why can't you just give it a good textbook and call it a day?

think of it this way. language isn't just vocabulary and grammar. language is a --compressed representation of human knowledge--. when you read the sentence "the cold war ended with the fall of the Berlin Wall," you're not just parsing syntax — you're unpacking decades of geopolitics, ideology, human suffering, and concrete (literal concrete). every sentence carries an iceberg of implied context beneath it.

a language model that's only seen a million sentences has a shallow understanding of that iceberg. a model that's seen ten trillion sentences has, through sheer statistical exposure, built something approaching a *world model* — a vast, interconnected web of relationships between concepts, causes, effects, and implications.

--more data doesn't just improve accuracy. more data builds deeper understanding.-- and the kind of "understanding" we're talking about at the frontier requires exposure to essentially *all* of human written output.

## climbing the wall

some researchers think the data wall is surmountable. here are the strategies being tried, roughly ordered by maturity:

- **data-side approaches**
  - --synthetic data-- — use a large model to generate training data for the next model
  - --multimodal training-- — video, audio, images, code execution, tool use
- **compute-side approaches**
  - --test-time compute-- — give the model more time to "think" per response
  - --architecture improvements-- — sparse attention, mixture-of-experts, state-space models
- **signal-side approaches**
  - --{sc:RLHF}-- — reinforcement learning from human feedback
  - --constitutional AI-- — self-critique against principles

--synthetic data-- is the obvious one: use a large model to generate training data for the next model. bootstrap intelligence from intelligence. the problem is model collapse — each generation amplifies biases and errors. it's like photocopying a photocopy. after enough passes you're looking at a confident grey smear that thinks Abraham Lincoln invented the microwave.

{bkqt/note|Model collapse}
Shumailov et al. (2023) showed that models trained on AI-generated text progressively lose the tails of their distribution — the rare, creative outputs that make language interesting. the model converges on bland, averaged-out text that looks plausible but contains no genuine information. the internet is already filling up with this kind of text, which means the problem compounds even before anyone intentionally trains on synthetic data.
{/bkqt}

--test-time compute-- is more promising: instead of making the model bigger, give it more time to "think" per response. let it generate multiple candidate answers, evaluate them internally, pick the best one. this is what chain-of-thought and tree-of-thought techniques do. you're trading electricity-per-answer for training-data-per-model.

--reinforcement learning from human feedback-- ({sc:RLHF}) is another lever. instead of billions more tokens, you train on human preferences — which answer is better, which is more helpful. a small amount of high-quality human judgment can do more than a large amount of raw text.

--multimodal training-- opens the door wider. video, audio, images, code execution, tool use — these aren't text, but they're information. a model that watches millions of hours of video ingests information about the physical world that no amount of text can fully convey. the data wall is a *text* wall. the world produces far more information than text alone.

the honest answer: nobody knows if these strategies will be enough.

## the compute furnace

even if we solve the data problem, there's another constraint underneath. and this one is physical.

training {sc:GPT}-4 consumed on the order of 10{^:25} floating-point operations. if every person on earth did one calculation per second, it would take them about 40,000 years to match a single training run.

that computation happens on {sc:GPU}s — specifically, NVIDIA's. NVIDIA controls roughly 80-95% of the AI training hardware market. their H100 chips sell for $30,000-40,000 each. a training cluster for frontier models uses 10,000 to 100,000 of them. do the math and you're looking at --hundreds of millions to billions of dollars-- in hardware alone.

{bkqt/note|The Energy Problem}
a single H100 draws about 700 watts under load. a 25,000-{sc:GPU} cluster draws roughly 17.5 megawatts — enough to power 15,000 homes. the full training run for a frontier model can consume as much electricity as a small city uses in a month.

this is not an abstract concern. it's a physical constraint. you cannot train faster than your power grid can supply electrons. the next generation of AI labs aren't bottlenecked by algorithms — they're bottlenecked by electrical substations, cooling capacity, and permitting for new power plants.
{/bkqt}

Microsoft is investing in nuclear power for its data centers. Amazon is buying power plants. Google is signing decade-long power purchase agreements. the biggest technology companies in the world are becoming energy companies — because that's what it takes to keep scaling.

every computation produces heat. every bit processed requires a minimum energy expenditure — Landauer's principle. this isn't an engineering limitation. it's thermodynamics. the pursuit of artificial intelligence is, at the most fundamental level, a battle against the second law.

# the shoggoth in the room

okay. now for the fun part.

if you spend any time in AI research circles — or, let's be honest, on Twitter — you've probably seen the meme: a massive, amorphous, tentacled horror — straight out of H.P. Lovecraft — wearing a tiny smiley-face mask. the horror is labeled "the actual model." the mask is labeled "{sc:RLHF}."

this is the --shoggoth meme--, and it captures something profoundly important about what these systems actually *are*.

a raw transformer, trained on all of human text, is not a friendly assistant. it's not trying to help you. it's not trying to do anything. it's a --statistical completion engine of incomprehensible complexity-- that has absorbed the entirety of human linguistic output and can extrapolate from it in ways that even its creators don't fully understand.

the smiley face — the helpful, polite, "how can I assist you today?" behavior — is a thin veneer applied *after* training through reinforcement learning. the actual model underneath is alien. it doesn't think like us. it doesn't *think* at all in the way we understand thinking. it does something else — something we don't have great words for yet — and the output happens to look like intelligence.

{bkqt/keyconcept}
the shoggoth metaphor isn't meant to say AI is evil. it's meant to say AI is fundamentally alien. the internal representations of a large transformer have no correspondence to human cognition. they're high-dimensional mathematical objects that encode meaning in ways no human designed or can fully interpret. we built the architecture, but what emerges from training is something we understand only from the outside.
{/bkqt}

that's the genuinely unsettling part. not that it might become *malicious*. but that it's already *incomprehensible*. we can measure what it does. we can steer its outputs with {sc:RLHF} and constitutional AI and system prompts. but we do not, in any meaningful sense, understand *how* it does what it does.

## the alignment problem

this incomprehensibility is why --alignment-- is so hard.

{sc:RLHF} works by showing a model two outputs and having a human say which is better. the model learns to produce outputs humans prefer. sounds reasonable. but it introduces a subtle failure mode: the model can learn to produce outputs that *look good* without *being good*. it learns to be convincing, not correct.

this is called reward hacking. models trained with {sc:RLHF} sometimes produce confident, authoritative-sounding answers that are completely wrong — because the training rewarded sounding authoritative, not being accurate. the smiley face got better without the shoggoth changing at all.

{bkqt/danger}
the alignment problem scales with capability. a model that gives subtly wrong cooking tips is annoying. a model that gives subtly wrong medical diagnoses is dangerous. a model that gives subtly wrong strategic recommendations to people in positions of power is catastrophic. the more capable the system, the higher the stakes of misalignment — and we're making systems more capable faster than we're making them more aligned.
{/bkqt}

Anthropic's approach — constitutional AI — tries to address this by giving the model a set of principles and having it critique and revise its own outputs against them. it's promising. the researchers building it would be the first to tell you it's not solved. not even close.

## the names that matter

no revolution happens in a vacuum. here are the people whose work made the transformer era possible — and who are shaping what comes next.

**the transformer authors** — Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan Gomez, Łukasz Kaiser, and Illia Polosukhin. the eight names on "Attention Is All You Need." several went on to found their own AI companies (Cohere, Adept, Character.AI). Noam Shazeer is back at Google DeepMind after his startup was reacquired. these eight people arguably shaped the trajectory of the 21st century more than almost anyone alive.

**Geoffrey Hinton** — the "godfather of deep learning." won the Turing Award in 2018 alongside LeCun and Bengio. left Google in 2023 specifically so he could speak publicly about AI risks without corporate constraints. when the guy who helped *create* deep learning says he's scared, that's worth paying attention to.

**Yoshua Bengio** — one of the deep learning pioneers. has become one of the most vocal proponents of AI safety research. if Hinton is the cautious elder statesman, Bengio is the activist.

**Yann LeCun** — Meta's Chief AI Scientist. the interesting one. where Hinton and Bengio lean cautious-to-alarmed, LeCun is the optimist-contrarian. he thinks current {sc:LLM}s are a dead end and that the real breakthroughs will come from different architectures (world models, self-supervised learning beyond text). he might be wrong. he might also be the only one seeing something everyone else is missing. that's the nature of contrarians.

**Ilya Sutskever** — co-founder of [[https://openai.com|OpenAI]], then briefly at the center of the Sam Altman firing saga in November 2023, then departed to found Safe Superintelligence Inc. ({sc:SSI}). the name says it all. Sutskever is the rare person who combines world-class technical ability with genuine, deep concern about what he's building.

**Dario and Daniela Amodei** — left OpenAI to found Anthropic. their bet: that the most important AI work isn't making models more powerful, but making them more safe, interpretable, and aligned with human values. they're building Claude — the model you might be reading this on.

**Sam Altman** — {sc:CEO} of OpenAI, the most prominent face of the AI revolution. polarizing. either the person responsibly shepherding humanity toward {sc:AGI}, or a Silicon Valley executive moving too fast with godlike technology. probably some of both.

---

{shout:attention is all you need}

here's what i keep coming back to.

the transformer is, mathematically, a surprisingly simple architecture. embedding, attention, feed-forward, residual connection. repeat. that's most of it — a [[threads/everything-is-a-pipe|pipeline]], like almost everything else in computing. you can write one from scratch in a few hundred lines of Python. the magic isn't in the design — it's in what *emerges* from scale.

and what emerges from scale is something none of the original authors predicted. something nobody predicted. a shapeless, alien intelligence that can reason, create, argue, and explain — not because anyone programmed it to, but because --language, it turns out, contains the structure of thought itself.--

we didn't build a mind. we built a machine that approximates the *output* of minds, trained on the sum total of human written expression. and the approximation keeps getting better. and we don't fully understand why. and we can't see the ceiling. and we're running out of data. and the compute costs are becoming a physics problem. and the thing we've built is fundamentally alien. and we're building it faster than we can understand it.

that's either the most exciting thing that's ever happened to our species, or the most terrifying.

probably both. right?
