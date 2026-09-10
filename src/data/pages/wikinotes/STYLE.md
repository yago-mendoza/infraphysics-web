# Writing a wikinote

> How a wikinote is written: shape, tone, what goes in the body and what goes in Interactions, names, paths, size, and which syntax a note may use. The operational side (scripts, renames, validation) is in [README.md](README.md). Frontmatter schemas are in [../README.md](../README.md).
>
> This document is iterated against real notes: a few are rewritten, the author comments on the result, the rules here change, and only then the rest of the wiki is aligned. Treat it as the current best statement, not as finished.
>
> Model notes to imitate: `feedback loop` (mathematics//dynamical systems), `covariance` (mathematics//statistics), `differential equations`, `oscillator` (mathematics//differential equations//ODE), and the first rewrites reviewed with the author: `quantization` (density budget, payoff in a box), `channel capacity` (links to lighten, no history), `MySQL` (a product, so history allowed). `Besu` still shows what to avoid: a bullet list of fragments.

---

## Shape

- **Never a bare bullet list.** A note that is only bullets is not acceptable, however short the concept. 183 notes are still in that shape and will be rewritten.
- **Open with one or two paragraphs**, medium-long, that define the concept by its mechanism and say why it exists. Then, if the note has several distinct points, a bullet list where every bullet is a full argument. Several paragraphs in a row with no list are fine. A list with a single item is fine. What is not fine is a wall of short paragraphs, or fragments.
- **Sentences, not labels.** "Relational database." is not an opening; "MySQL is a relational database that runs as a server process, and most of its character follows from that" is. "Formula (Shannon-Hartley): ..." is not a bullet; "Shannon and Hartley bound the rate by the bandwidth and the signal-to-noise ratio, ..." is.
- **A bullet is an argument.** It starts with the claim and develops it in two or three sentences with the reason, the number or the equation that makes it true, and where relevant the limit of the claim. The bullets of `feedback loop` are the reference: each one could be a paragraph on its own.
- **Say the limits.** *A property of this example is not a universal rule.* A note that states where its claims stop is a note, not a summary.
- **Close with the exits.** The last bullet or sentence points to the notes that continue the subject: which one covers the connections, which the timing, which the stability.
- **Density budget.** Two dense paragraphs in a row is the ceiling. When the second one is still going, the reader is carrying too much: break the rhythm. The consequence, the payoff, the *so what* of the definition goes into a `{bkqt/keyconcept}` box (the box holds the result, never the definition), and the rest becomes bullets. The `quantization` note is the reference: definition paragraph, mechanism paragraph, the payoff in a box, then bullets.
- **Links are the lightening device.** A sentence that names three concepts reads easily when the three are links and badly when each is defined inline, because the reader can defer what is linked. When a paragraph feels dense and cannot be cut, add links before adding words. The first two paragraphs of `channel capacity` were rewritten this way.
- **Advanced qualifiers go in parentheses.** If a clause exists only to be exact for a specialist (*plus a scale factor shared by a block of neighbours*), it goes in parentheses so the main sentence reads without it. If it cannot be read without it, it is a child note or it is dropped.

## Tone

- Sober, technical, present tense. No exclamation, no selling adjectives, no "note that", no "it is important to", no lists of advantages.
- No em-dashes anywhere. Use a parenthesis, a period or a comma and rebuild the sentence.
- Second person only for a computational instruction ("name the velocity as a state").
- Define by mechanism, not by category: *An equation whose unknown is a function and whose statement is about its rate of change*, never *X is an important concept in Y*.
- **English throughout, always.** The wiki is written in English and only in English: proper nouns and quoted material keep their language, nothing else does. It is never translated. Articles may exist in a second language (see [../STYLE.md](../STYLE.md)); wikinotes do not, and an article in another language still links to the English note.
- **Calm, not compressed.** This is an engineering notebook, not a mathematics text, even when it borrows the register. One idea per sentence; a connective sentence that says why the next thing matters is welcome; three facts folded into one sentence is not. When a sentence has to be reread to be parsed, it is two sentences.
- **Technical depth is bounded by the author.** The note may go as deep as the material the author brought or would recognise, and no deeper. A bullet that only a specialist could check (the internals of GPTQ, AWQ and LLM.int8, for instance) does not belong unless the author supplied it; name the method with a link if a note exists, otherwise leave it out. A note the author cannot read is a note the author will not maintain.
- **No history unless it explains.** Dates, founders and *before X people thought Y* stay out of a concept note. History belongs only to things anchored in time (a product, a model generation like GPT-2, a protocol version) or when it explains a design decision or why the thing works the way it does. A historical contrast that survives that test is usually an interaction with the older concept, not a paragraph.
- **No double quotes; italics instead, and never as the first word of a sentence.** The site-wide rule is in [../STYLE.md](../STYLE.md). *Four-bit* opening a sentence reads as a heading; rebuild so the term comes after a verb.

## Numbers and equations

- Equations and numbers live **inside the reasoning**, at the point where they are needed, and are read immediately after: "The trace is \(-(a+b)\) and the determinant \(ab-k_{12}k_{21}\); the origin is stable exactly when \(ab>k_{12}k_{21}\)."
- Inline math `\( … \)` for anything that fits on the line. A `{math}` block for an equation that deserves its own line, with a blank line before `{math}` and after `{/math}`, and always a sentence after it that says what the reader is looking at.
- **A block always ends the bullet or paragraph it follows.** The block takes the full width and the compiler closes the list item; text written as a continuation of the same bullet after the block lands unindented and misaligned. So: end the bullet at the formula, and start the next thought as a new bullet or a new paragraph. Never place a block in the middle of a sentence.
- One block per idea. Two blocks in one bullet means the bullet is two bullets, or a child note.

## Bold, italics, and when a term becomes a note

- **Bold marks a term defined in that sentence** that the reader has to recognise a few lines later in the same note: "reinforcing", "compensating", "static saturation nonlinearity". It is a local anchor, used once, at the definition.
- **Conversion rule.** If, while bolding a term, it turns out to need its own definition, its own equation or its own example, or two other notes will name it, it stops being bold and becomes a child note with a link. Quick test: would you put the term in `aliases`? Then it stays bold (as `feedback loop` does with "feedforward" and "saturation"). Would you give it an address? Then it is a note.
- Bold never wraps a wiki-link and never wraps a whole sentence, except a one-line warning of limits.
- Italics for a word that is named but not defined ("that is *windup*").
- Synonyms and alternative names go in `aliases` so search finds them, and are bolded at their first mention in the body.

## Body versus Interactions

- The body explains the concept **on its own**. Test every sentence: would a reader who opens only this note understand it? If the answer is "only if they already know the other concept", the sentence is an interaction.
- An interaction is a one-line thesis about **the relation**: what separates the two, what confuses them, which contains which. "The differential equation is the local rule, written term by term; the dynamical system is everything that rule implies once you let it run." It is not a summary of the other note.
- Content that exists only in the pair, and says little about either concept alone, always goes to Interactions. This is how the top of a note stays uncluttered.
- Write each interaction on **one** note only. The interface crosses it automatically; writing it on both produces duplicates in `check-references.js`.
- "Developed in [[…]]" or "the timing is explained in [[…]]" is delegation, not an interaction. That stays in the body.
- Every note should be able to answer "which concept is this confused with?". The answer is usually its first interaction.

## Names and casing

- `name` and the last address segment are the same string, in the form the term takes **in the middle of a sentence**: common nouns in lowercase (`feedback loop`, `initial condition`), proper nouns, products and acronyms in their own casing (`Kalman filter`, `PID controller`, `RLHF`, `EtherNet/IP`, `npm`).
- Shortest canonical term. No articles, no trailing qualifiers, singular unless the concept is inherently plural (`differential equations` as a family, `Empty blocks` as a Besu term).
- The title of the note, its card, the search results and the directory show the first letter capitalised (`displayTitle`, built by `displayName()` in `src/lib/content/casing.js`); a bare `[[uid]]` mid-sentence shows the name verbatim; a bare `[[uid]]` that opens a sentence or a bullet is capitalised by the compiler. A note whose name must never be recased (`npm`, `iOS`) declares `proper: true` in its frontmatter. Never write `[[uid|Feedback loop]]` just to capitalise: the pipe is for a different wording, not for casing.
- Parent segments follow the same rule.

## Paths

- As granular as the concept allows: `Math//differential equations//ODE//oscillator`, not `Math//oscillator`. Every intermediate segment exists as a note; if it does not, create a stub and give it a real opening paragraph as soon as possible.
- A path must justify each step. `Web Dev//SQL//MySQL` fails at the first step: SQL is not a web development concept, and a `databases` level is missing. Sections with weak justification are found and reorganised in a dedicated audit (pending).
- Moving branches is free and expected. When new notes make a new upstream parent sensible, restructure with `move-hierarchy.js`, fix the `distinct` entries the build flags as stale, and rebuild. The `date` of a moved note does not change.

## Size and distribution

- The ideal is `feedback loop`: about 2,400 characters with two equations. The median note today is 700 characters; the longest 3,900.
- Above roughly 2,500 characters, or when a bullet asks for its second equation or its second example, that bullet is a child note.
- Distribute. One note says one thing well and delegates the rest with links. The same explanation appearing in two notes is the sign that a third note is missing.

## Syntax a wikinote may use

Allowed:

- Paragraphs, bullet lists whose items are arguments, `**bold**`, `*italics*`.
- `\( … \)` inline math, `{math} … {/math}` blocks (blank lines around them).
- `[[uid|text]]` links; `aliases` and `distinct` in the frontmatter.
- `{bkqt/keyconcept}` at most once per note, only for a recipe the reader will copy (the "Building a rate equation" box). **Typed notes take no label in wikinotes:** a label written after the pipe is ignored by the compiler and reported as a build warning. Put that sentence in the box text instead.
- `{{term|footnote}}` for a side remark that would break the sentence.
- A fenced code block only for a literal command or config line.

Not allowed:

- Headings of any level. `## Interactions` is the only heading and it is reserved; the note view hides heading anchors and a heading inside a note adds nothing.
- Images and tables.
- Context annotations (`>> date - text`); they are a project-history primitive.
- `tldr`, cross-document links to articles unless the article is the source of the claim.
- A `~` on its own (write "approximately"), bold inside a link, unquoted dates in the frontmatter.

## Rendering notes

- Paragraphs and lists in a note have a little more air between them than article text; the rule is in `wiki-content.css`.
- Body text renders at the size of an interaction title (Tailwind `text-sm`), forced with `!important` because `global.css` pins article body size above 768px.
