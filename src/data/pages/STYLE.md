# Hard writing rules

> These apply to every article on the site (projects, essays, Bits2Bricks) and, where stated, to wikinotes. They are not a menu. A category README says how a project or an essay *sounds*; this file says what is never allowed anywhere, regardless of voice. When a rule here conflicts with a category guide or with `_generation/EDITORIAL-RUBRIC.md`, this file wins.
>
> The build reports violations on the source markdown as `[STYLE]` warnings (see the last section). They are warnings and not errors only because the rules arrived after most of the archive was written; a new or edited article should leave the build with zero `[STYLE]` lines for its file.

## 1. No double quotes in prose. Use italics.

Never wrap a word, a term, a title, a phrase somebody said or a scare quote in `"…"`. Set it in italics with `*…*`. Italics are quieter and read as typography; quotation marks read as air quotes.

| Instead of | Write |
|---|---|
| The dashboard says "healthy". | The dashboard says *healthy*. |
| the meaning of "bank" | the meaning of *bank* |
| a paper called "Attention Is All You Need" | a paper called *Attention Is All You Need* |
| the so-called "predictive maintenance" | the so-called *predictive maintenance* |
| He told me "focus on the sprint". | He told me to *focus on the sprint*. |

What stays as it is: code and identifiers in backticks (`` `for` ``), quotes inside fenced code blocks, and the image position title (`"center"`, `"full"`, `"pair"`), which is syntax rather than prose. A quote longer than a sentence goes in a blockquote, not in quotation marks.

Single quotes for emphasis are not an escape hatch. Same rule.

Recommendation, every category: do not open a sentence with the italic term. *Four-bit* as the first word of a sentence looks like a heading; rebuild the sentence so the term arrives after a verb (*Calling a model four-bit says how its numbers are stored*). The same goes for a term that would have carried quotes. The one exception is the lead of a typed box (rule 4): a whole sentence in italics as the first line of a box is a lead, not a term, and is allowed.

## 2. No arrows. Write the sequence out.

Never chain concepts with arrows in prose, whatever the spelling: the symbols (`→`, `⇒`, `↔`, `⟶`) and the typed ASCII forms (`->`, `=>`, `<-`, `-->`, `<->`, `==>`) are the same thing and equally banned. Not *input → model → output*, not *A -> B -> C*, not *cause => effect*. Arrows are a slide habit; on a page they say *I did not want to write the sentence*.

Write the sequence as a sentence (*the input goes through the model and comes out as a prediction*), as a numbered or alphabetical list when the steps matter, or as a table when several sequences sit side by side. Inside a `{math}` block an arrow is mathematics and is fine.

This rule also applies to wikinotes: no arrows in explanations. Use a typed box (`{bkqt/…}`) or a list.

## 3. No em-dashes as punctuation.

The standing rule from `CLAUDE.md`, restated here so the list is complete: never use `—` as a break in body text. The same goes for its lookalikes: the en dash `–`, the double hyphen `--` and a spaced hyphen ` - ` used as a dash are the em-dash typed differently. A hyphen only joins words (*closed-loop*, *two-tank*).

The preferred replacement is the parenthesis. An aside, a qualification, a reaction mid-thought, the thing a dash would have carried: put it between parentheses and keep the sentence going. A period when the aside is a sentence of its own. A comma only for a light pause that the sentence would survive without. Choose per phrase and rebuild the sentence so the punctuation fits its meaning; never swap the dash for another symbol mechanically.

| Instead of | Write |
|---|---|
| *The pump — the old one — failed first.* | *The pump (the old one) failed first.* |
| *We tried it again — nothing.* | *We tried it again. Nothing.* |
| *Three sensors — all cheap — drift within a week.* | *Three sensors, all cheap, drift within a week.* |
| *The residual is small — which is the point.* | *The residual is small (which is the point).* |

The only routine exception is the separator in list-style constructs (definition lists, `tldr` bullets, trailing refs).

## 4. Typed boxes have no title.

A coloured box (`{bkqt/note}`, `{bkqt/tip}`, `{bkqt/warning}`, `{bkqt/danger}`, `{bkqt/keyconcept}`) opens with the type and nothing else. There is no label syntax any more: `{bkqt/tip|Some title}` is a build error, and the compiler never prints the type's name as a heading either. If the box needs a lead, write it as the first sentence of the box, in italics if it has to stand apart.

| Instead of | Write |
|---|---|
| `{bkqt/keyconcept\|Control and diagnosis ask different questions}` | `{bkqt/keyconcept}` followed by `*Control and diagnosis ask different questions.*` as the first line |
| `{bkqt/warning\|The piecewise model matters}` | `{bkqt/warning}` and start the text with the fact |

The type still picks the semantics (a warning is a warning); it just does not shout it.

## 5. Dense paragraphs, not loose lines.

Write compact, dense paragraphs. A paragraph carries a complete movement of thought: a claim, its reason, its consequence. Do not scatter one-line paragraphs for effect (*That's it.* / *Then you watch zero.* / *Read that again.*). One short paragraph in an article can land; a run of them is a tic, and it reads as a slide deck pasted into a page. Prefer three tight paragraphs to nine fragments. Lists are for actual sequences and inventories, not for prose that lost its nerve.

The build flags a run of three or more consecutive paragraphs under fifteen words each. That is a heuristic, not a verdict: fix the run or leave it on purpose, but know it is there.

## 6. Titles are literal. Descriptions develop the title.

`displayTitle` and `subtitle` say exactly what the piece is, in the words a specialist would use to file it: the object, the method, the result. No hook, no pun, no *the thing nobody tells you*, no second person, no cliffhanger. A reader who sees only the title in a list must know what they will get and be right. Projects and Bits2Bricks follow this strictly. An essay may state its claim or its question as the title, but the claim is still literal and descriptive, never a tease.

`description` (cards, meta tags, feeds) is the professional development of that title in two to four sentences: what system or material, what was done to it, what the piece establishes, and where it stops. It reads like the abstract of a technical report, not like a trailer. Same for `subtitle`, one sentence long, in projects and Bits2Bricks. Essays are the exception: their subtitle is two short sentences at most, a line the essay already contains and the question it chases, never a list of what the sections cover (`essays/README.md`, *Subtitles*).

| Instead of | Write |
|---|---|
| *Thirteen equations, four residuals, and a leak your controller is actively hiding from you* | *Structural analysis of thirteen component relations, four analytical redundancy relations, threshold calibration on healthy runs and signature-based isolation of leak, valve, pump and sensor faults* |
| *How to catch a leaking tank with a little linear algebra. No dataset. No neural network.* | *Model-based fault detection and isolation on a two-tank hydraulic plant under closed-loop control. Thirteen component relations are reduced by structural analysis to four analytical redundancy relations, evaluated as residuals on Simulink runs, thresholded on healthy data and matched against a fault-signature matrix. Covers detectability and isolability, the noise cost of differentiating level measurements, and the failure of exact signature matching.* |
| *The keys to your kingdom* | *Local agent frameworks hold plaintext credentials on disk: what OpenClaw stores, where, and what an attacker gets* |

The voice of the body is free (see the category READMEs). The frontmatter is not: it is the catalogue entry, and catalogue entries are literal.

This rule is not checked mechanically. Read the title back as a librarian would.

## 7. Flat structure. Few headings, long sections, text between levels.

An article is a handful of `#` sections with real bodies, not an outline. The default is one level: structure the text so that it needs no `##`, and certainly no `###`. A section that seems to want subsections usually wants better paragraphs, or a sentence that announces the turn (*Two things go wrong here. The first is...*), or a list if it is an actual inventory. Subheadings are the model's habit of tidying a topic into boxes; the reader wants to be carried through a section, not filed.

Nesting is allowed when there is a reasonable cause, and length is the usual one: a long Bits2Bricks tutorial or a project write-up that would otherwise run a `#` section past a couple of screens may open `##` inside it, and in extreme cases `###`. Even then the ladder is `#` then `##` then `###`, never a skipped level, and the count of subheadings stays small.

What is never allowed, at any depth, is a heading immediately followed by another heading. Between `#` and the first `##` under it there is always body text: at least a paragraph that says what the section is and why it splits. A heading that only introduces the next heading is an empty room.

| Instead of | Write |
|---|---|
| `# The features` / `## Turning events into features` (nothing between them) | `# The features` / one paragraph on what a feature is here and why the section has three moves / `## Turning events into features` |
| `# Results` / `## Accuracy` / `## Latency` / `## Cost`, four lines each | `# Results`, one dense section that walks accuracy, latency and cost in prose, with a table if the numbers earn it |
| `### Step 3.2.1` in a six-hundred-word tutorial | Numbered list or a plain paragraph inside the `#` section |

This rule is not checked mechanically. Read the outline back: if it looks like a table of contents for a manual, flatten it.

## 8. Footnotes are `^[…]`, placed before the period.

A footnote is written inline as `^[text]` (see `SYNTAX.md`, Footnotes) and attached to the end of the sentence it clarifies. The marker sits before the closing period of the sentence, and the period comes after it, even though it looks odd on the source line: `A statement^[The clarification.].` Never put the period first (`A statement.^[…]`), because then the footnote hangs between two sentences and belongs to neither. The text inside is a complete sentence with its own period.

| Instead of | Write |
|---|---|
| `The filter converges.^[On healthy runs only.]` | `The filter converges^[On healthy runs only.].` |
| `The filter converges^[on healthy runs only]` (no periods) | `The filter converges^[On healthy runs only.].` |
| `The filter^[Kalman, not particle.] converges on every run.` | `The filter converges on every run^[Kalman, not particle.].` |

Footnotes and parentheses do different jobs. A parenthesis is part of the sentence and the reader reads it in the flow; a footnote is a clarification the reader may skip. If the aside changes the meaning of the sentence, it is a parenthesis. If it only qualifies or sources it, it is a footnote. There is no other footnote form: no `[^1]` reference footnotes, no asterisks, no bracketed numbers.

## 9. No negation-then-reframe. Say the thing.

The formation *not X, Y* in every spelling: *not a bug, a feature*; *it is not the model that fails, it is the data*; *not because X, but because Y*; *not as a tool, but as a colleague*; *this isn't about accuracy. It's about trust.* Each one states what something is not before saying what it is, to borrow weight from the contrast. Once in an article it is a device; produced every third paragraph it is the most recognisable machine habit on the page, and the reader learns to skip the first half.

Write the positive claim. If the negated half carries information (a misconception the reader actually holds), give it a sentence of its own with its own reason, instead of folding it into the reframe.

| Instead of | Write |
|---|---|
| *This is not a performance problem, it is a memory problem.* | *The bottleneck is memory. The processor sits idle waiting for it.* |
| *It works not because the model is large but because the data is clean.* | *It works because the data is clean. The size of the model has nothing to do with it.* |
| *We treat the log not as a record but as a signal.* | *We treat the log as a signal.* |
| *The goal isn't speed. It's predictability.* | *The goal is predictability. Speed comes second.* |

The same rule covers the rest of that family: the rhetorical question answered by its own next sentence (*Why? Because…*), the colon reveal (*The answer: latency.*), the tricolon that escalates in three, the one-line mic drop after a long paragraph, the closing paragraph that summarises what the reader just read, and the sentence that announces its own posture (*Let me be direct*). The full kill list and the frequency limits for each tic live in `_generation/EDITORIAL-RUBRIC.md` (§A and §7); this rule is the short version that applies everywhere.

## 8. Context notes are short and plain.

A context annotation (`>>`) is a note in the margin, not a second essay. Think the content through as carefully as you like, then write it down short and plain: what happened, what you make of it, in the words you would use to a friend. No pomp, no closing flourish, no sentence that exists to sound intelligent. Around a hundred words is the ceiling; less is usually better.

| Instead of | Write |
|---|---|
| *There is something like pure luck in being alive to see it: a problem that had resisted generations giving way in a night, an explosion of intelligence that shows no sign of tiring...* | *I'm still amazed every time this happens, and I feel lucky to be here for it.* |
| *It is the oldest coordination problem, at a new speed.* | *At some point we'll need to agree, together, on what we want from this.* |

This rule is not checked mechanically. Read the note aloud: if it sounds like a speech, cut it.

## How the rules are enforced

`scripts/build-content.js` scans the markdown body of every article it compiles (`checkStyleRules`) and prints one `[STYLE]` line per rule per file with the first offending line numbers: double quotes (rule 1), arrows (rule 2), runs of short paragraphs (rule 5). Fenced code, inline code, inline and block math, link and image targets and raw HTML are excluded from the scan. A typed-box title (rule 4) is a build **error**, not a warning, because the syntax no longer exists. Em-dashes (rule 3), footnote placement (rule 8) and the negation-then-reframe formations (rule 9) are not checked mechanically yet; read for them. A file that comes from the build cache is not re-scanned; edit it, or run `npm run content` after clearing `.content-cache.json`, to see its warnings again.

## Adding a rule

Add a numbered section here with the rule, a two-column *instead of / write* table, and its exceptions. If the rule can be checked mechanically, add the check to `checkStyleRules` in `scripts/build-content.js` and describe it in the enforcement section. Then mention the rule in the "On writing or editing ARTICLES content" block of `CLAUDE.md` if it is one an assistant is likely to break by habit.
