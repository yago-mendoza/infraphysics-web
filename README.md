# infraphysics

Personal website and knowledge system: projects, essays, Bits2Bricks tutorials and a connected Wiki. React 19, React Router 7 and TypeScript, bundled with Vite 6; Markdown compiled with marked and Shiki. Tailwind runs through the CDN configuration in `index.html`.

## Development

Use Node 22.12+ and npm. On PowerShell, use `npm.cmd` if execution policy blocks `npm`.

`npm install` installs dependencies and activates the Git share-card hook. `npm run dev` compiles content and starts Vite; `npm run build` compiles the production site into `dist/`. Validation and effects of each command: [build tooling](scripts/README.md#build-and-verification-boundaries).

## Repository map

| Area | Owns |
|---|---|
| [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md) | Agent entry point, automation rules, architecture and active gotchas |
| [src/data/pages/](src/data/pages/README.md) | Published sources, frontmatter and the authoring documentation hub |
| [scripts/](scripts/README.md) | Compiler, generated outputs, media, context packs, studio finder and verification |
| `src/views/`, `src/components/`, `src/styles/` | Views, reusable UI and styles; architecture and cascade rules in [CLAUDE.md](CLAUDE.md#css-architecture-patterns) |
| `src/lib/share-card-catalog.js` | Shared inventory for card rendering and generation; [share cards](scripts/README.md#share-cards) |
| `functions/` | Pages routing, crawler metadata and API guards; [security](SECURITY.md) and [URL contracts](scripts/CONTENT-URLS.md) |
| [workers/counters/](workers/counters/README.md) | Engagement, analytics, private reports and the optional Durable Object backend |
| `media/`, `vite-plugins/media-sync.js` | Local image masters and development synchronization; [images](scripts/README.md#article-images) |
| `public/` | Same-origin assets, playgrounds, discovery files and generated crawler/Wiki data |
| [_studio/](_studio/README.md) | Saved material, article topics, tweet queue, prompts and visual references; excluded from the site build |
| `.githooks/`, `.claude/hooks/`, `.github/workflows/validate.yml` | Git automation, Claude Code guards and CI validation |
| [room/](room/README.md), `dev-scripts/` | Disposable checks and developer utilities |

## Writing and knowledge

Read the [authoring hub](src/data/pages/README.md), [syntax](src/data/pages/SYNTAX.md), [hard rules](src/data/pages/STYLE.md), [voice](src/data/pages/VOICE.md), [visual guide](src/data/pages/VISUAL.md) and category README. The [article review procedure](.claude/skills/review-article/SKILL.md) covers editorial review and source verification.

Wiki operations live in [wikinotes/README.md](src/data/pages/wikinotes/README.md), with [writing rules](src/data/pages/wikinotes/STYLE.md). Reader interactions are documented in `src/components/wiki/SecondBrainGuide.tsx`; the Home map has its own [method and evidence](scripts/FIELD-OF-VIEW.md).
Shared explorer controls live in `src/components/wiki/WikiSearchInput.tsx` and `WikiLenses.tsx`, with `src/styles/wiki-explorer.css`; `src/hooks/useSecondBrainHub.ts` owns filters, selection and browser-entry state. Name matching and branch selection live in `src/lib/wikiExplorer.ts`, covered by `scripts/wiki-explorer.test.js`.

Readable slugs, stable identities, historical links and Spanish siblings follow the [URL contract](scripts/CONTENT-URLS.md) and [authoring schemas](src/data/pages/README.md#file-names-and-public-urls). Navigation, article geometry, themes and the shared lost-robot error view are documented in [CLAUDE.md](CLAUDE.md#routes).

## Images and share cards

Masters live in `media/` and optimized images in R2. The [image workflow](scripts/README.md#article-images) owns encoding, cache versions and credentials; the [card workflow](scripts/README.md#share-cards) owns Chrome rendering, incremental uploads and the Git hook. The production build consumes their tracked manifests.

## Studio and writing packs

The [studio hub](_studio/README.md) owns capture, queues and traceability; [bank folders](_studio/_inbox/bank/README.md) separate article seeds (with additions per category), loose ideas and quotes. [Context packs](scripts/README.md#context-packs) are regenerated explicitly with `npm run context`; `npm run context:check` inspects drift without changing files. [The finder](scripts/README.md#finding-studio-pieces) searches pieces and checks bank/topic links.

## Platform and deployment

Cloudflare Pages hosts `dist/` and `functions/`, with dashboard configuration and GitHub deployment on pushes to `main`. The [validation workflow](.github/workflows/validate.yml) runs separately and does not gate Pages deployment. Required backend bindings and Worker deployment: [counters](workers/counters/README.md#deployment-and-cutover).

The backend is selected by runtime configuration; see [counters](workers/counters/README.md) for KV compatibility, Durable Objects, stored totals, admin authentication and local behavior. [SECURITY.md](SECURITY.md) owns API limits, response policies and deployment controls. Local admin requests use the authenticated production proxy configured in Vite.

## Crawler visibility

`functions/[[catchall]].ts` consumes compiled metadata to serve canonical tags, social cards, structured data and readable content to crawlers. [Generated outputs](scripts/README.md#outputs) lists the OG manifest, Wiki bodies, RSS, sitemap, LLM files and public agent profile. `public/_routes.json` controls Function invocation; `public/robots.txt` supplies crawler directives.

## Contact form (Formspree)

`/contact` posts to Formspree form `xojwnobl` from `src/views/ContactView.tsx` and redirects to `/thanks`. Submissions live in the Formspree dashboard: sign in at [formspree.io](https://formspree.io) with `contact@infraphysics.net` (password in the password manager, never in this repo), open the form, tab *Submissions*. Notification emails go to the address set in the form's *Settings*; to receive them elsewhere, add that address there and confirm Formspree's verification email.

## Roadmap

Future features under consideration:

- [ ] **LLM Conversational Assistant** — AI-powered search/Q&A over site content. MVP: Cloudflare Worker proxy to Claude Haiku API with system prompt + post summaries. Future: RAG with vector embeddings for semantic search. Includes "Ask Yago" persona mode.
- [ ] **Stripe Donations** — One-time support via Stripe Payment Link (zero backend). Button in footer or `/about`. No memberships or auth initially.
- [x] **Wiki Console graph explorer** — Shared mini/expanded force-directed map with 2D/3D views, semantic highlighting and centrality/root coloring at `/wiki`.
