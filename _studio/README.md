# Studio

The workshop next to the site. Nothing here is compiled, served or listed anywhere: the build reads `src/data/pages/`, the studio reads the build. It holds three things the site does not: material on its way in (tweets saved, links, half ideas), the style base of a second channel (Twitter, with its own voice, structures and drawings), and the playbook for turning what the site already knows into new pieces for either channel.

```
_studio/
  README.md            this file: the flow, and how ideas are mined from the wiki and the articles
  inbox/               one file per idea or saved item, for articles and for Twitter (see its README)
  facts/               dated pieces of information (a number, a claim, a quote) with source and verification status
  ai-ctx/              generated: one pasteable prompt plus docs per job, named by input and output (articles/, tweets/); never edited by hand
  NO-TICS.md           the one paragraph of machine residue every text here must lose, pasted into every prompt

  twitter/
    README.md          the three states of a piece (bank, queue, posted) and the daily shape
    STRATEGY.md        the phase the account is in and why, what to do tomorrow, what to measure
    bank/              reusable takes, prepared replies, one-liners, memes with captions: no date, no target yet
    queue/             what is going out: dated, with the target url for replies and quotes, image beside the file
    posted/            what went out, with the link: the history
    examples/          tweets and threads by others worth keeping, with the pattern they show
  visuals/
    articles/          image styles the author wants for article images, with a STYLE.md line per reference
```

The site's own style lives with the site: [pages/STYLE.md](../src/data/pages/STYLE.md) (hard rules), [pages/VOICE.md](../src/data/pages/VOICE.md) (how an article sounds), [pages/VISUAL.md](../src/data/pages/VISUAL.md) (how an image looks) and the category READMEs. Twitter borrows none of it on purpose: what goes out there follows no canon, so there is no style file under `twitter/`.

## The flow

1. **Capture.** Something worth keeping (a tweet, a thread, a link, a sentence, a drawing) goes into `inbox/` as one file, raw, with a title and where it came from. A dated piece of information (a figure, a claim, a quote) goes to `facts/` with its source and `status: unverified` until a primary source is opened. A tweet or thread that is kept for *how it is written* rather than for what it says goes to `twitter/examples/` instead, with the pattern named. An image kept for a style wanted on the site goes to `visuals/articles/`; an image for a tweet sits beside the tweet's file.
2. **Grow.** A file gains material over weeks: a second link, a counterargument, the paragraph that would open it. Its `status` moves from `seed` to `growing`.
3. **Decide the channel.** The same idea can become a tweet, a thread, a wikinote or an article, and often more than one in sequence (a thread that works becomes the spine of an essay; an essay ships as a thread). The `kind` field records the current bet, not a promise.
4. **Draft.** A tweet or thread is written in `twitter/queue/` (or, with no date and no target yet, in `twitter/bank/`); an article moves to `src/data/pages/<category>/` as a draft with `hidden: true`. The inbox file stays behind marked `drafting`, then `done`.

## Finding what is already here

Every piece under `twitter/` and `inbox/` carries a frontmatter built for retrieval (tags from `twitter/TAGS.md`, kind, status, format, language, source, and `mood` when it helps): `npm run find -- --tag agents --status ready` lists what matches without anyone reading the folder, `npm run find -- --tags` lists the vocabulary in use, `npm run find -- --tvb gwern` searches the hand-written `_add-ctx/` folders under `ai-ctx/`. The schema is in `twitter/README.md`. An agent asked *find me something about X* runs the finder; it does not open files. The finder is a tool, not an interface: when a question would be faster with a new filter or output, the agent changes `scripts/studio-find.js` and says so.

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
| The inbox itself | Ideas that have grown | Whatever the file's `kind` says |

Scale of what a cluster yields: one note is a tweet; two notes with a contrast are a thread; five notes of a cluster are a short video or a long thread; ten notes are a long piece; twenty notes of a domain are an article. The knowledge is already structured; the studio only takes it out of the domain and puts it where people are.

Two rules that came from the strategy notes and still hold: never publish a piece without a place to distribute it (a piece nobody sees does not exist), and never translate. Each piece is written in one language from scratch: English when the value is technical and the audience is global, Spanish when the value is the voice, the opinion or the audience. The site's articles are the exception that the language layer handles (an essay may have a Spanish sibling); tweets and threads are not.

## What an AI is given

An AI outside this repo (a browser chat, another tool) gets one file from `ai-ctx/`: the pack for the job, named by its input and its output (`articles/essay-from-notes`, `tweets/reply-to-post`, the rest in `ai-ctx/README.md`): the prompt for that job, the no-tics paragraph and the relevant documentation concatenated verbatim, generated by `scripts/context-pack.js` from the sources so there is never a second copy to keep in step. Two hand-written folders sit beside the generated files and can be pasted after a pack: `ai-ctx/_add-ctx/` (shared: favourite sources to look things up) and `ai-ctx/tweets/_add-ctx/` (the author's own expressions, sentences, moves, allergies, for tweets only). After the pack comes the material: the draft, the wikinotes or article it draws on (`src/data/wikinotes-index.generated.json` has every note's description and plain body), or a few files from `twitter/examples/` and `twitter/posted/` when the job is a tweet (there the AI is told to match the account, not a rulebook: tweets follow no canon). To find ideas, the context is this file plus the index. Nothing in the studio is read by `/review-article`; the two worlds share the hard rules and nothing else.
