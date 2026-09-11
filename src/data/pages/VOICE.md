# Voice

> How an article sounds once it obeys [STYLE.md](STYLE.md). STYLE says what is never allowed; the category READMEs say the shape of a project, an essay or a tutorial; this file is the layer between: the criteria that separate a text a model could have produced from one only the author would write. A lens, not a cage: a passage that already has voice is left alone. Never remove specificity to add polish.

## Order of work

1. **Kill pass**: STYLE.md rule 11, no judgment.
2. **Structural pass**: concrete up, the seam, failure first. A draft that passes these is probably publishable.
3. **Refinement pass**: rhythm, numbers, certainty, headings, coining.
4. **Connection pass**: wiki links with a sense check, cross-references, missing concepts (`/review-article`).

| Check | Essays | Bits2Bricks | Projects |
|---|---|---|---|
| Concrete up | critical | moderate, clarity first | critical, show the build |
| The seam | critical | low, one teacher voice | high |
| Failure first | critical | low, tutorials can be linear | high |
| Rhythm and register | critical | moderate | high |
| Numbers | high | critical | high, real metrics |
| Opinions | critical | low | moderate |
| Headings and tics | high | moderate | moderate |

**Worked drafts.** When the author supplies a complete piece whose style has been worked, a requested change is a bounded edit: keep wording, order, rhythm and oddities unless the request, a fact or the syntax requires otherwise. Never turn polishing into a rewrite.

## Concrete up, never abstract down

A model starts with the thesis and descends to generic examples; a person starts with something that happened and climbs to the claim. Test: for any abstract sentence, is there a concrete event, number or anecdote within two sentences? If not, anchor it or cut it.

## The seam

The usual failure is a text whose experiences are human and whose conclusions are machine: a specific, imperfect opening, then polished, symmetrical, quotable section closings. Conclusions should be as imperfect as openings.

- **Implicit judgment.** A standard revealed through a complaint (*I had to come in to point that out*), never declared (*good engineering requires X*).
- **One voice.** If it starts personal, the technical sections stay personal.
- **Present-tense prices.** *I was fairly sure it counted as cheating*, told years later, costs nothing; *I don't know if I have the math to follow where this is going* costs something. Test: is there a sentence the author hesitated over?
- **Other people.** *I showed my boss the curve and he told me to focus on the sprint* beats three paragraphs on why the curve matters.
- **Closings.** End with the confidence of the rest; no summary paragraph; a landing (an image, a claim, a callback) or a plain stop. If the messiest paragraph is the most authentic, promote it into the body.

## Failure first, insight second

A model writes setup, execution, result, conclusion, and everything works. A person writes *I tried X, it didn't work, and this is what I learned*: the insight arrives late, something failed, there was a moment of not knowing. If the draft reads like a proof, find the struggle that led to the insight.

## Rhythm and register

- **Jagged tone.** Jargon, then a metaphor, then a mundane observation; each shift resets attention. Same formality and sentence length throughout is the tell.
- **Asides in parentheses.** A laugh, a complaint, a tangent mid-thought; a text with none is too controlled.
- **Paragraph length varies** within STYLE.md rule 5: one short paragraph after three long ones is emphasis, a very long one is immersion.
- **Short sentences earn their brevity.** Some points need a line. A wind-up followed by *That's it.*, repeated, is a formula; so is the line built to be screenshotted.
- **Performative self-awareness**, the most insidious residue: undirected admiration (*it changed how I think more than anything I'd read*: name the thing or cut it), section selling (*here's where it gets practical*: delete it and start the section), metacommentary (*let me be direct*: adopt the posture instead of announcing it).
- **Do not restate what landed.** After a strong concrete image, move forward or add a new detail. Test: skip the restatement; if nothing is lost, it was a crutch.
- **Proportions.** Thesis in the first line; sections as long as their difficulty, never equal by template; brief conclusions after heavy bodies.

## Numbers as texture

Real measurements get real numbers (*18,935 lines not including tests*); approximations sound like approximations (*maybe 12 hours*, *~110 changes*); no decoration (*an impressive*, *notably*, *which represents*). In data-heavy sections every number needs a human referent: *tasks that took a person nine seconds in 2020 and forty minutes by late 2024*.

## Opinions and certainty

No disclaimers; the reader decides. Keep at least one preference the author cannot fully defend. Certainty is bimodal: fully sure where the author knows (*that era is over*), openly unsure where not; uniform hedging is the model.

## Headings

Sentence case. Register by category: Bits2Bricks descriptive, essays with voice, projects conversational. Depth and count: STYLE.md rule 7.

**Mechanism over topic.** A generic heading names the subject; a good one names the movement of the subject (*Dead reckoning* over *The map problem*) and lends the reader an instrument. Trade words from another craft (navigation, medicine, law, cooking) pay best, on one condition: rare but recognisable by the end of the section, so the heading pays off in retrospect. The same test applies to the body (*you're only ever shown the derivative; the era is the integral*).

Decisions taken, to calibrate the next ones:

| Heading | Article | Decision |
|---|---|---|
| *The alignment problem* | Transformers and the data wall | Kept: names the research field |
| *The honest machine* | The paperclip you already are | Kept: an inversion the article earns |
| *What you're looking at* | FinBoard | Kept, sentence-cased: project voice |
| *the third door* | Why Rust exists | Changed to *a third option*: cliché |
| *The shoggoth* | Transformers and the data wall | Kept: specific cultural reference |

## Tics that survive once

The reframes are banned outright (STYLE.md rule 9). These are legitimate once and signatures twice:

| Device | Limit |
|---|---|
| Tricolon, the escalating list of three | one per article; cut to two or expand to four |
| The mic-drop short sentence | once; vary placement |
| Chiasmus | keep it or break it; people do not produce perfect symmetry by accident |

**Exhausted analogies** (*we don't build planes with feathers*, *standing on the shoulders of giants*, *the map is not the territory*): search the analogy plus the domain; if the first page makes the same point with the same image, find a fresher one or make the argument naked. Used against its usual meaning, an exhausted analogy can still work.

## Coining and referencing

Coin terms without defining them (*org code*, *meta-setup*), as if they already existed; if a term needs explanation, fold it into the narrative. Reference sources as found, not researched: *I found this paper at 2 AM because someone on Hacker News was wrong about scaling laws*, with the link on the words that name the thing. Reference other articles of the site the same way, with a reason (*I wrote about this in the scaling laws piece; the Chinchilla numbers changed my mind*), never *see our article on*.

## Connections

Link a wikinote when the concept matters to the argument and the note adds what the article does not cover; skip casual uses and stubs. A string match is not a concept match: check the sense in the note's description before linking. After publication, a `>> YY.MM.DD` note is the place for a found connection. Procedure: `/review-article`.

## Final pass

**Facts.** Verify specific numbers, titles and roles, model capability claims and market figures before publishing; soften what cannot be verified (*roughly 70%* beats a wrong specific). The verified source becomes the link.

**The nuclear test.** Read straight through and mark every sentence that sounds like a model. Those are the problem: not wrong, generic, and generic is invisible. Each needs a fingerprint (a specific example, an opinion, an unusual image) or it goes.
