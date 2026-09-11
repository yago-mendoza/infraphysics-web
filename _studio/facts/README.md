# Facts

Dated pieces of information kept for later use: a number, a claim, a quote, an event, with where it came from and whether it has been checked. Not ideas (those are `../inbox/`) and not tweets (`../twitter/`): the raw material a footnote, a tweet or an essay paragraph will draw on. One file per fact, `<slug>.md`:

```yaml
---
title: "One line, the fact as a claim"
saved: "2026-09-11"            # the day it was saved here, always
dated: "2025-01"               # when the fact happened or was stated, as precise as known
source: "@handle or outlet, url if known"
status: unverified | verified | disputed | stale
tags: [compute, economics]     # from ../twitter/TAGS.md
---
```

Body: the material verbatim (quoted if it is someone else's words), then a rule (`---`) and notes: what was checked, against what, what to check before using it, and where it has been used. A fact is `verified` only when a primary source was opened and the number confirmed; it turns `stale` when the world moves on (a capex figure from one year is stale the next).

`npm run find -- --tag compute` reaches these files like any other piece.
