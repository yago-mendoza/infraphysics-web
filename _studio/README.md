# Studio

The workshop next to the site. Nothing here is compiled, served or listed anywhere: the build reads `src/data/pages/`, the studio reads the build. It holds three things the site does not: material on its way in (saved tweets, links, facts, half ideas), the style base of a second channel (Twitter, with its own voice and structures), and the playbook for turning what the site already knows into new pieces for either channel.

```
_studio/
  README.md                  this file: the flow, the frontmatter schema, how ideas are mined from the site

  _inbox/                    everything on its way in
    bank/                    material classified by folder, never by kind
      ideas/                 concepts, questions, takes (not developed yet)
      facts/                 datums: figures, stats, quotes (with tags for discovery)
      sources/               long-form references: articles, papers, guides (enciclopedia-like)
      articles/              (optional: topics joined from bank items)
        essays/              essay seeds
        projects/            project seeds
        bits2bricks/         tutorial seeds
    motherlode/              favourite places to look things up, one line per source (searched by --tvb)

  articles/
    articles-format/         GENERATED: one pasteable pack per article job (prompt, no-tics, the site's docs verbatim)
    queue/                   article topics: bank items joined into an angle worth writing. Not drafts

  twitter/
    STRATEGY.md              the phase the account is in and why, what to do tomorrow, what to measure
    gen_prompts/             hand-written prompts: post-from-idea, reply-to-post, quote-of-post, thread-from-article
      _format_ctx/           what those prompts share: the account block, the author's material, NO-TICS (generated)
    queue/                   finished pieces not yet posted, with the target url for replies and quotes

  visuals/
    aesthetics-examples/     image styles wanted for the site, with a STYLE.md line per reference
```

The site's own style lives with the site: [pages/STYLE.md](../src/data/pages/STYLE.md) (hard rules), [pages/VOICE.md](../src/data/pages/VOICE.md) (how an article sounds), [pages/VISUAL.md](../src/data/pages/VISUAL.md) (how an image looks), [pages/NO-TICS.md](../src/data/pages/NO-TICS.md) (the machine residue every text must lose) and the category READMEs. Twitter borrows none of it except the last one: what goes out there follows no canon, so there is no style file under `twitter/`.

## The flow

1. **Capture.** Material comes in three types (see [INTAKE.md](INTAKE.md)):
   - **Idea:** concept, question, take. One line to one paragraph. Goes to `bank/ideas/`.
   - **Fact:** datum with source. Figure, stat, quote. Goes to `bank/facts/` with `status: unverified` (then `verified`). Tags are critical here: they are how you find it later when writing an article.
   - **Source:** long-form reference. Article, paper, guide. Goes to `bank/sources/` with a `why:` annotation (context for when you'd use it).
   - An image kept for a style wanted on the site goes to `visuals/aesthetics-examples/`; an image for a tweet sits beside the tweet's file.
2. **Grow.** A file gains material over weeks: a second link, a counterargument, the paragraph that would open it. Its `status` moves from `seed` to `growing`.
3. **Decide the channel.** The same idea can become a tweet, a thread, a wikinote or an article, and often more than one in sequence (a thread that works becomes the spine of an essay; an essay ships as a thread). The bank folder records the current destination; do not repeat it in `kind`. Move the file and update its references when that destination changes. Record alternative formats in its body. The queues retain their own `kind` fields.
4. **Draft.** A tweet or thread is written into `twitter/queue/` with a date and a target, finished. An article is not: bank items are joined into a topic in `articles/queue/`, which says what the piece would argue, and only then moves to `src/data/pages/<category>/` as a draft with `hidden: true`. That asymmetry is the point: the Twitter queue holds pieces ready to send, the article queue holds angles.
5. **Trace.** A topic in `articles/queue/` carries `bank:` with the slugs it is built on, and each of those items carries `topics:` back. `npm run find -- --links` prints the graph and flags anything one-way or dead. Details in [articles/queue/README.md](articles/queue/README.md) and [_inbox/bank/README.md](_inbox/bank/README.md).

## Frontmatter

Every piece under `_inbox/` and the two queues carries a frontmatter built for retrieval. See [INTAKE.md](INTAKE.md) for per-type guidance.

| Field | Used By | Values |
|---|---|---|
| `date` | All bank items | the day it was saved (or published, for facts/sources) |
| `tags` | **Fact, Source, Ideas** | topic tags; for facts, these are critical (you'll search them later); from `twitter/gen_prompts/_format_ctx/_vocabulary/TAGS.md` |
| `source` | **Fact, Source** | URL or publication name; for facts, also include `status: unverified\|verified\|stale` |
| `why` | **Source only** | why you saved it, what article type it might feed |
| `read` | Source (optional) | `true` or `false` |
| `kind` | Queues only | bank items use folders instead. `post`, `thread`, `reply`, `quote`, `essay`, `project`, `bits2bricks`, `addition` |
| `status` | Articles/Queues | `idea`, `seed`, `growing`, `ready`, `drafting`, `done`, `posted` |
| `language` | All | `en`, `es` |
| `target`, `target_author` | Queue tweets | the url and handle a reply or quote answers |
| `bank` | Article topics | paths relative to `_inbox/bank/`, including the folder and omitting `.md` |
| `topics` | Bank items | the `articles/queue/` slugs this item feeds |

## Finding what is already here

`npm run find -- --folder projects` selects bank items by folder; add `--tag`, `--text` or `--status` to narrow them. `npm run find -- --tag agents --status ready` lists what matches without anyone opening a folder; `--tags` lists the vocabulary in use with counts and flags tags missing from TAGS.md; `--links` prints the bank-to-topic graph; `--tvb <text>` searches the hand-written line-per-entry files (the author's expressions, sentences, moves, allergies, and the sources in `_inbox/motherlode/`). An agent asked *find me something about X* runs the finder; it does not open files. The finder is a tool, not an interface: when a question would be faster with a new filter or output, the agent changes `scripts/studio-find.js` and says so.

## What an AI is given

**For an article**, one file from `articles/articles-format/`: `write-essay.md`, `write-project.md` or `write-bits2bricks.md`. Each is the whole format contract in one paste (the prompt for that job, the no-tics paragraph, the site's authoring docs verbatim), generated by `scripts/context-pack.js` from the sources so there is never a second copy to keep in step. After the pack comes the material: the topic from `articles/queue/` with the bank items it names, the draft, or the wikinotes it draws on (`src/data/wikinotes-index.generated.json` has every note's description and plain body).

**For a tweet**, the prompts in `twitter/gen_prompts/` are hand-written instead, because tweets follow no canon and there is no format doc to concatenate. Each prompt names what to paste and in what order; the shared parts live in `_format_ctx/` (`ACCOUNT.md` first, then the generated `NO-TICS.md`, then `STRATEGY.md`), and the whole of `twitter/queue/` goes in with them, because an unposted piece is live material: it may already be the right answer to the post in front of you. Every tweet job returns three variations, never one. The author's own colour (`expressions-*.md`, `sentences.md`, `moves.md`, `avoid.md`) is optional and hand-written, never scraped from his articles.

To find ideas, the context is this file plus the index. Nothing in the studio is read by `/review-article`; the two worlds share the hard rules and nothing else.

## Mining the site for ideas

The site is the raw material; the studio is where it is cut. What each layer yields:

| Source | What it gives | Shape |
|---|---|---|
| A wikinote with an annotated interaction (`:: contrast`, *unlike*, *vs*) | A difference nobody explains | One tweet, or a two-tweet contrast |
| The most connected notes of the graph (hubs, in `/wiki/graph`) | The concepts with the most angles | Pillar threads, one per angle |
| A cluster of five to ten notes under one parent | A whole topic already broken into atoms | A thread of eight to twelve tweets, one note per tweet |
| A `>> YY.MM.DD` context note in a published article | A correction or a later finding, already written in the author's voice | A single tweet linking the piece |
| An essay's `{lift}` paragraph or its box | The one claim the piece was built for | The first tweet of a thread about the essay |
| An essay's footnotes | Facts the body could not carry | Standalone tweets, each with its source |
| A project's facts sheet and brief | Real numbers and dates | Tweets that show the metric, not the story |
| A Bits2Bricks section index | A tutorial already sequenced | A thread that teaches one section, linking the rest |
| Papers already digested (Chinchilla, the transformer, RLHF) | Explanations already written in the wiki | Explainer threads |
| The bank itself | Ideas that have grown | The destination indicated by its folder |

Scale of what a cluster yields: one note is a tweet; two notes with a contrast are a thread; five notes of a cluster are a short video or a long thread; ten notes are a long piece; twenty notes of a domain are an article. The knowledge is already structured; the studio only takes it out of the domain and puts it where people are.

Two rules that came from the strategy notes and still hold: never publish a piece without a place to distribute it (a piece nobody sees does not exist), and never translate. Each piece is written in one language from scratch: English when the value is technical and the audience is global, Spanish when the value is the voice, the opinion or the audience. The site's articles are the exception that the language layer handles (an essay may have a Spanish sibling); tweets and threads are not.
