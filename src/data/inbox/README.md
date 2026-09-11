# Inbox

Incoming material: article ideas, raw notes, links worth an article, counterpoints to add to a piece that exists. Nothing here is published or compiled; the build never reads this folder. It is the one place in the repo where an idea can sit before it becomes a draft in `src/data/pages/`.

One file per idea, `<slug>.md`, with a short frontmatter:

```yaml
---
title: "One line, the idea as a working title"
kind: essay | bits2bricks | project | addition | link
status: seed | growing | drafting | done | dropped
added: "2026-09-11"
target: "essays/everything-is-a-pipe"   # only for kind: addition, the article it belongs to
source: "AEO-PLAYBOOK (Sep 2026)"        # where it came from, optional
---
```

The body is free: the claim, why it is worth writing, what exists already, links, quotes, the paragraph that started it. Keep the hard rules of `STYLE.md` even here, so that a paragraph can move straight into a draft.

Lifecycle: a seed grows as material accumulates; when it has an angle and an opening it moves to `drafting`; when the article is published the file is marked `done` and left in place (the history of where a piece came from is worth keeping) or deleted if it added nothing. `dropped` says why, in one line.

Rescuing an idea from a conversation, a tweet or a chat: paste the raw material as the body, give it a title, do not tidy it. Tidying is what a draft is for.
