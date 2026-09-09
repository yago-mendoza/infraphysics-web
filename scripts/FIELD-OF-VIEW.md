# Field of View

`npm run content`, `npm run dev` and `npm run build` regenerate the Home map from public article tags and the Wiki. The implementation is `compute-field-of-view.js`; the inspectable result is `src/data/field-of-view.generated.json`. There is no curated domain list, coordinate table, date dependence or random seed.

## Evidence and selection

Each project contributes a base weight of **1**, each Bits2Bricks article **0.9**, and each essay **0.6**. These are editorial weights, not measurements of quality or production readiness. A document divides its base weight equally among its distinct tagged concepts. Repeating tags or adding aliases for the same concept gives it no extra weight. Hidden articles are excluded.

Resolved Wiki links in the article body contribute additional evidence. For `n` distinct linked concepts, the bonus is `baseWeight × 0.25 × n / (n + 8)`, distributed equally among those concepts. Eight concepts supply a 12.5% bonus, sixteen supply 16.7%, and even hundreds cannot reach 25%. Repetition adds nothing; code examples, comments and ordinary links do not count. `LINK_BONUS_MAX` and `LINK_HALF_SATURATION` are the two global parameters. Tags therefore always supply at least 80% of the article's evidence. The same rule applies to essays. A tag repeated as a body link contributes through both channels, but is counted once within each channel.

This is a bounded proxy for conceptual breadth, not a measurement of writing quality or depth. Sparse linking does not remove an article's base contribution. Using only body links would over-represent well-linked articles and make the map depend too heavily on annotation habits.

Every tag must resolve to exactly one Wiki name, address or alias. Matching ignores case and treats spaces, hyphens and underscores alike. Missing or ambiguous tags stop compilation with the article ID and tag. Use a full Wiki address for homonyms, such as `web dev//framework//React`; do not silently pick the first match. Tags should describe substantive concepts discussed in an article. Use canonical names and avoid incidental product mentions or editorial labels such as `personal` and `hype`.

The Wiki supplies the taxonomy through each concept's address. Links between Wiki notes remain useful for navigation, but do not participate in coverage. Every source contribution must identify a tag or a resolved body wikilink in the article itself. Changing only references between Wiki notes leaves the complete Field of View result unchanged.

Weight is summed by the Wiki's existing top-level domains. This is hierarchical aggregation, not a flat competition between tags: `ML//time series` contributes only to ML. Mathematics receives weight from that article only if the article separately tags or links a concept under mathematics. The sum of all domain contributions equals the article's base weight plus its bounded bonus. `coverage` is domain weight divided by total corpus weight.

A domain qualifies if at least two articles explicitly tag or link its subtree, or one project does; it must also receive at least **2.5% of the corpus weight**. Choose up to **eight** qualifying domains by descending weight, breaking ties by stable UID. These thresholds keep a small Home map from filling with one-off interests. All candidates, including excluded ones, and their per-article contributions remain in the generated report.

## Coordinates and evidence

**X is ordinal coverage rank among the selected domains**: the largest share is furthest right. Equal horizontal steps mean rank differences, not equal percentage differences. **Y is the fraction of that domain's weighted evidence contributed by projects and Bits2Bricks**, from 0% at the bottom to 100% at the top. More practical emphasis is not a claim of real-world deployment, proficiency or seniority. Dates do not affect either axis, so the map describes the published corpus rather than claiming to measure current attention.

Content coordinates occupy the inner 14–86% of the plot. The pills themselves represent the domains, with no dots or connector lines. A deterministic layout pass measures their actual size and moves each pill to the nearest available position with eight pixels of separation, in coverage order. It runs again when the plot or text size changes. This readability adjustment does not change scores; the generated JSON preserves the original coordinates. Selecting a pill replaces its name with `(coverage %, practical emphasis %)`, while its domain name remains in the detail panel. These are the underlying metrics, not CSS coordinates; horizontal placement still orders coverage ranks. Both text states reserve the same space to prevent hover-induced movement.

`relatedArticles` counts each article once if it tags **or** body-links a concept anywhere in the domain's subtree. `directArticles` retains the tag-only count, and `linkedArticles` the body-link count; they overlap and must not be added. The JSON records both sets of concept UIDs per article, category, base weight, link bonus and separate `tagWeight` and `linkWeight` contributions. Their sum is the article's contribution to the domain. All positive contributions are retained, so `sources.length` equals `relatedArticles` and every counted article has explicit evidence.

Project `technologies` describe the implementation stack and do not contribute to coverage. For example, Python, PyTorch and NumPy remain technologies, while time series, simulation and model evaluation describe the subject. Only `tags` must resolve through the Wiki. This prevents a frequently used dependency from becoming a Home domain solely through stack listings.

The compact detail panel has one editorial sentence explaining why a domain matters to the author. These sentences live in `src/data/field-of-view-context.json`, keyed by stable Wiki UID. They are deliberately authored rather than inferred from graph scores. A selected domain with a missing, blank or overlong explanation (more than 140 characters) fails the build with an actionable error. Explanations never affect selection or coordinates. The panel aligns with the plot's lower edge and article titles occupy at most two lines. It links to the Wiki and the three strongest article contributions.

The method deliberately inherits the Wiki taxonomy: moving a concept to another root changes its domain allocation. Editing article tags or body wikilinks also changes its contribution. Editing links between Wiki notes does not. Weights and thresholds are global rules; do not adjust individual domains to recreate an old picture.

## Verification

Run `node --test scripts/compute-field-of-view.test.js` for order invariance, weight conservation, duplicate-tag resistance, independence from Wiki reference edits, reparenting, auditable source contributions, invalid tags, hidden content, practical emphasis, selection limits and label spacing. Run `npm run build` to validate the actual corpus and generate the production artifact. `dev-scripts/check-field-of-view.mjs` checks rendered pill geometry and source links on desktop and mobile with an installed Playwright module.
