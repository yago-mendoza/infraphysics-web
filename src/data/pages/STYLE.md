# Hard writing rules

> Every article (projects, essays, Bits2Bricks) and, where stated, wikinotes. Not a menu: a category README says how a piece *sounds*, this file says what is never allowed. When a rule here conflicts with a category guide or with [VOICE.md](VOICE.md), this file wins. The build prints the mechanical ones as `[STYLE]` warnings on the source markdown; a new or edited article leaves the build with zero `[STYLE]` lines for its file.

## 1. No double quotes in prose. Use italics.

A term, a title, a phrase somebody said, a scare quote: `*…*`, never `"…"`. Single quotes are the same thing. What keeps its quotes: code in backticks, fenced code blocks, and the image position title (`"center"`, `"full"`, `"pair"`), which is syntax. A quote longer than a sentence is a blockquote.

Do not open a sentence with the italic term (*Four-bit* as a first word reads as a heading); rebuild so it arrives after a verb. The one exception is the lead of a typed box (rule 4).

## 2. No arrows. Write the sequence out.

Symbols (`→`, `⇒`, `↔`) and typed forms (`->`, `=>`, `<-`, `-->`, `<->`) are the same thing: none of them between concepts in prose. Write the sequence as a sentence, a numbered list when the steps matter, or a table when several sequences sit side by side. Inside `{math}` an arrow is mathematics. Wikinotes too.

## 3. No em-dashes as punctuation.

Never `—` as a break in body text, nor its lookalikes: the en dash `–`, the double hyphen `--`, a spaced hyphen ` - `. A hyphen only joins words (*closed-loop*). The preferred replacement is the parenthesis; a period when the aside is a sentence of its own; a comma only for a pause the sentence would survive without. Choose per phrase; never swap the dash for another symbol mechanically. The only routine exception is the separator in list-style constructs (definition lists, `tldr` bullets, trailing refs).

*The residual is small — which is the point.* becomes *The residual is small (which is the point).*

## 4. Typed boxes have no title.

`{bkqt/note}`, `{bkqt/tip}`, `{bkqt/warning}`, `{bkqt/danger}`, `{bkqt/keyconcept}` open with the type and nothing else; `{bkqt/tip|Some title}` is a build error, and the compiler never prints the type's name. If the box needs a lead, it is the first sentence of the box, in italics when it has to stand apart.

## 5. Dense paragraphs, not loose lines.

A paragraph carries a complete movement of thought: claim, reason, consequence. No runs of one-line paragraphs for effect (*That's it.* / *Read that again.*): one short paragraph can land, a run of them is a slide deck. Lists are for sequences and inventories, not for prose that lost its nerve. The build flags three or more consecutive paragraphs under fifteen words; a heuristic, not a verdict.

## 6. Titles are literal. Descriptions develop the title.

`displayTitle` says exactly what the piece is, in the words a specialist would file it under: object, method, result. No hook, no pun, no second person, no cliffhanger. An essay may state its claim or question as the title, still literal.

`description` (cards, meta, feeds) develops the title in two to four sentences like the abstract of a technical report: what material, what was done, what it establishes, where it stops. `subtitle` is one such sentence in projects and Bits2Bricks. Essays are the exception: their subtitle is one or two short sentences that tell a reader who sees only the card what the piece is about (the actors and the tension), never a list of what the sections cover (`essays/README.md`, *Subtitles*).

*Thirteen equations, four residuals, and a leak your controller is hiding from you* becomes *Structural analysis of thirteen component relations, four analytical redundancy relations, threshold calibration on healthy runs and signature-based isolation of leak, valve, pump and sensor faults*.

Not checked mechanically: read the title back as a librarian would.

## 7. Flat structure. Few headings, long sections, text between levels.

An article is a handful of `#` sections with real bodies. The default is one level: no `##`, and certainly no `###`. A section that seems to want subsections wants better paragraphs, a sentence that announces the turn, or a list if it is an inventory. Nesting is allowed when length gives a reasonable cause (a long tutorial, a project write-up), then only one level down where possible, the ladder never skipped (`#`, then `##`, then `###`), and the count small.

Never a heading directly under a heading: between `#` and its first `##` there is always body text that says what the section is and why it splits.

Not checked mechanically: if the outline reads like the table of contents of a manual, flatten it.

## 8. Footnotes are `^[…]`, placed before the period.

Inline, at the end of the sentence it clarifies, the marker before the closing period: `A statement^[The clarification.].` Never the period first (`A statement.^[…]`), and the text inside is a complete sentence with its own period. A parenthesis is part of the sentence (it changes the meaning); a footnote only qualifies or sources it and may be skipped. No other footnote form: no `[^1]`, no asterisks, no bracketed numbers.

## 9. No negation-then-reframe. Say the thing.

The formation *not X, Y* in every spelling (*not a bug, a feature*; *not because X, but because Y*; *not as a tool, but as a colleague*; *this isn't about accuracy. It's about trust.*) states what something is not to borrow weight from the contrast. Write the positive claim; if the negated half carries information (a misconception the reader actually holds), give it its own sentence with its own reason.

*The goal isn't speed. It's predictability.* becomes *The goal is predictability. Speed comes second.*

The same rule covers the rest of the family: the rhetorical question answered by its own next sentence (*Why? Because…*), the colon reveal (*The answer: latency.*), the tricolon that escalates in three, the one-line mic drop after a long paragraph, the closing paragraph that summarises what the reader just read, and the sentence that announces its own posture (*Let me be direct*). VOICE.md keeps the frequency limits for the devices that survive once.

## 10. Context notes are short and plain.

A context annotation (`>>`) is a note in the margin, not a second essay: what happened, what you make of it, in the words you would use to a friend, about a hundred words at most. No pomp, no closing flourish, no sentence that exists to sound intelligent.

*It is the oldest coordination problem, at a new speed.* becomes *At some point we'll need to agree, together, on what we want from this.*

Not checked mechanically: read the note aloud; if it sounds like a speech, cut it.

## 11. The kill list. Delete on sight.

Phrases that never survive an edit, whatever the category; the sentence around them is rebuilt or removed.

- Openers and bridges: *Let's dive in*, *Let's explore*, *Let's break it down*, *In this article, we will*, *Now here's where it gets interesting*, *Let's now consider*, *Another important aspect*, *This brings us to*, *This reveals an interesting tension between*.
- Throat-clearing: *It's worth noting that*, *It's important to note*, *One could argue that*, *While there are nuances*.
- Transitions as words: *Furthermore*, *Moreover*.
- Intensifiers, one per article at most: *genuinely*, *fundamentally*, *arguably*. Cut the word or commit to the claim.
- Announcing a posture: *Here's where I stop hedging*, *Here's where I get honest*, *Let me be direct*, *Now for the part that actually matters*, *I'll say it plainly*, *To put it bluntly*.
- Closings: *Only time will tell*, a last paragraph opening with *In summary* or *Ultimately*, hedged endings (*Probably both. Right?*).

The one exception on record: *This is not a metaphor. This is literally what happens.* works once across the whole site (the transformers article) and nowhere else.

## Enforcement

`checkStyleRules` in `scripts/build-content.js` scans the markdown body of every compiled article (fenced and inline code, math, link and image targets and raw HTML excluded) and prints one `[STYLE]` line per rule per file with the first offending lines: double quotes (rule 1), arrows (rule 2), runs of short paragraphs (rule 5). A typed-box title (rule 4) is a build error. A cached file is not re-scanned; edit it or clear `.content-cache.json`. The rest is read for.

To add a rule: a numbered section with the rule, its exceptions and one example only where the rule is ambiguous; a check in `checkStyleRules` when it can be mechanical; a mention in the *On writing or editing ARTICLES content* block of `CLAUDE.md` if an assistant is likely to break it by habit.
