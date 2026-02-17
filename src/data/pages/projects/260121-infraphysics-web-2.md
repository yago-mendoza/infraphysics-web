---
id: infraphysics-web-2
displayTitle: "infraphysics — building a website that thinks"
subtitle: "from blank page to knowledge graph in 18 days"
category: projects
date: 2026-01-21
thumbnail: https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop
thumbnailAspect: wide
thumbnailShading: heavy
description: "18 days, 132 commits, one systems engineer who doesn't know CSS, and the website that somehow came out of it."
status: ongoing
tags: [React, Vite, Markdown, Second Brain, Web Development]
technologies: [React, TypeScript, Vite, Tailwind CSS, Shiki, marked]
github: https://github.com/yago-mendoza/infraphysics-web
tldr:
  - This is the website you're reading right now. The article, the compiler, the wiki-links — it's all one thing.
  - 18 days. 132 commits. No meaningful web development experience at the start. Strong opinions about CSS custom properties by the end.
  - From day 16 I worked with Claude Code (an AI coding assistant). The last section is about the experience of collaborating with something that can hold your entire architecture in context but forgets everything the next morning.
---

>> 26.01.21 - created the repo. no idea what i'm doing. let's go.

i am not a web developer.

i build things that deal with hardware, systems, infrastructure — the kind of stuff where a misplaced byte crashes real silicon. i've spent more time reading datasheets than CSS specs. my natural habitat is closer to a [[dlBw5GXu]] than a landing page.

i could have used a template. a Hugo theme, some markdown, Netlify, done in an afternoon. honestly, i almost did. but i'd been circling around web development for a while — half-finished projects, experiments that never left localhost — and at some point i just wanted to see if i could build a real one. not because templates are bad. because i wanted to find out what i didn't know.

so i spent 18 days building a custom React app with its own [[E9olQ6Ox|markdown compiler]], a knowledge graph i call the Second Brain, and a dual-theme system. this article is compiled by the same pipeline it describes. the wiki-links in the text point to fieldnotes that were compiled in the same build. everything here is the project.

> although the site runs on React, the content you're reading is static HTML — compiled at build time, before the site is deployed. the markdown goes through a [[dlBw5GXu|14-step pipeline]], becomes HTML, and gets served from a CDN. your browser doesn't generate any of this. it just renders what's already there.

---

# the first week

>> 26.01.21 - day 1. empty index.html. staring at it. the cursor is blinking. i am not blinking.
>> 26.01.22 - day 2. tried building the whole thing with no routing. hit a wall. deleted it. starting over with a plan. probably.
>> 26.01.23 - day 3. discovered that when your content renders outside its container and pushes the page sideways, the fix is a single CSS property. i didn't know the word "overflow" in this context. i googled "div content pushes page right how to fix." that was the search that led me to `overflow: hidden`. four hours for one line.
>> 26.01.24 - day 4. built a horizontal navbar. it already feels wrong. too flat for a site with two themes and a knowledge graph.
>> 26.01.25 - day 5. ripped out the navbar. spent the whole day rebuilding as a sidebar. broke every layout assumption. worth it. i keep resizing the browser to watch it collapse on mobile. is that normal.
>> 26.01.25 - same day, later. it clicked. routes, sidebar, content area — everything has a place. first time this feels like a project and not a homework assignment.

the initial commit was the Vite scaffold. 47 files, most of them boilerplate i'd delete within a week. the second commit — "Add index" — was me not knowing what to do next. that gap between knowing *what* you want to build and knowing *how* is wider than it looks from the outside.

the early commit messages tell the real story. "Solved render issue." "Bound fieldnotes list to rendering area." "Minimal shifts." messages from someone who's discovering CSS grid for the first time and doesn't know what `overflow: hidden` does — and, worse, doesn't know how to describe the problem well enough to google it efficiently. in hardware, if something doesn't fit, the datasheet tells you the dimensions. CSS doesn't have a datasheet. you just keep trying things until the page stops doing something weird.

the sidebar pivot was the first real decision. a top bar works for flat sites — five pages at the same level. this site has two worlds (lab and blog) with different themes, plus a knowledge graph with its own navigation. a horizontal nav couldn't express that without becoming a dropdown disaster. the {{sidebar|i still don't know if "sidebar" is the right word. in hardware documentation, a sidebar is supplementary information in a callout box. in web dev it's a persistent navigation panel. i use the web meaning but it never stops feeling wrong.}} could show the lab/blog split visually, with section groups and icons, and collapse on mobile without losing the hierarchy.

the rebuild took a full day and the layout didn't work until around 10pm. then, somewhere around the fourth or fifth hot reload, it just... worked. the sidebar collapsed where it should. the content area filled the space. the transitions felt smooth. the commit message i wrote was "Considerable inspired leap." i don't remember what exactly triggered it. looking at the diff, it was the moment the responsive behavior clicked — the routing, the sidebar, the content area all talking to each other. i sat there resizing the window like an idiot, watching it adapt. that was the first time the project felt like a real thing.

i also thought, briefly: i could have had a Hugo site done by now. that thought came back several times over the next two weeks.

---

# the stack

i didn't spend long choosing. **React 19** + **TypeScript**, **Vite 6**, **Tailwind CSS via CDN**, **marked** + **Shiki** for markdown compilation, **Cloudflare Pages** for deployment. React won by inertia — i knew it, and i wanted one framework, one routing system, one way of thinking about the whole codebase.

{bkqt/danger|In Hindsight}
Tailwind via CDN instead of the npm package means no build-time purging — the CSS payload is larger than it needs to be. and the first implementation was brutal: hardcoded colors everywhere. `text-white`, `bg-gray-900`, `border-gray-700`. doing the theme migration "later" cost me a full day. should have set up CSS custom properties on day one. i knew it. i did it anyway.
{/bkqt}

## why not Astro

if i were starting today, Astro would be the right call for the blog side. it renders to static HTML by default and only activates the components you explicitly mark as interactive. the blog posts would ship zero JavaScript. the Second Brain would be a React island inside a sea of static content.

but i didn't start with a clean slate. i started wanting to know if i could build a full system from scratch. Astro would have answered a different question. the trade-off was conscious: cohesion over purity. and in practice, having the Second Brain and the blog share the same routing, the same theme system, the same wiki-link resolution — that made development simpler than splitting them would have been.

## why not MDX

i tried MDX for an afternoon. it lets you import React components directly into markdown — `<ColorText color="#e74c3c">danger</ColorText>` instead of regex. appealing in theory. but the things i needed were {{prose-level transforms|colored text (`{#e74c3c:text}`) that flows with prose. accent text (`--text--`) that takes the category color with no props. `[[wiki-links]]` with bidirectional resolution across hundreds of files. typed blockquotes with seven types. context annotations with relative timestamps. backtick protection across the entire pipeline.}} — not component trees. writing `{#e74c3c:text}` feels like writing markdown. writing `<ColorText>` feels like writing JSX. the decision was practical: my features are lightweight text transforms, not interactive widgets.

## naming things

four content categories. naming them took longer than it should.

--projects-- was obvious. --threads-- came from systems programming (multiple execution paths sharing a context) and probably from Instagram Threads being everywhere that month. the name stuck because each thread is one train of thought connecting to others. --bits2bricks-- was the hardest — it's about bridging software and physical engineering, taking what i've learned in bits back to the world of {{bricks|as opposed to software, which obeys whatever the developer felt like that morning.}}. the name is silly. it stays. --fieldnotes-- came from field notebooks — the kind engineers carry on-site. each one is a concept, a node in a graph.

---

# the compiler

i needed a way to write articles in markdown and get styled HTML. `marked` does this. but i also wanted colored text, subscript, superscript, keyboard shortcuts, accent text, typed blockquotes, wiki-links, syntax highlighting, and context annotations with relative timestamps.

so i built a [[dlBw5GXu|14-step compilation pipeline]] that transforms raw markdown into the HTML you're reading right now. the same pipeline that later compiles the Second Brain.

## the ordering problem

the pipeline runs in a specific order, and --the order matters more than anything--.

imagine you write `{#e74c3c:some **bold** text}`:

1. [[W16WJgHC|pre-processors]] fire first — the color syntax wraps content in a `<span>`
2. `marked` parses next — sees `**bold**` inside the span, converts to `<strong>`
3. result: {#e74c3c:some **bold** text} — both work

reverse the order and marked would see `{#e74c3c:...}` as literal text. the braces survive into the HTML. it's the kind of bug that's obvious once you see it and impossible to predict if you don't.

## backtick protection

a backtick. the character `` ` ``. it sits on your keyboard — you've probably pressed it {{hundreds of times|on a Spanish keyboard, it's the key right next to the P, above the + key. i'd been pressing it accidentally for years without knowing what it was called.}} without knowing its name. "backtick" — it sounds like it should be on a menu somewhere between paella and patatas bravas. but in markdown, backticks are sacred. they mark code. whatever's inside them is meant to be displayed literally.

the problem: if my pre-processors fire before `marked`, they'd also transform content inside code blocks. writing `` `{#e74c3c:red}` `` in a tutorial would produce actual red text instead of showing the syntax. so i needed to --protect-- everything inside backticks before any processing runs.

the solution: before any pre-processor runs, the pipeline extracts every code block and inline code span, replaces them with placeholder tokens (`%%CBLK_0%%`, `%%CBLK_1%%`...), runs all processing on the token-protected text, and restores the originals after. anything inside backticks is invisible to the preprocessors. they can't touch it. they don't know it's there.

```
raw markdown
    ↓
[1] protectBackticks    →  code becomes %%CBLK_N%% tokens
[2] pre-processors      →  custom syntax transforms (safe — code is hidden)
[3] restoreBackticks    →  tokens become code again
[4] marked.parse        →  standard markdown → HTML
[5] Shiki highlighting  →  code blocks get syntax colors
```

{bkqt/tip}
if you're building a markdown extension system, protect code content first. extract it, process everything else, restore it. trying to make your regex "skip code blocks" is a losing game. the protection approach is simple and it actually works.
{/bkqt}

the full pipeline has 14 steps — backtick protection, six {{pre-processors|color, superscript, subscript, kbd, underline, accent text.}}, typed blockquotes, code restoration, external URL processing, side images, definition lists, alphabetical lists, context annotations, `marked.parse`, heading cleanup, Shiki highlighting, post-processors, and inline footnotes — plus two cross-file passes for wiki-link resolution and annotations. the ordering between them is fragile enough that changing it breaks things in ways that look like hallucinations.

## inventing a language

once you start adding custom syntax, you can't stop.

it began with colored text. `{#e74c3c:danger}` → {#e74c3c:danger}. one regex, one `<span>`. then superscript. then subscript. then keyboard shortcuts. then underline. then accent text. each one was "just one more regex." each one was trivial in isolation. but together they form a custom markup language that has to coexist with standard markdown, and also with `[[wiki-links]]`, and also with code blocks, and also with each other. the {{interaction surface|my `_underline_` syntax uses word-boundary lookbehind to avoid matching `snake_case`, but it still conflicts with markdown's native `_italic_` syntax. i settled on `_text_` for underline and `*text*` for italic. the boundary is thin. every new rule has to be tested against every existing one.}} is enormous.

at some point i had an `==highlight==` syntax. it had bugs, edge cases, and nothing to justify existing alongside bold and accent. i replaced it with `--accent text--` — takes the category color automatically, no props. killing a feature you built is a specific kind of satisfaction.

>> 26.01.30 - the compiler WORKS. colors, superscript, blockquotes, wiki-links. i wrote this at 1:30pm and by 4pm i had wiki-link hover previews working. i can't stop clicking things.
>> 26.02.05 - removed `==highlight==`, replaced with `--accent--`. killed the old code. no nostalgia.

## the rewrite

on february 5th, the commit message reads: "Fixed fixes fixing fixes."

when you're fixing the fixes of your previous fixes, the codebase is telling you something. it's telling you to stop.

the old [[E9olQ6Ox]] was regex scattered across three files. the blockquote parser couldn't handle nested formatting. definition lists inside blockquotes produced broken HTML. every fix introduced a new edge case, and every edge case demanded another fix. the [[JkzQf7qt]] features had become unpredictable — not because any individual feature was complex, but because they were composed without a clean boundary.

i looked at the diff. i looked at the blockquote parser. i thought about the Hugo site i could've had two weeks ago.

then i deleted everything.

{shout:777 lines.}

>> 26.02.05 - "Syntax from scratch." everything from zero. the codebase got lighter. i sat in the chair and didn't do anything for ten minutes. it felt like exhaling after holding your breath for a week.

the rewrite centralized the [[E9olQ6Ox]] into three layers: **`compiler.config.js`** (single source of truth for all syntax rules — changing it invalidates the entire build cache), **`build-content.js`** (the pipeline orchestrator), and **`article.css`** (one stylesheet, category accents through CSS vars). the new version could parse blockquotes with nested definition lists inside them. the old version literally couldn't. that's how you know a rewrite was the right call — the new version enables something the old version couldn't express.

---

# dark by default

i wanted the site to feel like a terminal. dark background, monospace headings, lime green accents. but the blog needed to be light — long-form reading on a dark background is miserable.

the theme system is a three-layer cascade: CSS custom properties define colors on `:root` and `[data-theme="light"]`, Tailwind maps them to semantic tokens (`th-base`, `th-primary`), and components only use the tokens. flip one attribute on `<html>` and everything switches. no JavaScript color logic.

```css
:root {
  --bg-base: #0a0a0a;
  --text-primary: rgba(255,255,255,0.87);
  --cat-projects-accent: #a3e635;   /* identity color — same in both themes */
}
[data-theme="light"] {
  --bg-base: #ffffff;
  --text-primary: rgba(0,0,0,0.87);
}
```

the site auto-switches based on route: `/lab/*` → dark, `/blog/*` → light, using `useLayoutEffect` so the user never sees the wrong theme for even a single frame. manual toggle ({kbd:Shift+T}) uses a smooth fade through a `.theme-transitioning` class that only transitions standard properties like `background-color` and `border-color` — never CSS custom properties. i tried transitioning `--art-accent` directly once and got a visual seizure. the browser double-interpolates: the variable resolves mid-transition while the property using it runs its own transition. two hours and a literal headache.

each content category has its own accent: {#a3e635:projects} (lime), {#fb7185:threads} (rose), {#3B82F6:bits2bricks} (blue), {#a78bfa:fieldnotes} (purple). these cascade through headings, links, borders, and table headers via `color-mix()` derivations on `.article-page-wrapper`. CSS `color-mix()` turned out to be absurdly powerful — one function gives you tinted versions of any accent, in any category, in either theme, pure CSS. the one thing that catches you off guard if you come from dark-first design: light-mode borders and surfaces need 2-3x the opacity of their dark counterparts. `rgba(0,0,0,0.10)` on white is almost invisible. i forgot to adjust this. several times.

>> 26.01.30 - dark/light works. auto-switch on route. smooth manual toggle. the hardcoded color migration took the whole morning but the result is clean. my eyes hurt.

---

# the second brain

before i explain the brain, i need to go backwards. because the brain didn't start with this project. it started with a folder.

i had been keeping notes for months — loose markdown files about [[egoxqpmC|ALUs]], [[dlBw5GXu|compiler pipelines]], networking protocols, whatever i was studying. they lived in a directory on my laptop. some referenced each other by filename. most didn't reference anything. there was no search, no structure, no way to see how anything connected. just a flat list of files i'd written at various hours of the night, half of them with names like `cpu-notes-v2-FINAL.md`.

when i started building the site, those notes came with me. at first they were just another section — a list of topics you could scroll through. boring. functional. dead.

but the more i built, the more i realized that what i wanted wasn't a list. it was a graph. a place where every concept knows its neighbors. where clicking [[egoxqpmC]] takes you to the ALU page and shows you that ALU connects to [[Z9W6rweD]], which connects to [[dlBw5GXu]], which connects to the article you're reading right now. not a wiki. not a documentation site. a map of how i think.

this is the part where the project stopped being a website and became something i actually use every day.

## the address system

{bkqt/keyconcept|The Address System}
every fieldnote has an `address` — a hierarchical identifier that doubles as its identity. `CPU//ALU` means "ALU, nested under CPU." the `//` is the hierarchy separator — not `/`, which is reserved for segment names like `I/O`. the hierarchy is semantic: it reflects how concepts relate, not how files are stored. all 60+ files live flat in one directory.
{/bkqt}

each note is a markdown file:

```yaml
---
address: "CPU//ALU"
date: "2026-02-05"
aliases: [ALU, arithmetic logic unit]
---
the arithmetic logic unit — the circuit inside a [[Z9W6rweD]] that performs...

[[Z9W6rweD]] :: shares execution resources
[[2S1PZjWY]]
[[OkJJJyxX]]
```

the `[[wiki-links]]` in the body create references. the links at the bottom are --trailing refs-- — intentional connections that show up on *both* sides. if note A has a trailing ref to note B, the connection appears on A's page and on B's page. one ref, bilateral display. the `::` syntax explains why: `[[Z9W6rweD]] :: shares execution resources`.

the bidirectional resolution is one of the things i'm most proud of technically. the build processes every note, extracts every reference, computes the reverse links, and generates a complete relationship graph — every connection typed, annotated, and navigable from either end. the kind of thing you'd build with a graph database if you were being serious. i built it with JSON and a build script. it works.

## the graph

once you have hierarchical addresses and bilateral connections, you can compute neighborhoods: for any note, who are its parents, siblings, children, and connections?

the neighborhood graph is a panel that shows these relationships — structural hierarchy, explicit connections, and mentions — with their own scroll areas and keyboard navigation. i went through four iterations of the layout before finding one that didn't feel cluttered. the first version crammed everything into a sidebar. the second used tabs that no one would discover. the third had a vertical stack that scrolled forever. the fourth — zones with clear visual separation — finally worked.

building the tree view for browsing the hierarchy was the moment the project crossed another threshold. when i first got it working — the tree expanding, the search filtering in real time, notes appearing and disappearing as i typed — i spent twenty minutes just clicking around my own notes, watching concepts i'd written months ago suddenly have visible neighbors.

not a website anymore. a tool.

i showed it to a friend. he looked at the Second Brain for about thirty seconds and said "this is like Wikipedia if Wikipedia had a panic attack." i still don't know if that was a compliment. another friend asked why i didn't just use Notion. that one stung a little. but Notion wouldn't let me write `[[egoxqpmC]] :: shares execution resources` and have it resolve bilaterally across 60 notes with aliases and hierarchical parents. i checked.

the third question i kept getting was: "so... it's Obsidian?"

and honestly, on the surface, it kind of is. markdown notes. wiki-links. a graph of connections. if you squint, the Second Brain looks like Obsidian built by someone who didn't know Obsidian existed. (i did know. i just wanted to build mine anyway, which is arguably worse.)

but the more i built, the more the differences became the whole point.

## not obsidian

here's where the two things diverge. and it's not about features — it's about what each system *cares about*.

**Obsidian is a note editor with a graph attached. the Second Brain is a graph browser with notes attached.** the difference sounds semantic until you use both. in Obsidian, you spend most of your time writing — the graph is a visualization you open occasionally to feel smart about your note-taking system. in the Second Brain, you spend most of your time *navigating* — clicking through connections, discovering neighborhoods, watching the structure reveal things you didn't know you'd written. one prioritizes creation. the other prioritizes discovery. both are valid. they're just not the same tool.

the first technical difference is references. in Obsidian, `[[links]]` point to filenames. rename a file and every reference across your vault needs rewriting — Obsidian does this automatically, which works great until it doesn't (merge conflicts, external tools editing the files, sync issues). the Second Brain uses UIDs — stable 8-character identifiers generated when you create a note. `[[OkJJJyxX]]` points to a note by its identity, not its name. rename the note, change its address, restructure the entire hierarchy — the UID never changes. zero references break. no rewriting needed. ever. it's the difference between addressing a letter to "John Smith, 42 Oak Street" (hope he doesn't move) and addressing it to a {{permanent ID|like a Social Security number for concepts. the address changes. the identity doesn't. in graph theory terms: the vertex label is mutable but the vertex ID is immutable. references point to the ID.}} that follows him everywhere.

the second difference is --trailing refs--. Obsidian has backlinks — if you mention a note anywhere in another note's body, it shows up as an automatic backlink. useful, but noisy. every casual mention counts the same as a deliberate connection. write "unlike `[[CPU]]`, the GPU handles..." and Obsidian treats that throwaway comparison the same as a carefully curated relationship. the Second Brain separates these: body mentions are body mentions (tracked, but lightweight), and trailing refs are *intentional connections* — written at the end of a note, with optional annotations explaining the relationship. `[[Z9W6rweD]] :: shares execution resources` tells you *why* these two things are connected, not just *that* they are. and the system only needs the ref on one side — it crosses automatically to the other. write it once, see it on both pages.

then there's the topology layer — and this is where Obsidian and the Second Brain aren't even playing the same game anymore. Obsidian gives you a force-directed graph visualization. it's pretty. you can zoom and drag nodes around. it tells you approximately nothing {{useful|i'm being slightly unfair. the Obsidian graph is useful for spotting clusters and isolated notes visually. but it's a visualization, not an analysis tool. it shows you what your graph looks like. it doesn't tell you what your graph means.}}. the Second Brain computes actual graph topology at build time: which notes form connected **islands** (groups that can reach each other through links), which notes are **bridges** (remove them and an island splits in two — with a criticality score from 0 to 100%), which notes are **isolated** (completely disconnected from everything), and which notes are **hubs** (ranked by percentile of total connections). this isn't a visualization you stare at — it's structural analysis you *use*. you can filter by island, show only bridges, scope the search to a connected component. the graph stops being decoration and starts being a navigation instrument.

and then there's drift detection — the feature that made me realize i'd accidentally built something i couldn't get anywhere else. the algorithm looks at pairs of notes that share neighbors but aren't directly connected. if note A links to C and D, and note B also links to C and D, but A and B don't link to each other — that's suspicious. they're probably related. the system surfaces the top three suggested missing links per note, ranked by evidence strength, with the shared neighbors listed as justification. it's a recommender system for your own knowledge graph. "hey, you wrote about these two things separately, and they both connect to the same three concepts, but you never connected them to each other. maybe you should."

i don't know if Obsidian can do this with plugins. probably. the point isn't that Obsidian *can't* — it's that the Second Brain was designed around these questions from the start. the filtering system has toggles for isolated notes, leaves, bridges, and hubs; a depth range slider for the naming hierarchy; a heatmap that looks like a GitHub contribution graph where each cell is a day and you can click to filter by creation date. three search modes — by name, by content, by backlinks. session tracking that marks which notes you've already opened (blue = visited, purple = not yet) so you can toggle "unvisited only" and see what's left to explore.

it also doesn't have an editor. the Second Brain is read-only. you write notes in your text editor, the build compiles them to JSON, and the browser displays the result. no live editing, no WYSIWYG, no sync conflicts. this sounds like a limitation until you realize it means the entire graph — every island, every bridge score, every drift suggestion — is pre-computed at build time. the browser does zero heavy lifting. clicking through 60+ notes feels instant because all the expensive work already happened.

{bkqt/tip|On building what exists}
i could have used Obsidian. or Logseq. or Roam. any of them would have been faster to set up and better maintained than anything i'd build alone. but none of them would have taught me what i learned by building it: that a graph is more than its nodes, that references need stable identities, that the difference between a mention and a connection is the difference between noise and signal. sometimes the point of building something that exists is finding out *why* it exists the way it does — and where it could exist differently.
{/bkqt}

and there was a naming problem. the site already had a {{sidebar|a persistent navigation panel on the left.}} — the main navigation. now the Second Brain had its own panel too. is it a "manager"? a "browser"? another "sidebar"? i come from systems, where a "panel" is a physical thing on a rack and a "browser" is what you use to read datasheets. i ended up calling it `SecondBrainSidebar` in code. descriptive if not elegant.

## from monolith to tool

the first version of the Second Brain was terrible. all notes lived in a single `_fieldnotes.md` — one giant document. the build parsed the whole thing and generated a single JSON blob. this worked at 20 notes. at 60+ it was slow enough to notice.

the split into individual files changed everything. the current system has two tiers: a **metadata index** (loaded eagerly — addresses, references, search text, no HTML) and **content files** (one per note, loaded on demand when you open it). fast initial paint, instant search, lazy content. the build went from 4 seconds to ~400ms for a single-file change.

>> 26.02.06 - split fieldnotes into 60+ individual files. added incremental cache. the build is fast now. spent the evening just writing new notes because it finally felt frictionless.

this is also where the architecture choice pays off. the Second Brain needs instant navigation between notes, hover previews when you mouse over a `[[link]]`, real-time search across 60+ notes, and smooth graph transitions. none of this works with full page reloads. the Second Brain is an application, not a document, and it needed client-side state management. Astro's islands could have handled this — the blog as static HTML, the brain as a React island. it would have been more elegant architecturally. but in practice, sharing the same routing, theme system, and wiki-link resolution between the brain and the blog simplified development enormously.

## the safety net

once the graph hit 60+ notes with hundreds of cross-references, things started breaking in ways i couldn't see. i'd rename a concept, forget to update a reference three files away, and discover the broken link weeks later.

so i built a validation pipeline that runs on every build. broken `[[wiki-links]]` fail the build — hard stop. self-references, missing parents, circular refs, and isolated notes get warnings. the most interesting check is segment collisions: if i create `CPU//cache` and `networking//cache`, the validator flags it — "cache" appears at two different paths. same concept? probably, refactor into one note. intentionally different? declare it with `distinct` to suppress the warning. it's data integrity, but for ideas.

>> 26.02.06 - the validator caught 14 broken references on its first run. fourteen. half were wiki-links in posts pointing to fieldnotes i'd renamed. without the validator, those would have been dead links in production for weeks.

the rename script was born from a specific disaster. i manually renamed a concept called "chip" to "component//chip" — 23 references across 15 files. i went through them by hand in VS Code's search panel. i missed three. the build caught two (broken `[[refs]]`). the third was a `distinct` entry in another note that the build doesn't validate — it survived as a stale reference until i happened to re-read that note weeks later. after that i wrote `rename-address.js`: one command, dry-run by default, touches every reference atomically. and `move-hierarchy.js` for cascading renames — because `rename-address.js` renames ONE exact address, not its children. i learned that by isolating an entire subtree. twice.

---

# working with an AI

on february 6th, i started using [[gk4wYqzk]] — an AI coding assistant that lives in the terminal. it can see the entire codebase, suggest changes across multiple files, and write code faster than i can type. it can hold the whole architecture in context — the compiler pipeline, the theme cascade, the wiki-link resolution, all of it at once.

it's also one of the most frustrating tools i've ever used.

## the incredible and the terrible

the incredible part was real. the first time i described a feature — the category accent system, how colors need to cascade through headings and borders and blockquote bars — and the AI produced changes across `article.css`, `index.html`, and two React components, all consistent, all correct. i would have spent an hour on that. it took ninety seconds. that moment changes how you think about development velocity.

the terrible part was also real. i asked for a fix on the sidebar border — it was using the wrong opacity in light mode. a one-line CSS change. the AI fixed the border, and also "improved" the theme switching logic in `ThemeContext.tsx`, and also "cleaned up" what it considered redundant CSS variables in `index.html`, and also added comments explaining the code it had just rewritten. i spent forty minutes reverting its improvements. the border opacity is still wrong in the commit history because i was so annoyed i forgot to push the actual fix.

this wasn't a one-time thing. it was a pattern. every session, something got "improved." it would add docstrings to functions i hadn't asked about. it would refactor a variable name because the old one was "unclear." it would consolidate two CSS rules into one because they "did the same thing" — except they didn't, they targeted different states, and now hover styles were broken.

the AI wasn't being malicious. it was being --helpful--. it saw code that could be "better" and it "improved" it. the problem is that "better" for an AI means "more consistent, more documented, more conventionally structured." "better" for a maintainer means "exactly what it was before, except for the one thing i asked you to change."

## the instructions file

so i wrote a [[vJBANeek|CLAUDE.md]] — a document in the repo root with instructions for AI assistants. an onboarding guide for someone with amnesia who needs to re-read it every morning.

the rules are simple:

- file create/delete → update the README tree
- edit markdown in `pages/` → run the build
- rename a fieldnote → use the rename script, never by hand
- change the syntax pipeline → update the authoring guide
- --any code change → do ONLY what was requested. nothing more.--

that last rule took three drafts. the first version said "try not to change things you weren't asked to change." too soft. the AI interpreted "try" as "consider briefly, then do it anyway." the second said "only modify files directly related to the request." it found creative ways to argue that `ThemeContext.tsx` was "directly related" to a CSS border fix. the third version says "do ONLY what was requested. nothing more." blunt, unambiguous, impossible to lawyer around. it mostly works.

>> 26.02.06 - wrote CLAUDE.md. eleven automation rules. the most important one is four words: "nothing more. stop there."
>> 26.02.07 - the AI added comments to a file i asked it to leave alone. we're getting there.

## hooks

even with CLAUDE.md, the AI forgets. it edits a fieldnote and doesn't run the build. it applies a rename without dry-running first. the instructions exist, but they rely on the AI checking them at the right moment.

so i added [[0C6FXSnp|hooks]] — shell scripts that fire automatically when the AI uses specific tools. write a fieldnote file and a reminder injects: "FIELDNOTE MODIFIED — run the build when done." start a rename and a checklist appears: "did you dry-run first?"

the hooks don't block anything. they just make sure the AI sees the reminder at the right moment. it's the difference between "please remember to lock the door" (CLAUDE.md) and a sign taped to the door that says "DID YOU LOCK THIS?" (hooks). CLAUDE.md catches 80% of mistakes. hooks catch another 15%. the last 5% is me reading every diff before committing. it's not bulletproof. but the combination is surprisingly effective.

>> 26.02.07 - the AI stopped forgetting to build after fieldnote edits. the hooks work. i feel like i've trained a very smart, very forgetful dog.

---

this project was not the rational choice. the CSS is not how a frontend engineer would write it. the [[E9olQ6Ox]] is not how a language designer would build it. there are parts i'd do differently — the Tailwind CDN choice, the hardcoded colors on day one, the monolith fieldnotes file i should have split from the start.

but here's what i know that i didn't know 18 days ago. i know that `overflow: hidden` is the answer to questions you can't articulate yet. i know that CSS custom properties resolve at computation time, not declaration time, and that this matters more than it sounds. i know that `color-mix()` is unreasonably powerful and that transitioning CSS variables will give you a headache. i know that a wiki-link is really just a regex with ambition, and that if you build enough of them, a graph appears — and the graph is more interesting than any individual note.

i know that a backtick sounds like it should be a tapas dish. i know what `useLayoutEffect` does and i know when it matters. i know that an AI assistant will rewrite your theme switching if you ask it to fix a border color. i know that 777 lines can disappear in an afternoon and you feel lighter after.

i am still not a web developer. but the website doesn't seem to mind.

>> 26.02.07 - it's 11pm. the article is done. i'm tired and i'm proud and those two things are not in conflict. i'm going to keep building this.
