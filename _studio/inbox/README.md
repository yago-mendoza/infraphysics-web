# Inbox

Incoming material for both channels: article ideas, tweet and thread ideas, raw notes, saved tweets and links, counterpoints to add to a piece that exists. Nothing here is published or compiled; the build never reads this folder. It is the one place in the repo where an idea can sit before it becomes a draft, in `src/data/pages/` for an article or in `../twitter/queue/` (or `../twitter/bank/` while it has no date) for a tweet or thread. A tweet kept for *how* it is written goes to `../twitter/examples/` instead.

One file per idea, `<slug>.md`, with a short frontmatter:

```yaml
---
title: "One line, the idea as a working title"
kind: essay | bits2bricks | project | addition | tweet | thread | link
status: seed | growing | drafting | done | dropped
added: "2026-09-11"
target: "essays/everything-is-a-pipe"   # only for kind: addition, the article it belongs to
source: "AEO-PLAYBOOK (Sep 2026)"        # where it came from, optional
tags: [agents, security]                 # what it is about, from ../twitter/TAGS.md (shared vocabulary)
---
```

The body is free: the claim, why it is worth writing, what exists already, links, quotes, the paragraph that started it. Keep the hard rules of `STYLE.md` even here, so that a paragraph can move straight into a draft.

Lifecycle: a seed grows as material accumulates; when it has an angle and an opening it moves to `drafting`; when the article is published the file is marked `done` and left in place (the history of where a piece came from is worth keeping) or deleted if it added nothing. `dropped` says why, in one line.

Rescuing an idea from a conversation, a tweet or a chat: paste the raw material as the body (a tweet verbatim, with its url and author), give it a title, do not tidy it. Tidying is what a draft is for. The same file can end up as both a thread and an article; `kind` records the current bet.
