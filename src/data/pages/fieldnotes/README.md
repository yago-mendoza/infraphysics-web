# Fieldnotes Management Guide

Developer reference for managing the fieldnotes knowledge graph. This covers the operational side — creating, renaming, deleting, and auditing notes. For the **content authoring format** (frontmatter, syntax, trailing refs, wiki-links), see the [Second Brain section in the pages README](../README.md#second-brain-fieldnotes). For **build pipeline internals** (14-step compilation, cache, Shiki config), see [scripts/README.md](../../../scripts/README.md).

---

## Table of Contents

1. [Why This File Matters](#why-this-file-matters)
2. [Available Scripts](#available-scripts)
3. [Workflows](#workflows)
4. [Build-Time Validation](#build-time-validation)
5. [Error Reference](#error-reference)
6. [Cascading Effects](#cascading-effects)
7. [Edge Cases](#edge-cases)

---

## Why This File Matters

Fieldnotes form a **bidirectional graph**. Every `[[wiki-link]]` creates a relationship — in the body, in trailing refs, and in other posts that reference fieldnotes. References now use **stable UIDs** (`[[uid]]`), so renaming an address only changes ONE file's frontmatter. Deletion still breaks references across the graph. **Do not edit addresses or filenames by hand.** Use the scripts below — they handle validation and file operations correctly.

The build pipeline validates the graph on every run. If you break a reference, the build will tell you exactly what's wrong and where. The workflow is: make changes → run build → read errors → fix → repeat.

**AI assistants:** Consult this file before any fieldnotes operation. The [CLAUDE.md](../../../CLAUDE.md) automation rules reference this document.

---

## Available Scripts

All scripts live in `scripts/`. For full parameter docs, output formats, and implementation details, see **[scripts/README.md](../../../scripts/README.md)**. This section covers only the workflow essentials.

- **`rename-address.js`** — Renames a single fieldnote address. Does NOT cascade to children. **Always dry-run first** (`node scripts/rename-address.js "old" "new"`), then `--apply`.
- **`move-hierarchy.js`** — Cascading rename: moves a note and all its descendants to a new address prefix. **Always dry-run first**, then `--apply`. Use this instead of `rename-address.js` when the note has children.
- **`check-references.js`** — Deep integrity audit (orphans, weak parents, duplicate trailing refs, redundant refs, fuzzy duplicates, segment collisions). Not part of the build — run manually after bulk changes.
- **`analyze-pairs.js`** — Relationship analyzer. Answers "how are A and B connected?" via structural, trailing ref, and body mention checks. Supports fuzzy address resolution.
- **`preflight.js`** — Pre-creation briefing. Takes existing addresses (fuzzy-resolved) and dumps content, trailing refs (with bilateral warnings), interaction candidates, and cross-ref matrix. Use `--new "addr"` to collision-check proposed addresses. Run before creating or enriching notes.
- **`validate-fieldnotes.js`** — Build-time validator. Called automatically by every build. See [Build-Time Validation](#build-time-validation) below.
- **`resolve-issues.js`** — Interactive issue resolver. Called via `npm run content:fix`. Prompts to fix segment collisions and missing parents. See [Interactive Mode](#interactive-mode) below.

**Build commands** (all run the full validation pipeline):

```bash
npm run build          # compile content + production build
npm run dev            # compile content + start Vite dev server
npm run content        # compile content only
npm run content -- --force   # ignore cache, full rebuild
npm run content:fix    # compile + interactive issue resolution
```

**The build is your safety net** — run it after every change.

---

## Workflows

### Pre-creation check: segment collisions

Before creating any fieldnote, search existing addresses for the last segment of the proposed address (case-insensitive). For example, before creating `X//Y//cache`, check if `cache` already appears anywhere — even as a non-terminal segment like `CPU//cache//L1`. If the segment exists, evaluate whether the new note is the same concept or genuinely distinct. This avoids creating notes that immediately trigger build-time collision warnings and require rework.

Quick check: search `address:` lines in `src/data/pages/fieldnotes/*.md` for the segment name.

### Creating a single fieldnote

1. Run the [pre-creation check](#pre-creation-check-segment-collisions) for the proposed address
2. Create `src/data/pages/fieldnotes/{uid}.md` where `{uid}` is a unique identifier (assigned by migration script or manually generated)
3. Add frontmatter with `uid` (required), `address` (required), and `date` (required)
4. Write the body + trailing refs
5. Run `npm run build` — fix any errors
6. If the build warns about missing parents, create stub notes for them

### Creating fieldnotes in bulk

1. Run the [pre-creation check](#pre-creation-check-segment-collisions) for each proposed address
2. Create all the `.md` files
3. Run `npm run build` to validate all references at once
4. Run `node scripts/check-references.js` to catch duplicate trailing refs, orphans, and weak parents
5. Create stub notes for any missing parents
6. Review duplicate trailing refs — each connection should exist on only ONE side

### Renaming an address (simple — no children)

**Never rename by hand.** Use the script to ensure correct frontmatter updates.

1. `node scripts/rename-address.js "old" "new"` — review the dry-run output
2. `node scripts/rename-address.js "old" "new" --apply` — execute
3. `npm run build` — verify
4. Check for stale `distinct` entries referencing the old address in other notes
5. Commit the changed file (only one file is modified)

> If the note has children, **stop here** and follow "Restructuring a hierarchy" below instead.

### Restructuring a hierarchy

**Required when renaming any note that has children** (e.g. `chip` → `component//chip`). Use `move-hierarchy.js` — it cascades to all descendants automatically.

> **`//` = hierarchy separator** (parent//child). **`/` = part of a segment name** (like `I/O`). Using `/` when you mean `//` silently creates a single flat node instead of a parent-child relationship.

1. `node scripts/move-hierarchy.js "chip" "component//chip"` — dry-run, review the full plan
2. `node scripts/move-hierarchy.js "chip" "component//chip" --apply` — execute
3. `npm run build` — verify
4. `node scripts/check-references.js` — catch stale `distinct` entries
5. Commit all changed files together

<details>
<summary>Manual fallback (using rename-address.js individually)</summary>

If `move-hierarchy.js` can't be used (e.g. orphaned children without a parent note), rename each note individually:

1. **List all children first** — find every address prefixed with `oldParent//`
2. **Rename the parent**: `node scripts/rename-address.js "chip" "component//chip" --apply`
3. **Rename each child individually**: `node scripts/rename-address.js "chip//MCU" "component//chip//MCU" --apply` (one call per child)
4. `npm run build` after all renames
5. `node scripts/check-references.js`
6. Commit all changed files together

Note: With UID-based references, children's connections remain intact even if their addresses are temporarily stale — references use UIDs, not addresses.

</details>

### Deleting a fieldnote

1. Delete the `.md` file
2. Run `npm run build` — the build will ERROR on every broken `[[reference]]` to the deleted note
3. Fix each broken reference (remove it, redirect it, or replace with a different address)
4. Build again until clean
5. Stale `.json` content files in `public/fieldnotes/` are auto-cleaned by the build

### Using `supersedes` during migration

`supersedes` is a **temporary build-time redirect**, not permanent metadata:

1. Rename the note (manually or via `rename-address.js`)
2. Add `supersedes: "old address"` to the new note so stale `[[refs]]` resolve during transition
3. Run `rename-address.js --apply` to update all source references
4. Once all references are updated, **remove** `supersedes` — it has served its purpose
5. Run `npm run build` to confirm

---

## Build-Time Validation

The build runs a 7-phase integrity check automatically. Errors fail the build (exit code 1). Warnings and info are logged but allowed.

| Phase | What it catches | Severity |
|---|---|---|
| 1. Reference integrity | Broken `[[wiki-links]]` in fieldnotes and posts | **ERROR** |
| 2. Self-references | Notes linking to themselves in trailing refs | WARN |
| 3. Bare trailing refs | Trailing refs without `::` annotation | **ERROR** |
| 4. Parent hierarchy | Missing parent notes in the address tree | WARN |
| 5. Circular references | Cycles in the reference graph (opt-in, off by default) | WARN |
| 6. Segment collisions | Same concept name at different hierarchy paths (HIGH/MED/LOW tiers) | WARN |
| 7. Orphan detection | Notes with no connections to the graph | INFO |

### How to use the validation output

The terminal output after every build is your primary debugging tool. It tells you **exactly** what's broken and where:

```
ERROR  [[chip//MCU]] in "CPU" -> no block
```
→ The note at address `CPU` has a `[[chip//MCU]]` reference, but no fieldnote with address `chip//MCU` exists. Either create it or fix the reference.

```
WARN   "laptop" has no block (parent of laptop//UI +1 more)
```
→ `laptop//UI` exists but `laptop` doesn't. Create a stub note for `laptop`.

```
HIGH  segment "cache" exists at: CPU//cache (leaf), networking//cache (leaf)
```
→ Two notes share the segment name "cache" as a leaf. If they're different concepts, add `distinct: ["CPU//cache"]` to the networking note (or vice versa). If they're the same concept, merge them.

The workflow is always: **build → read errors → fix → build again**.

### Validation configuration

All flags live in `scripts/compiler.config.js` under `validation`. See **[scripts/README.md — Configuration](../../../scripts/README.md#configuration)** for the full flag table.

### Error codes

Every validation output line includes a bracketed error code for easy scanning and scripting.

| Code | Severity | Fixable? | Meaning |
|---|---|---|---|
| `BROKEN_REF` | ERROR | No | Inline `[[ref]]` to nonexistent fieldnote |
| `BROKEN_WIKILINK` | ERROR | No | `[[wiki-link]]` in post to nonexistent fieldnote |
| `SELF_REF` | WARN | No | Note trails a ref to itself |
| `BARE_TRAILING_REF` | ERROR | No | Trailing ref without `::` annotation |
| `MISSING_PARENT` | WARN | Yes | Parent address has no dedicated note |
| `CIRCULAR_REF` | WARN | No | Cycle in reference graph |
| `SEGMENT_COLLISION` | HIGH/MED/LOW | Yes | Same segment name at different hierarchy paths |
| `ALIAS_COLLISION` | HIGH | Yes | Alias collides with a segment name |
| `ALIAS_ALIAS_COLLISION` | HIGH | Yes | Same alias on multiple notes |
| `STALE_DISTINCT` | WARN | No | `distinct` entry points to deleted note |
| `ORPHAN_NOTE` | INFO | No | No incoming or outgoing references |

A legend of active codes is printed at the end of each validation run. The "Fixable?" column indicates which issues can be resolved interactively.

### Interactive mode

Run `npm run content:fix` to compile content and then interactively fix promptable issues (segment collisions and missing parents). The workflow:

1. The build runs normally — compiles content, validates, shows all issues with error codes
2. If fixable issues exist, the resolver prompts you for each one
3. After all prompts (or on quit), a summary prints: files modified, rebuild reminder, and any pending merge instructions
4. Run `npm run content` again to verify the fixes

Every prompt accepts **(q)** to quit early. Changes already written to disk are kept. Ctrl+C also quits gracefully.

**Segment collision prompt:**
```
[1/3] SEGMENT_COLLISION (HIGH)
  Segment "cache" exists at:
    1. CPU//cache  (leaf)
    2. networking//cache  (leaf)

  (d) Different concepts — add distinct to suppress
  (s) Same concept — collect merge instructions
  (k) Skip  (q) Quit
  >
```

- **d** — adds `distinct: ["CPU//cache"]` (or vice versa) to one note's frontmatter automatically
- **s** — queues the merge for the end-of-session summary (doesn't modify files yet)
- **k** — skips, the warning reappears next build

**Missing parent prompt:**
```
[2/3] MISSING_PARENT
  "LAPTOP" has no block (parent of LAPTOP//UI)

  (c) Create stub note
  (k) Skip  (q) Quit
  >
```

- **c** — creates a minimal `fieldnotes/LAPTOP.md` with just `address` and `date`
- **k** — skips

**End-of-session merge block:**

When you answer **(s)** to any collision, the resolver collects the merge instructions and prints them all together at the end in a bordered block ready to copy-paste:

```
╭──────────────────────────────────────────────────────────────────╮
│  2 pending merges — copy the block below into Claude to execute  │
╰──────────────────────────────────────────────────────────────────╯

┌────────────────────────────────────────────────────────────────────┐
│  Merge the following fieldnotes. For each group:                  │
│  1. Run the rename commands with --apply                          │
│  2. Manually combine the note bodies (keep the richer content)    │
│  3. After all merges, run npm run build to verify                 │
│                                                                   │
│  Group 1: "cache" — keep "CPU//cache"                             │
│    node scripts/rename-address.js "networking//cache" ... --apply  │
│    node scripts/rename-address.js "storage//cache" ... --apply     │
│                                                                   │
│  Group 2: "ui" — keep "IPAD//UI"                                  │
│    node scripts/rename-address.js "LAPTOP//UI" "IPAD//UI" --apply │
└────────────────────────────────────────────────────────────────────┘
```

Copy the content of the block (or the whole block) into Claude and it will execute the merges, combine note bodies, and rebuild.

Non-interactive environments (CI, piped stdin) skip prompts and print a hint to use `content:fix`.

---

## Error Reference

Every error and warning you might encounter, where it comes from, and what to do.

### Build errors (fail the build)

| Message | Cause | Fix |
|---|---|---|
| `ERROR: {file} missing 'uid' in frontmatter` | A `.md` file has no `uid` field | Add `uid: "..."` to the YAML frontmatter |
| `ERROR: {file} missing 'address' in frontmatter` | A `.md` file has no `address` field | Add `address: "..."` to the YAML frontmatter |
| `ERROR: duplicate fieldnote UID "{uid}"` | Two notes share the same UID | Change one UID to be unique |
| `ERROR  [[{uid}]] in "{address}" -> no block` | Inline `[[uid]]` points to nonexistent fieldnote | Create the missing note or fix the reference |
| `ERROR  trailing [[{uid}]] in "{address}" -> no block` | Trailing ref points to nonexistent fieldnote | Same — create or fix |
| `ERROR  [[{uid}]] in post "{id}" -> no fieldnote` | Wiki-link in a regular post (thread, project, etc.) points to nonexistent fieldnote | Create the fieldnote or remove the wiki-link from the post |

### Build warnings (logged, build continues)

| Message | Cause | Fix |
|---|---|---|
| `WARN  "{address}" trails a ref to itself` | Note references itself in trailing refs | Remove the self-referencing trailing ref |
| `WARN  "{parent}" has no block (parent of ...)` | Parent address prefix has no note | Create a stub note for the parent |
| `HIGH  segment "{seg}" exists at: ...` | Same concept name at different paths (both leaves) | Add `distinct: [...]` or rename one note |
| `MED  ...` / `LOW  ...` | Same as above, lower severity tiers | Review — often acceptable for organizational segments |
| `WARN  stale distinct: "{addr}" in "{note}"` | `distinct` entry points to a deleted note | Remove the stale entry from frontmatter |

### Build info (no action needed)

| Message | Meaning |
|---|---|
| `INFO  "{address}" has no connections (orphan)` | Note has zero incoming and outgoing refs — may be new or forgotten |
| `Redirect: "{old}" -> "{new}"` | A `supersedes` redirect is active |
| `Removed stale: {file}` | An orphaned `.json` content file was cleaned up |

### Rename script errors

| Message | Cause | Fix |
|---|---|---|
| `ERROR: No file found with address "{address}"` | No fieldnote has the old address in frontmatter | Check the address spelling |
| `ERROR: File {filename} has address "{actual}" but expected "{old}"` | File exists but frontmatter address doesn't match | Fix the frontmatter or use the correct address |
| `ERROR: Target UID collision: {uid}` | A note with the same UID already exists at the target | Choose a different target address or merge the notes |

---

## Cascading Effects

Understanding what changes propagate where prevents subtle breakage.

### Renaming an address affects:
- **The note's own file**: frontmatter `address` and `name` fields only
- **Build outputs**: the compiled `.json` file in `public/fieldnotes/` uses the UID (which doesn't change), so output filename stays the same
- **Children: NOT automatic.** If a parent address changes, children still have their old addresses. They must each be renamed (via `rename-address.js` or `move-hierarchy.js`) to reflect the new hierarchy path. However, references to children still work via their stable UIDs.
- **`distinct` entries**: any note with `distinct: ["old-address"]` becomes stale — update or remove them
- **References in other files**: NOT affected. References use stable UIDs (`[[uid]]`), not addresses, so they continue pointing to the same note regardless of address changes

### Deleting a note affects:
- **Every note that references it**: their `[[refs]]` become broken (build ERROR)
- **Every post that wiki-links to it**: their `[[wiki-links]]` become broken (build ERROR)
- **Children**: orphaned from the hierarchy (build WARN for missing parent if they reference upward)
- **The graph**: bilateral trailing ref connections disappear from both sides

### Adding a new note affects:
- **Nothing breaks** — additions are safe
- **Previously unresolved** `[[refs]]` may now resolve (links that were greyed out become clickable)
- **Parent hierarchy**: if the new note has a hierarchical address, the build checks that parents exist

### Changing trailing refs affects:
- **Bilateral display**: adding `[[B]]` to note A makes the connection appear on both A and B's pages. Write the trailing ref on **only ONE** note; the UI crosses it automatically.
- **Removing a trailing ref** removes it from both sides
- **Never duplicate** a trailing ref on both notes; `check-references.js` flags these as `DUPLICATE TRAILING REFS`

---

## Edge Cases

### `/` vs `//` in addresses

- `//` is the **hierarchy separator** (parent-child): `CPU//ALU` means "ALU under CPU"
- `/` is part of a **segment name**: `I/O` is the concept "I/O", not "I under O"
- Filenames use UIDs (`{uid}.md`), so the separator distinction doesn't affect filenames
- In slugs/IDs (if address-derived): `//` → `--`, `/` → `-` (e.g. `I/O//MMIO` → `i-o--mmio`), but primary IDs are now UIDs

### Trailing refs must be contiguous at the end

The parser reads trailing refs from the **bottom of the file upward**. Any non-ref line breaks the sequence. Body text after trailing refs will cause them to be treated as body content, not connections.

```markdown
Body text here.

[[CPU]]              ← trailing ref (connection)
[[GPU]]              ← trailing ref (connection)
Some text here.      ← this line breaks the trailing ref sequence
[[RAM]]              ← this is now a body wiki-link (mention), NOT a trailing ref
```

### Trailing ref annotations use `::`, not `|`

```markdown
[[CPU//core]] :: shares execution resources    ← correct (annotation)
[[CPU//core | custom display text]]            ← wrong context — | is for inline display text
```

`|` in trailing refs sets display text (which is stripped for connections anyway). `::` sets the annotation that appears in the UI as an "Interaction" description.

### `distinct` is bilateral

Only one of the two colliding notes needs the `distinct` entry. Adding it to both is harmless but redundant.

```yaml
# In networking//cache — suppresses collision with CPU//cache
distinct: ["CPU//cache"]
```

You do **not** also need to add `distinct: ["networking//cache"]` to the CPU//cache note.

### Filename convention uses UIDs

Filenames are `{uid}.md` (e.g. `OkJJJyxX.md`), not address-derived. The UID must be unique and stable. The `rename-address.js` script scans frontmatter to find files, not filenames, so no filename convention matching is required.

### Cache invalidation

The build uses `.content-cache.json` for incremental compilation. If something seems stale or wrong, force a full rebuild:

```bash
npm run content -- --force
```

The cache is also fully invalidated when `compiler.config.js` changes.
