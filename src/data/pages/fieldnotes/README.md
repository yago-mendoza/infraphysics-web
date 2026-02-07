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

Fieldnotes form a **bidirectional graph**. Every `[[wiki-link]]` creates a relationship — in the body, in trailing refs, and in other posts that reference fieldnotes. Renaming, deleting, or restructuring a note has cascading effects across the entire graph. **Do not edit addresses, filenames, or references by hand.** Use the scripts below — they handle all the cross-cutting updates atomically.

The build pipeline validates the graph on every run. If you break a reference, the build will tell you exactly what's wrong and where. The workflow is: make changes → run build → read errors → fix → repeat.

**AI assistants:** Consult this file before any fieldnotes operation. The [CLAUDE.md](../../../CLAUDE.md) automation rules reference this document.

---

## Available Scripts

All scripts live in `scripts/`. They are **not** part of the fieldnotes content — they are build tools that operate on it.

### `rename-address.js` — Rename a fieldnote address

Renames an address and updates every reference across the entire `src/data/pages/` tree.

```bash
# Dry-run (default) — shows what would change, writes nothing
node scripts/rename-address.js "old address" "new address"

# Apply — executes all changes
node scripts/rename-address.js "old address" "new address" --apply
```

**What it does (5 steps):**
1. Finds the source `.md` file matching `address: "old address"`
2. Updates the `address:` field in frontmatter
3. Renames the file to match the new address (filename convention: `//` → `_`, `/` → `-`, spaces → `-`)
4. Scans ALL `.md` files under `src/data/pages/` for `[[old address]]` and `[[old address | annotation]]` references → replaces with the new address
5. Reports every change: files touched, reference counts

> **The script renames ONE exact address. It does NOT cascade to children.** If `node` has children like `node//child`, renaming `node` → `X//node` will NOT touch `node//child`. The child's address, filename, and every `[[node//child]]` reference across the codebase remain unchanged — leaving them orphaned from the new parent path. Each child must be renamed in a separate script call. See [Restructuring a hierarchy](#restructuring-a-hierarchy).

**Always dry-run first.** Review the output before passing `--apply`.

**After applying:** Run `npm run build` to verify no broken references remain.

### `check-references.js` — Deep integrity audit

Six-check audit that catches issues the build validator doesn't. Run manually — not part of the build pipeline.

```bash
node scripts/check-references.js
```

| # | Check | What it finds |
|---|---|---|
| 1 | Orphans | Notes with zero incoming and zero outgoing references |
| 2 | Weak parents | Address segments (e.g. `CPU` in `CPU//ALU`) with no dedicated note |
| 3 | One-way trailing refs | A trails B, but B doesn't trail back to A |
| 4 | Redundant trailing refs | Same `[[ref]]` appears in both body text and trailing section |
| 5 | Potential duplicates | Address pairs with >80% Levenshtein similarity |
| 6 | Segment collisions | Same segment name at different hierarchy paths (HIGH/MED/LOW tiers) |

Checks 3-5 are **exclusive to this script** — the build validator does not perform them. This is the tool to run after bulk creation or major restructuring.

### `validate-fieldnotes.js` — Build-time validator

Called automatically by `build-content.js` at the end of every build. Not run standalone. See [Build-Time Validation](#build-time-validation) below.

### `build-content.js` — Content compiler

The main compiler. Relevant commands:

```bash
npm run build          # compile content + production build (runs validation)
npm run dev            # compile content + start Vite dev server (runs validation)
npm run content        # compile content only (runs validation)
npm run content -- --force   # ignore cache, full rebuild
```

Every one of these runs the full validation pipeline. **The build is your safety net** — run it after every change.

---

## Workflows

### Creating a single fieldnote

1. Create `src/data/pages/fieldnotes/{FILENAME}.md` following the [filename convention](../README.md#filename-convention-1)
2. Add frontmatter with `address` (required) and `date` (required)
3. Write the body + trailing refs
4. Run `npm run build` — fix any errors
5. If the build warns about missing parents, create stub notes for them

### Creating fieldnotes in bulk

1. Create all the `.md` files
2. Run `npm run build` to validate all references at once
3. Run `node scripts/check-references.js` to catch one-way refs, orphans, and weak parents
4. Create stub notes for any missing parents
5. Review one-way trailing refs — decide if reciprocal refs are needed

### Renaming an address (simple — no children)

**Never rename by hand.** Manually editing the address, filename, and every `[[reference]]` across dozens of files is error-prone and will break the graph.

1. `node scripts/rename-address.js "old" "new"` — review the dry-run output
2. `node scripts/rename-address.js "old" "new" --apply` — execute
3. `npm run build` — verify no broken references
4. Check for stale `distinct` entries referencing the old address in other notes
5. Commit all changed files together (the rename touches multiple files atomically)

> If the note has children, **stop here** and follow "Restructuring a hierarchy" below instead.

### Restructuring a hierarchy

**Required when renaming any note that has children** (e.g. `chip` → `component//chip`). The rename script does NOT cascade — each child must be renamed in a separate script call or they will be orphaned.

> **`//` = hierarchy separator** (parent//child). **`/` = part of a segment name** (like `I/O`). Using `/` when you mean `//` silently creates a single flat node instead of a parent-child relationship.

1. **List all children first** — find every address prefixed with `oldParent//` so you know the full scope
2. **Rename the parent**: `node scripts/rename-address.js "chip" "component//chip" --apply`
3. **Rename each child individually**: `node scripts/rename-address.js "chip//MCU" "component//chip//MCU" --apply` (one call per child — the script will NOT do this automatically)
4. `npm run build` — verify no broken references (batch build after all renames is fine)
5. `node scripts/check-references.js` — catch orphans, one-way refs, stale `distinct` entries
6. Commit all changed files together

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

The build runs a 6-phase integrity check automatically. Errors fail the build (exit code 1). Warnings and info are logged but allowed.

| Phase | What it catches | Severity |
|---|---|---|
| 1. Reference integrity | Broken `[[wiki-links]]` in fieldnotes and posts | **ERROR** |
| 2. Self-references | Notes linking to themselves in trailing refs | WARN |
| 3. Parent hierarchy | Missing parent notes in the address tree | WARN |
| 4. Circular references | Cycles in the reference graph (opt-in, off by default) | WARN |
| 5. Segment collisions | Same concept name at different hierarchy paths (HIGH/MED/LOW tiers) | WARN |
| 6. Orphan detection | Notes with no connections to the graph | INFO |

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

All flags live in `scripts/compiler.config.js` under `validation`:

| Flag | Default | Effect |
|---|---|---|
| `validateFieldnoteRefs` | `true` | ERROR if `[[ref]]` inside a fieldnote points to nonexistent address |
| `validateRegularPostWikiLinks` | `true` | ERROR if `[[wiki-ref]]` in a regular post points to nonexistent fieldnote |
| `validateParentSegments` | `true` | WARN if parent address prefix has no dedicated note |
| `detectCircularRefs` | `false` | WARN on reference cycles (off — knowledge graphs naturally have cycles) |
| `detectSegmentCollisions` | `true` | WARN when same segment name exists in different hierarchies |
| `detectOrphans` | `true` | INFO for notes with zero connections |

---

## Error Reference

Every error and warning you might encounter, where it comes from, and what to do.

### Build errors (fail the build)

| Message | Cause | Fix |
|---|---|---|
| `ERROR: {file} missing 'address' in frontmatter` | A `.md` file has no `address` field | Add `address: "..."` to the YAML frontmatter |
| `ERROR: duplicate fieldnote ID "{id}"` | Two addresses normalize to the same slug | Rename one of the two notes |
| `ERROR  [[{ref}]] in "{address}" -> no block` | Inline `[[ref]]` points to nonexistent fieldnote | Create the missing note or fix the reference |
| `ERROR  trailing [[{addr}]] in "{address}" -> no block` | Trailing ref points to nonexistent fieldnote | Same — create or fix |
| `ERROR  [[{addr}]] in post "{id}" -> no fieldnote` | Wiki-link in a regular post (thread, project, etc.) points to nonexistent fieldnote | Create the fieldnote or remove the wiki-link from the post |

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
| `ERROR: Source file not found: {filename}` | No file matches the old address | Check the address spelling and filename convention |
| `ERROR: File {filename} has address "{actual}" but expected "{old}"` | File exists but frontmatter address doesn't match | Fix the frontmatter or use the correct address |
| `ERROR: Target file already exists: {filename}` | A file for the new address already exists | Choose a different target address or merge the notes |

---

## Cascading Effects

Understanding what changes propagate where prevents subtle breakage.

### Renaming an address affects:
- **The note's own file**: frontmatter `address` + filename
- **Every file that references it**: inline `[[refs]]` and trailing `[[refs]]` across ALL `.md` files in `src/data/pages/`
- **Build outputs**: the `.json` content file in `public/fieldnotes/` gets a new name (old one is auto-cleaned)
- **Children: NOT automatic.** If a parent address changes, children still point to the old parent path. They must each be renamed in a separate `rename-address.js` call or they become orphaned. See [Restructuring a hierarchy](#restructuring-a-hierarchy).
- **`distinct` entries**: any note with `distinct: ["old-address"]` becomes stale — update or remove them
- **Other root nodes**: NOT affected. The script uses exact string matching (`[[old address]]`), so renaming `node` will not touch `node2` or `another-node`

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
- **Bilateral display**: adding `[[B]]` to note A makes the connection appear on both A and B's pages
- **Removing a trailing ref** removes it from both sides — no orphaned one-way display

---

## Edge Cases

### Address normalization collisions

Two different addresses can normalize to the same slug:
- `CPU//ALU` → `cpu--alu`
- `cpu//alu` → `cpu--alu`

The build catches this as `ERROR: duplicate fieldnote ID`. Use distinct casing or hierarchy to avoid collisions.

### `/` vs `//` in addresses

- `//` is the **hierarchy separator** (parent-child): `CPU//ALU` means "ALU under CPU"
- `/` is part of a **segment name**: `I/O` is the concept "I/O", not "I under O"
- In filenames: `//` → `_`, `/` → `-` (so `I/O//MMIO` → `I-O_MMIO.md`)
- In IDs: `//` → `--`, `/` → `-` (so `I/O//MMIO` → `i-o--mmio`)

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

### Filename convention must match address

If you create a file manually, the filename must follow the convention exactly (`//` → `_`, `/` → `-`, spaces → `-`, casing preserved). A mismatch between filename and address won't cause a build error, but the rename script relies on this convention to find files.

### Cache invalidation

The build uses `.content-cache.json` for incremental compilation. If something seems stale or wrong, force a full rebuild:

```bash
npm run content -- --force
```

The cache is also fully invalidated when `compiler.config.js` changes.
