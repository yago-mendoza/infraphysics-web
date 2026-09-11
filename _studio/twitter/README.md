# Twitter

Everything that can be prepared before it goes out, in the state it is in. Three folders hold pieces and one holds references:

| Folder | What is in it | Dated | Has a target |
|---|---|---|---|
| `bank/` | Reusable material with no date and no destination yet: takes on recurring topics, prepared replies to questions that keep coming back, one-liners, memes and images with their caption, observations waiting for the right conversation. | no | no |
| `queue/` | What is going out: a post, a thread, a reply or a quote, written and ready or nearly. A reply or a quote carries the url it answers. | yes | when it is a reply or a quote |
| `posted/` | What went out, moved here from `queue/` with the link and the date. The history of the account, and the place to look when a format worked. | yes | yes |
| `examples/` | Tweets and threads by other people, kept for their shape, with the pattern named. | | |

There is no style file for Twitter on purpose: what goes out here follows no canon, not the site's hard rules, not a list of favourite structures. `STRATEGY.md` is the only guide, and it says what the account is doing this season and why (the phase, the daily shape, what to measure), not how a tweet must be written.

## One piece, one file, one image next to it

A piece is a markdown file. If it has an image, the image sits beside it with the same base name: `the-fly.md` and `the-fly.png` (or `.webp`, `.jpg`). Nothing else links them; the name does. A thread with several images numbers them: `the-fly-1.png`, `the-fly-2.png`.

Names: `bank/<slug>.md` (no date, the slug is the take: `sft-vs-dpo-which-failure.md`), `queue/<date>-<slug>.md`, `posted/<date>-<slug>.md`. A bank item that gets a destination is copied into `queue/` with the date and the target; the bank copy stays, because a good take is answered more than once, and records each use.

## Frontmatter: written so that thousands of files stay findable without reading them

Every field exists to answer a question later without opening files (*something dry about agents, in English, ready to post*; *what did I already say about MCP*; *which memes got signal from strangers*). Three axes never overlap: **tags** say what it is about, **kind** what it is, **format** what shape it has. **mood** is optional and descriptive (how this one happens to sound, so it can be found later), never a target: tone is not fixed anywhere, and the author's own material for it lives in `../ai-ctx/tweets/_add-ctx/`, hand-written. The rest is state and provenance.

```yaml
---
title: "First line or working title"
kind: post | thread | reply | quote | meme | take
status: idea | ready | posted | dropped
language: en | es
date: "2026-09-11"                  # always the day the file was saved (bank), goes (queue) or went (posted); never omitted
tags: [agi, timelines, ilya]         # what it is about: lowercase, kebab-case, three to six, from TAGS.md
mood: dry | serious | technical | playful | angry   # optional, descriptive only
format: one-liner | observation | contrast | number | story | image-caption | question | list
target: "https://x.com/..."         # the post a reply or a quote answers
target_author: "@handle"
source: "wiki:feedback-loop"        # wiki:<uid>, essay:<id>, project:<id>, inbox:<slug>, own, conversation
related: [sft-vs-dpo-which-failure]  # other pieces (file stems) that say the same thing another way
posted: "https://x.com/..."         # once it is out
signal: out-of-network              # posted only: none | in-network | out-of-network (follows or quotes from strangers)
uses: ["2026-09-12 reply to @x", "2026-10-01 post"]   # bank only: each time it went out
---
```

Rules that keep it searchable: tags always from `TAGS.md` (add the tag there first; the finder flags one that is not), one `format` per piece, `mood` only if it helps find the piece again, `status` and `date` always present (the date is the day the idea or concept was saved, so nothing here is undated), no field invented per file. The body stays free: the text as it will be posted, one paragraph per tweet for a thread, then a rule (`---`) and notes to self.

## Finding things

`npm run find -- <filters>` reads every frontmatter under `_studio/twitter/` and `_studio/inbox/` and prints what matches, one line per piece (path, kind, status, mood, format, tags, title):

```
npm run find -- --tag agents --mood dry --status ready
npm run find -- --kind reply --lang es
npm run find -- --text "MCP"            # substring in title or body
npm run find -- --tags                  # the vocabulary in use, with counts
npm run find -- --signal out-of-network # what got signal from strangers
```

Filters combine with AND; `--tag` may repeat. Asking an agent *find me X* means asking it to run this, not to read the folder.

## The daily shape

From `STRATEGY.md`, phase one: one own post that deserves to exist (only if there is one), three to five good replies in conversations of the niche, a quote when the comment transforms the original. Before a reply: *if someone sees only this reply and opens the profile, have I given them a reason to follow?* If not, the reply does not serve the goal. The queue is where that question gets asked before sending, not after.

There is no review checklist before posting beyond the profile test. An AI helping with a tweet gets the `twitter` context pack in `../context/` (the strategy) plus a few files from `examples/` and `posted/`, and is told to match the account, not a rulebook.
