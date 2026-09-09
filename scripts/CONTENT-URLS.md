# Content names and URLs

Articles and Wiki notes use `<slug>.md` and readable public URLs. `slug` is an explicit, lowercase kebab-case frontmatter field. Keep `id` (articles) or `uid` (Wiki) stable for references, graph relationships, media, engagement and saved history. Dates stay in frontmatter.

Examples: `wikinotes/economics.md` serves `/wiki/economics`; `projects/forecasting-visual-auras.md` serves `/lab/projects/forecasting-visual-auras`. Homonyms get meaningful context, such as `react-framework` and `react-agent`. Avoid encoding the whole Wiki hierarchy in a slug.

Changing a title or Wiki address does not change the slug. To deliberately rename a URL and its file:

```bash
node scripts/rename-content-slug.js wikinotes Economy1 economic-systems
node scripts/rename-content-slug.js wikinotes Economy1 economic-systems --apply
npm run build
```

The first command previews the operation. The second retains the old slug in `slugAliases` and renames the source file after validating collisions. `slugAliases` is separate from Wiki `aliases`, which are alternative concept names for search. Never assign an old route to a different identity.

The build scans current frontmatter, verifies filenames, identities, slugs, reserved routes and aliases, then generates `src/data/content-routes.generated.json`. Frontend navigation, cross-document links, public metadata and the Cloudflare function use the same routing rules in `src/lib/content/routes.js`. Generated files are not authoring sources.

Internal `[[uid]]` and `[[projects/id|label]]` references remain stable. Public links render with the current slug. The compiler canonicalizes existing local URLs too, preserving queries and fragments. Use the current URL when writing an ordinary Markdown link; use identity references for links that should survive future renaming automatically.

Old numeric/UID URLs, previous slugs, flat article URLs, `/blog/threads/…` and `/lab/second-brain/…` resolve to the same document. The production Pages Function returns a 301 before serving either browsers or crawlers; the SPA also canonicalizes old routes during client navigation and local preview. Query strings survive the redirect, and client redirects preserve fragments. Browsers inherit a fragment on HTTP redirects when the Location header does not replace it.

Article views (including list statistics), hearts, analytics and Giscus discussion terms retain the previous identity-based route as their storage key. RSS item GUIDs also remain stable. Media keys and Wiki JSON payloads still use IDs because those are machine assets, not authoring files or public document URLs.

Validation: `node --test scripts/content-routes.test.js`, `npm run typecheck`, `npm run build`. Browser regression checks: `node dev-scripts/check-content-slugs.mjs <playwright-module-path> --serve` starts its own preview server and closes it after the checks; pass a base URL instead to use an existing server. The initial migration script defaults to a dry run and saves a source backup before `--apply`; repeating it after migration leaves the original report intact. It is not a daily maintenance command.

Slugs must be strings. Guide filenames (`readme`, `style`, `agents`), Windows device names and the Wiki workspace route `graph` are reserved. The rename command accepts inline or multiline YAML `slugAliases` and preserves unrelated metadata and body text.
