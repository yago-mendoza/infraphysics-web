# Voice

> How an article sounds once it obeys the hard rules. [STYLE.md](STYLE.md) says what is never allowed; the category READMEs say how a project, an essay or a tutorial is shaped; this file is the layer in between: the difference between a text a model could have produced and one only the author would write. It is read when writing or reviewing an article (`/review-article` runs it as a procedure) and it is a lens, not a cage: a passage that already has voice is left alone. The worst outcome is a paragraph that was fine and became generic after an edit.
>
> One absolute rule: never remove specificity to add polish. A rough sentence that says something real is worth more than a smooth sentence that says nothing.

---

## Order of work

1. **Kill pass.** Delete every phrase on the list at the end of this file (STYLE.md rule 10). No judgment: if it is on the list, it dies.
2. **Structural pass** (voice direction, the two-author seam, narrative shape). An article that passes these three is probably publishable; the rest is refinement.
3. **Refinement pass** (rhythm, numbers, certainty, headings, coining). Nudges that improve a decent article and will not save a broken one.
4. **Connection pass** (wiki links with a sense check, cross-references, missing concepts). The procedure is the skill.

What matters most depends on the type:

| Check | Essays | Bits2Bricks | Projects |
|---|---|---|---|
| Voice direction (concrete up) | critical | moderate, clarity first | critical, show the build |
| Two-author seam | critical, the main threat | low, one teacher voice | high, seams show in the story |
| Narrative shape | critical | low, tutorials can be linear | high, a project is a narrative |
| Rhythm and register | critical, jagged tone is the voice | moderate | high, conversational |
| Numbers | high, anchor the claims | critical, precision is the point | high, real metrics |
| Opinions | critical | low, teach | moderate, show taste |
| Headings and tics | high | moderate | moderate |

---

## Concrete up, never abstract down

A model writes top down: a thesis, then generic examples, and the reader is in a lecture. A person writes bottom up: something that happened, then the claim it grew into, and the reader is discovering something. *Agents don't generate good ideas* is model prose. *Yesterday one of them discovered that a bigger network has lower loss*, followed by the claim, is a person: the abstraction grows out of the dirt.

The test: take any abstract sentence. Is there a concrete event, number or anecdote within two sentences of it? If the abstraction floats free, anchor it or cut it.

## The two-author seam

Many drafts have a visible seam: the experiences are human and the conclusions are machine. The opening anecdote is specific and imperfect (memory); the section closings are polished, symmetrical, quotable (the model). Conclusions should be as imperfect as openings.

- **Implicit judgment.** The deepest human signal is a standard revealed through a complaint, not a declaration. *I had to come in to point that out* reveals a standard for rigour through annoyance. A model can describe standards; it cannot leak them by accident. A voice that is all declarations (*good engineering requires X*) and no leaked judgment (*I couldn't leave it like that*) reads as synthetic.
- **One voice per article.** If it starts personal, the technical sections stay personal: *the model memorizes your examples*, not *SFT optimizes the policy to maximize the likelihood of demonstration tokens*.
- **Emotional honesty.** Model writing costs the author nothing. Retroactive prices do not count (*I was fairly sure it counted as cheating*, told years later). Real prices are present tense: *I don't know if I have the math to follow where this is going*. The test: is there a sentence the author hesitated over before publishing?
- **Other people.** *I showed my boss the curve and he told me to focus on the sprint* is worth more than three paragraphs on why the curve matters.
- **Closings.** A hedged ending undercuts the whole piece: end with the confidence of the rest. A summary paragraph signals the model; an article needs a landing (a specific image, a claim, a callback to the opening) or it just stops. If the messiest paragraph is the most authentic, promote it from a caption or a box into the body.

## Failure first, insight second

A model writes success narratives: setup, execution, result, conclusion, and everything works. Human narratives are shaped like stumbling: *I tried X, it didn't work, and this is what I learned*. Signs of the model: the argument is stated up front and proven section by section, every example supports the thesis, the author is never stuck or wrong. Signs of a person: the insight arrives late, after the mess; something was tried that failed; there is a moment of not knowing what to do next. If the draft reads like a proof, find the struggle that led to the insight.

## Rhythm and register

- **Jagged tone.** A model homogenizes: same formality, same sentence length, same temperature throughout. Human writing shifts: jargon, then a metaphor, then a mundane observation. Each shift resets attention. If every paragraph sounds the same, it needs breaks.
- **Parenthetical asides** are cracks in the fourth wall: a laugh, a complaint, a tangent mid-thought. A model does not interrupt itself. A text with zero asides and zero mid-thought reactions is too controlled. (The aside goes in parentheses, never after a dash: STYLE.md rule 3.)
- **Paragraph length.** Four to six sentences everywhere is metronomic. One short paragraph after three long ones creates emphasis; a very long one creates immersion. The variation is the rhythm, within the density STYLE.md rule 5 asks for: one short paragraph lands, a run of them is a slide deck.
- **Short sentences that earn their brevity.** Some points need a line, and the urge to expand and qualify is the model's pull. But a short sentence is not a formula: a long wind-up followed by *That's it.*, repeated, is a tic.
- **Performative self-awareness**, the most insidious residue: first person used to decorate rather than inform. Three shapes. Undirected admiration (*it changed how I think more than anything I'd read*: awe with no object; name the specific thing or cut it). Section selling (*but here's where it gets practical*: a trailer for the next section; delete it and start the section). Rhetorical metacommentary (*let me be direct*: announcing a posture instead of adopting it).
- **Do not explain what already landed.** After a strong concrete image, move forward or add a new detail; the sentence that restates it in abstract terms weakens it. Read the concrete sentence, skip the restatement, read the next paragraph: if nothing is lost, it was a crutch.
- **Proportions.** Short intros that drop the reader in, with the thesis in the first line. Asymmetric sections: if one part is harder, give it more room; equal lengths signal a template. Brief conclusions after heavy bodies.

## Numbers as texture, not argument

A model uses numbers to persuade: round, authoritative, decorated. A person uses numbers because they remember them from a terminal. Real measurements get real numbers (*18,935 lines not including tests*, not *nearly 19,000*). Approximations sound like approximations (*maybe 12 hours*, *~110 changes*). Never decorate: no *an impressive*, no *notably*, no *which represents*; the number speaks or it does not. In data-heavy sections every number needs a human referent: *GPQA Diamond: 88.4* means nothing, *tasks that took a person nine seconds in 2020 and forty minutes by late 2024* is a scale a body understands.

## Opinions and certainty

Say it without disclaimers; the reader decides. Keep at least one preference the author cannot fully defend (an aesthetic judgment, *this just feels right*): a text with zero unjustifiable preferences reads as synthetic. Certainty is bimodal, not uniform: completely sure where the author knows (*that era is over*), openly uncertain where not (*not sure what my setup ends up looking like*). Uniform hedging (*perhaps* everywhere) is the model; the asymmetry is what generates credibility.

## Headings

Sentence case always. Register by category: Bits2Bricks descriptive (*What SFT changes in the model*), essays with voice, projects conversational (*What you're looking at*). Depth and count are STYLE.md rule 7 (flat by default, never a heading under a heading).

**Mechanism over topic.** A generic heading names the subject; a good one names the movement of the subject. *The map problem* says what the section is about; *Dead reckoning* says how the error works and lends the reader an instrument they keep using. Words borrowed from another trade (navigation, medicine, law, cooking) pay best: they arrive with a structure attached that does part of the argument. The condition is rare but not opaque: the reader must recognise the word by the end of the section, so the heading pays off in retrospect. If it needs a dictionary it is ornament; if the reader finishes thinking *so that is why it was called that*, it is architecture. The same test applies to the body: *you're only ever shown the derivative; the era is the integral* beats any flat paraphrase.

Decisions already taken, to calibrate the next ones:

| Heading | Article | Decision |
|---|---|---|
| *The alignment problem* | Transformers and the data wall | Kept: names the research field, not a generic *The X* |
| *The honest machine* | The paperclip you already are | Kept: sets up an inversion the article earns |
| *What you're looking at* | FinBoard | Kept, sentence-cased: conversational wording fits the project voice |
| *the third door* | Why Rust exists | Changed to *a third option*: fairy-tale cliché |
| *The shoggoth* | Transformers and the data wall | Kept: specific cultural reference |

## Syntactic tics

Legitimate devices that become signatures through repetition. The frequency limit is the rule; the formation itself is STYLE.md rule 9.

| Tic | Limit |
|---|---|
| *Not because X, but because Y* | one per article, the most detectable tic on the site |
| *Not as an X, but as a Y* | one per article |
| Tricolon, the escalating list of three | one per article; cut to two or expand to four |
| The mic-drop short sentence | powerful once, formulaic twice; vary placement |
| Chiasmus | people do not produce perfect symmetry by accident; keep it or break it |
| *That's not X. That's Y.* | one at most, and only if the reframe adds information |

**Exhausted analogies.** Some have been used so often in a domain that the reader's brain skips them: *we don't build planes with feathers*, *standing on the shoulders of giants*, *the map is not the territory*. The test: search the analogy plus the domain; if the first page of results makes the same point with the same image, it is exhausted. Find a fresher image or make the argument naked. The exception is an exhausted analogy used against its usual meaning (*but we did steal the airfoil*).

## Coining and referencing

Coin terms without defining them. A model writes *what I call agentic engineering, the practice of...*; a person uses the term as if it already existed (*org code*, *meta-setup*, *the substrate principle*) and the reader absorbs it by osmosis. If a term needs explanation, fold it into the narrative, not into a definition.

Reference sources as found, not as researched. *According to Sutton (2019)* is the model; *I found this paper at 2 AM because someone on Hacker News was wrong about scaling laws* is a person. The discovery story is more human than the citation, and the link sits on the words that name the thing (STYLE.md rule 1 for the title in italics).

Reference other articles of the site the same way, as a person: *I wrote about this in the scaling laws piece; the Chinchilla numbers were what changed my mind*, never *for more on this topic, see our article on scaling laws*. The link comes with a reason.

## Connections

Three layers: articles, wikinotes, context annotations. Link a wikinote when the concept matters to the argument and the note adds what the article does not cover; skip casual uses and stubs. A string match is not a concept match: *failure* in a poetic sentence is not the algebraic note, and the sense is checked in the note's description before linking. Ordinary words and rhetorical comparisons do not need links because a matching note exists; fewer useful links beat dense annotation. After publication, a `>> YY.MM.DD` annotation is the natural place for a found connection (*I wrote a wikinote on this; the mechanism is more nuanced than what I said here*). The full procedure, including the search and the missing-concept list, is `/review-article`.

## Final pass

**Facts.** Before publishing, verify the specific numbers, people's titles and roles, claims about model capabilities and market figures; they drift. If a figure cannot be verified quickly, soften it: *roughly 70%* beats a wrong specific number. The verified source becomes the link.

**The nuclear test.** Read the article straight through and mark every sentence where the brain says *this sounds like a model*. Those are the problem, not because they are wrong but because they are generic, and generic is invisible. The question for each: is this something only the author would write? If a model could have produced it, it needs a fingerprint: a specific example, a personal opinion, an unusual image, anything a model would not reach for. And the question for the whole: does the article contain a single sentence the author hesitated over? If not, it is safe, and safe is invisible.
