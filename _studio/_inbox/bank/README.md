# Bank

One file per saved idea or source, organized by folder. Preserve the supplied material and its provenance; capture does not mean drafting an article.

| Folder | What belongs here |
|---|---|
| articles/essays/ | Essay ideas |
| articles/projects/ | Things to build |
| articles/bits2bricks/ | Tutorials and reproducible experiments |
| articles/&lt;category&gt;/additions/ | Material to add to an existing article in that category; record its target |
| ideas/quotes/ | Saved quotes and takes |
| ideas/ | Destination not yet decided |
| facts/ | Dated claims and figures, with source and verification status |

Article seeds live under articles/, with additions/ inside each category. Loose material lives under ideas/, with quotes/ inside it. Facts remain a shared source pool. The folder is the category. **Do not add `kind` to bank frontmatter.** Keep title, status, added, source, language and useful tags as described in the [studio schema](../../README.md#frontmatter). If two formats remain possible, choose the current best fit and record the alternative in the body. Do not duplicate the file.

Use `npm run find -- --folder articles/projects`, with optional --text, --tag and --status. The finder searches every bank subfolder. --folder articles selects all article seeds and additions; --folder ideas selects loose ideas and quotes; --folder additions selects additions across categories. A full folder path narrows to that branch. The shorthand --folder projects includes its additions. Its older --kind project filter also derives the type from the folder; it does not require frontmatter.

## Where an item goes from here

Finished tweets go to [the Twitter queue](../../twitter/queue). Article ideas stay here until several sources form a topic worth joining in [the article queue](../../articles/queue/README.md). A single idea does not need a second file there.

For an article topic, `bank: ["articles/essays/watts-and-tons"]` refers to bank/articles/essays/watts-and-tons.md; that item carries `topics: ["topic-slug"]` back. Bank references include their subfolder and omit .md. After moving an item, update those references and relative Markdown links, then run `npm run find -- --links`. An unused bank item is normal.
