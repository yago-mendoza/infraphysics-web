# Article concepts and Field of View

Before editing content, read [README.md](README.md), [STYLE.md](STYLE.md), and the relevant category guide. Use [wikinotes/README.md](wikinotes/README.md) and [wikinotes/STYLE.md](wikinotes/STYLE.md) for Wiki operations and authoring.

For projects, Bits2Bricks and essays:

- Body wikilinks are editorial decisions made while writing or reviewing, not automatic matches against Wiki names, aliases or graph proximity. Read the surrounding paragraph and the destination note's actual body before adding or approving each link. A valid UID only proves that the destination exists. Check the intended sense, technical scope and usefulness to the reader; leave ordinary mentions, metaphors and uncertain matches unlinked. Never rewrite a passage or broaden a Wiki note merely to justify a link. See the [semantic review guidance](README.md#semantic-review-of-wikilinks).

- Every public article needs nonempty `tags`. Choose concepts central to the actual argument, mechanism, method or application, not every noun mentioned. Usually three to six are enough; this is guidance, not a quota.
- Each tag must resolve to one existing Wiki name, alias or full address. Check homonyms. Use readable aliases such as `React.js` when a short name is ambiguous. If a central concept is missing, create a substantive Wiki note using its authoring workflow; do not add empty notes solely to satisfy validation.
- `technologies` describe the implementation stack. Python, PyTorch and NumPy belong there when they are merely tools used. A technology can also be a topic when the article actually explains it, such as an article about Rust. A stack entry alone does not contribute to Field of View.
- Tags feed Home's Field of View. Each article has a base category weight divided among its distinct tagged concepts. Resolved Wiki links in the body add a bounded secondary contribution (at most 25% extra, with diminishing returns); repeated links add nothing. The Wiki address hierarchy groups both kinds of evidence into domains. Links between Wiki notes do not transfer coverage: each contribution needs an explicit tag or wikilink in the article itself. Choose accurate tags and useful links, never annotations intended to manufacture a higher position. Retagging changes the map and deserves an editorial review against the article body.
- A health-related simulation is not evidence of clinical validation. Tags describe the subject; they must not imply outcomes or deployment the article does not establish.
- Run `npm run content` after changes. Missing or ambiguous tags fail compilation. If a newly selected Field of View domain lacks a personal explanation, add one short, evidence-grounded sentence (maximum 140 characters) under its Wiki UID in `src/data/field-of-view-context.json`. Do not invent biography or motivation, or change selection rules to silence the error.

The complete map method and verification commands are in [scripts/FIELD-OF-VIEW.md](../../../scripts/FIELD-OF-VIEW.md).
