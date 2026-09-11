# Examples

Tweets and threads by other people, kept for how they are written rather than for what they say. Each one names the pattern it shows, in the author's own words; there is no list of canonical structures to map it to, the examples are the list.

One file per tweet or thread, `<author>-<slug>.md`:

```yaml
---
author: "@handle"
url: "https://x.com/..."
saved: "2026-09-11"
pattern: "number with a human referent"   # the structure it shows, in the words STYLE.md uses
language: en | es
---
```

Body: the tweet or thread verbatim (every tweet on its own paragraph, in order), then a short note on why it works and what to take from it. Do not tidy the original; the point is the shape as it was posted. A screenshot of the tweet can sit next to the file with the same name (`<author>-<slug>.png`) when the layout matters.
