---
name: review-article
description: Review one article against the hard rules, the voice guide, the syntax toolbox, external sources and the wiki, and report (or apply with --apply)
argument-hint: "<slug | path | url> [--apply]"
---

Review one published or draft article and produce an ordered report of what to change. The report is the deliverable. Nothing is written to the article unless `$ARGUMENTS` contains `--apply`, and even then only the mechanical part (see the last section). Rewriting the author's sentences is never done silently: voice is the author's.

Write the report in the language the user is speaking to you. Follow the site's hard rules in your own prose too (no em-dashes, no arrows, no *not X, Y*).

## Locate the article

`$ARGUMENTS` is a slug (`your-context-is-the-moat`), a source path, or a public url (`/blog/essays/<slug>`, `/lab/projects/<slug>`). Sources live in `src/data/pages/{projects,essays,bits2bricks}/<slug>.md`. Resolve it, read the whole file (frontmatter and body), and note the category: every later step depends on it.

## Required reading, by sections

Read these before judging anything. Sections only, never cover to cover, except STYLE.md.

| File | Read |
|---|---|
| `src/data/pages/STYLE.md` | All ten rules and their tables, the kill list included. This is the law. |
| `src/data/pages/SYNTAX.md` | *Where each feature applies* (what this category may use), then only the sections of features you intend to propose (Typed notes, Lifted paragraph, Parameter sheets, Footnotes, Tables, Structured references, Context annotations). |
| `src/data/pages/VOICE.md` | The whole file (it is short): the structural checks (concrete up, the two-author seam, failure first), rhythm, numbers, certainty, headings and the log of decided ones, the tics table, coining and referencing, the final pass. STYLE.md rule 10 is the kill list. |
| Category README | `src/data/pages/<category>/README.md`: the voice and the storytelling patterns of that category. |
| `src/data/pages/README.md` | Only the wiki-link paragraph (when a `[[uid\|text]]` label is warranted) and the frontmatter schema of the category, if you touch frontmatter. |

If you propose an image, also read `src/data/pages/VISUAL.md`. Otherwise do not.

## Pass 1: hard rules (STYLE.md, one to ten)

Go through the body line by line and record every violation with its line number, the offending text and a proposed rewrite that fits the meaning of the sentence. Grep helps, judgment decides. Patterns worth running on the source (outside fenced code, inline code and math):

- Em-dash family: `—`, `–`, ` -- `, a spaced hyphen used as a dash.
- Arrows: `→`, `⇒`, `↔`, `->`, `=>`, `<-`, `-->`, `<->`.
- Double quotes in prose: `"` outside code spans and image position titles.
- Negation-then-reframe: `not because … but`, `not as … but as`, `isn't about`, `is not a … it is a`, `It's not X. It's Y.`, `The answer:`, `Why? Because`.
- Footnotes: `.^[` (period before the marker) and `^[…]` whose text does not end in a period.
- Headings: a heading directly under a heading, `##` or `###` in an article short enough to be flat, a body that starts at `##`.
- Runs of three or more paragraphs under fifteen words.
- The kill-list phrases of rule 10 (*let's dive in*, *it's worth noting*, *furthermore*, *let me be direct*, *in summary*, *only time will tell*, and the rest).

Also collect the `[STYLE]` warnings the build prints for this file. The build skips files that come from `.content-cache.json`; if the file is cached, remove its entry from the cache (or touch the file) and run `npm run build` once.

## Pass 2: form (what the syntax toolbox could do better)

Read the article again for shape, not for rules. For each finding give the line range and the concrete change.

- **One article or two.** Say whether the draft moves in one direction with enough pull, or whether a theme takes the spotlight for a few paragraphs and never returns (the sign of a second article hiding inside). Name the theme, the paragraphs, and whether it should shrink to a sentence, leave for `src/data/inbox/`, or stay. Guidance in `essays/README.md`, *One article or two*.
- **Tables.** A paragraph that carries three or more figures, a comparison of several things along the same axes, a list of parameters: propose a table (SYNTAX *Tables*) or, in projects, a parameter sheet.
- **Footnotes versus parentheses.** A parenthesis that only sources or qualifies a claim (a number's provenance, a caveat the sentence survives without) becomes `^[…]`; a footnote that changes the meaning of its sentence comes back into it as a parenthesis (STYLE rule 8).
- **Paragraph distribution.** Where the text runs in one-line fragments, name the paragraphs that should merge and the sentence that should carry the join. Where one paragraph carries two movements of thought, name the split. Rhythm rules in VOICE.md (*Rhythm and register*); density in STYLE rule 5.
- **Headings.** For every section heading, say whether it names the topic or the mechanism (VOICE.md, *Headings*) and propose the word some craft already uses for that movement when the current heading is generic. Check the ladder (`#`, then `##`, never a skipped level) and the depth (flat by default, STYLE rule 7).
- **Typed boxes and the lifted paragraph.** A warning that hides in prose, a key concept the reader must keep, a sentence that would serve as the section's lead: propose the box or the lift, within what the category allows (SYNTAX *Where each feature applies*). Boxes have no title.
- **Accent, keyboard keys, math.** A label the text refers back to may take `{accent:…}`; a key combination takes `{kbd:…}`; an inline formula written in prose takes `\(…\)`.
- **Context annotations.** For a published piece, a place where a later finding or a correction belongs as a `>> YY.MM.DD` annotation instead of a silent edit.

## Pass 3: external links and facts

Every named paper, book, standard, tool, dataset, benchmark, talk, person's work and specific statistic in the article is a candidate for a link on the name that is already there (`[*Attention Is All You Need*](url)`, the title in italics per STYLE rule 1, the link on the italic). For each candidate:

1. Search the web for the primary source (the paper's own page, the project's repository, the standard's publisher, the original report), not an aggregator.
2. Open it and confirm it says what the article says it says. A number that has drifted, a title slightly wrong, a claim the source does not make: report it as a fact finding (VOICE.md, *Final pass*) with the corrected value and the url.
3. Propose the link with the exact url you verified. Never write a url you did not open. If nothing reliable turns up, say so and propose nothing.

Do not link a name used in passing, and do not add a *see also* sentence: the link sits on the existing words. Links to other articles of the site come as a person would write them (VOICE.md, *Coining and referencing*), with a reason, and use the identity form `[[essays/<id>|text]]` so they survive renames.

## Pass 4: wiki links, with a sense check

Load `src/data/wikinotes-index.generated.json` once. Each entry has `id` (the uid), `name`, `aliases`, `address`, `description` and `searchText` (the plain body). The wiki is English only, whatever language the article is in.

For every technical term, named principle, method, component or concept in the article:

1. Search `name`, `aliases` and the last segments of `address`, case-insensitive, partial matches included.
2. **Check the sense before proposing.** A string match is not a concept match. Read the note's `description` (and `searchText` if the description is not enough) and confirm the article uses the word in the same sense as the note. *Failure* used poetically in an essay is not the algebraic *failure* note; *bank* in a river is not the financial one; *attention* as a human faculty is not the transformer mechanism; *channel* in a story is not channel capacity. When the senses differ, do not propose the link, and if such a link already exists in the article, report it for removal.
3. Apply the VOICE.md test (*Connections*): link when the concept matters to the argument and the note adds what the article does not cover; skip casual uses and stubs (a note whose `searchText` is a couple of sentences). Fewer good links beat dense annotation.
4. Propose `[[uid]]` when the note's name reads naturally in the sentence, or `[[uid|text]]` when grammar needs another form (plural, verb, a Spanish label in a translated article). Never use a label that changes the meaning. Never capitalise the label to fix a sentence start: the compiler does that.

Report each proposal as: line, the words in the article, uid, address, one clause on why the click rewards the reader. Report the existing links that fail the sense test or the §B test in a separate list.

## Pass 5: concepts the wiki is missing

List the concepts the article explains at length (three paragraphs or more, or a named principle it has to unpack) that have no note. For each:

- The proposed `name` in mid-sentence casing as `src/data/pages/wikinotes/STYLE.md` requires (`feedback loop`, `Kalman filter`, `RLHF`).
- A proposed `address` (`domain//parent//name`), reusing existing parents from the index.
- The segment-collision check from `src/data/pages/wikinotes/README.md`: search the last segment of the address across all addresses, case-insensitive, and say whether a note with that segment exists and whether it is the same concept.
- One line on what the note would let the article stop explaining.

Do not create the notes. The author creates them by hand following the wikinotes README and STYLE; this list is the brief.

## The report

One report, in this order, each section a numbered list with line numbers, so the author can work top to bottom:

1. **Hard rules** (pass 1), grouped by rule, worst first.
2. **Form** (pass 2).
3. **External links and facts** (pass 3), verified urls only, fact corrections first.
4. **Wiki links** (pass 4): proposals, then existing links to remove.
5. **Missing concepts** (pass 5).
6. **Build**: the `[STYLE]` lines for this file, and a note if the title, subtitle or cover changed (the share card must be regenerated: `npm run og`, then `npm run content`).

Keep each item to the line, the current text, the proposed text and at most one sentence of reason. No preamble, no summary of the article, no praise.

## With `--apply`

Apply only what does not touch the author's phrasing, then run `npm run build` and report what was applied and what remains as proposals:

- Footnote placement (rule 8) and the period inside the footnote.
- Double quotes to italics (rule 1) when the quoted span is a term or a title.
- Verified external links on existing words (pass 3).
- Wiki links that passed the sense check (pass 4), and removal of the ones that failed it.
- Fact corrections that are a number or a name, when the source is unambiguous.

Everything else (dashes, arrows, reframes, paragraph merges, headings, boxes, tables) changes sentences and stays in the report until the author says which to take. If the user asks to apply everything, do it item by item from the report and rebuild the sentence around each change instead of swapping one symbol for another.
