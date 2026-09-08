---
uid: "Kc9mNx4R"
address: "ML//Knowledge Cutoff"
name: "Knowledge Cutoff"
date: "2026-03-08"
---
- The date at which an LLM's training data was frozen. Everything published after this date is invisible to the model unless retrieved in real time.
- Not a clean cut: training data is a snapshot of the web at crawl time, processed and filtered over months. The "cutoff" is the latest date in the corpus, not a single collection event.
- Implications for web devs: even with perfect [[Ax4kJn8M|AEO]], your content only enters a model's knowledge if it was crawled before the cutoff and survived filtering. Getting into training data is a months-long pipeline, not an instant event.
- Real-time retrieval bypasses the cutoff: Perplexity, ChatGPT with search, and Google AI Overviews fetch live content. This is faster but less sticky: the model does not "know" you, it just found you.
- Training data vs retrieval knowledge: training data shapes the model's priors (it *believes* things). Retrieved content is contextual (it *reads* things). Being in training data means the model recommends you unprompted. Being in retrieval means it cites you when asked.
- Current cutoffs (as of early 2026): GPT-4 ~Apr 2024, Claude 3.5 ~Apr 2024, Gemini ~varies. Each new model generation pushes the cutoff forward.

## Interactions

- [[JdOhceqx]] : : Claude's knowledge cutoff determines what it knows natively vs what it needs to retrieve: Anthropic's training pipeline decides which web content makes it into Claude's weights
- [[Et5mN8wJ]] : : extended thinking operates within the model's training knowledge: it can reason deeply about what it learned before cutoff but cannot think its way to post-cutoff facts
