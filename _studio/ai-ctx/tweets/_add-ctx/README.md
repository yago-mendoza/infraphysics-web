# add-ctx

Optional context to paste after a tweets pack, for colour. The packs one level up are generated and carry the prompt and the strategy; these files are written by hand, never touched by the generator, and hold the author's favourite material: expressions, sentences, moves, allergies. Pasting one adds his lexicon to the result; leaving it out changes nothing else.

One line per entry, tags in brackets at the end, so `npm run find -- --tvb <text>` searches them:

| File | Entry shape |
|---|---|
| `expressions-en.md` | `- **word or phrase**: why it earns its place. Source. [tags, en]` |
| `expressions-es.md` | same, Spanish |
| `sentences.md` | `- *sentence* (who, where): what it does. [tags, lang]` |
| `moves.md` | `- **name of the move**: what it is, one example. [tags, lang]` |
| `avoid.md` | `- **thing**: why the author does not want to sound like it. [tags, lang]` |

For now this material is offered to Twitter only; the article packs carry the site's own docs and nothing from here.
