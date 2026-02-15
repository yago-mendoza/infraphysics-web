---
name: create-fieldnote
description: Process raw knowledge input into well-structured fieldnotes
argument-hint: "<raw text, concepts, or notes to process>"
---

Process the user's raw input ($ARGUMENTS) into one or more well-structured fieldnotes. The input can be anything: raw notes, bullet points, a concept name, a paste from a lecture, a paragraph of ideas — any form of knowledge.

## Required reading

Before ANY work, read these files — but only the sections you need, not cover-to-cover:
- `src/data/pages/README.md` — frontmatter schemas, naming conventions, wiki-link syntax, trailing refs rules
- `src/data/pages/fieldnotes/README.md` — scripts, workflows, cascading effects

Also load the existing fieldnotes index to know what's already in the knowledge base:
- Read `src/data/fieldnotes-index.generated.json` (all addresses, names, UIDs at a glance)

## Phase 0: Analyze, decompose, and plan

Read the entire input holistically. Before doing anything, think:

1. **What knowledge units does this contain?** Each discrete concept, technique, entity, or idea that can stand alone = one note. Don't over-split (a concept + its properties = one note) or under-split (two genuinely different topics crammed together).

2. **Does any of this belong in EXISTING notes?** Search the index for concepts that already exist. If the input adds new information to an existing concept, the plan should say "enrich existing note X" — not create a duplicate.

3. **For each NEW note**, propose:
   - **address** — follow naming conventions (products capitalized, acronyms ALL CAPS, fields lowercase, techniques lowercase, proper nouns as-is). Use `//` hierarchy separator. See **Address depth philosophy** below for nesting rules.
   - **name** — the display name
   - **1-line summary** of what it will contain
   - **parent** — where it nests in the existing tree. Check if parent exists. If not, flag for stub.

4. **For each EXISTING note to enrich**, state:
   - Which note (address + uid)
   - What new bullets/content to add
   - Any new wiki-links or interactions to add

5. **Relationships**:
   - **Cross-links**: which notes (new or existing) will be `[[uid|name]]`-referenced in body text
   - **Interactions**: ONLY contrastive/surprising relationships. Every interaction needs a `::` annotation. If the relationship is just "related" or "part of the same field" — that's a cross-link, NOT an interaction
   - **One-sided trailing refs**: write each trailing ref on only ONE note. The UI crosses it automatically. Before adding, check the target note for an existing trailing ref pointing back.

6. **Dedup, collision check, and preflight** (integrated into planning, not a separate phase):
   - Run `node scripts/preflight.js "addr1" "addr2" ... --new "new1" "new2"` to get a full briefing: existing note content, trailing refs with bilateral warnings, interaction candidates, cross-ref matrix, and collision checks for new addresses
   - If a collision exists, evaluate: same concept (⟶ enrich existing) or different concept (⟶ add `distinct`)

Present the full plan. Wait for user approval. The user may:
- Approve as-is
- Reject some notes
- Rename addresses
- Merge or split proposed notes
- Add concepts you missed

Do NOT proceed until approved.

## Phase 1: Create files

For each approved new note:

1. **Generate UID**: 8-character alphanumeric (`[a-zA-Z0-9]`), random selection from `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`. Verify uniqueness against all existing filenames in `src/data/pages/fieldnotes/`. Retry on collision. (Same method as `generateUid()` in `migrate-to-uids.js` — UIDs are opaque, never derived from content.)

2. **Write `{uid}.md`** with:
   - Frontmatter: `uid`, `address`, `name`, `date` (today's date). Add `distinct` if suppressing a segment collision.
   - Body: content from the user's input. Preserve the user's voice and structure — bullets, prose, definitions, whatever fits. Don't force bullet points if the content is naturally prose.
   - Follow all **writing style rules** in [pages/README.md](src/data/pages/README.md#writing-style) (no em dashes, long arrows only, no blank line after frontmatter, no invented examples, no manual back-references).
   - Wiki-links (`[[uid|name]]`): wrap terms that reference other fieldnotes. Match broadly:
     - Literal matches (term = note name)
     - Semantic matches (text says "gradient descent methods" → link to note "SGD" or "optimizer")
     - Contextual matches (text says "the model" in an ML context → link to note "LLM" if appropriate)
     - Use `|name` as hint when matching current name. Use `|custom text` only when genuinely different.
   - Trailing refs: ONLY for contrastive/surprising insights. Every ref has `:: annotation`. Tight `---` separator (no blank lines) between body and interactions.
   - **Write each trailing ref on only ONE note.** The UI automatically crosses it to both sides. Never duplicate a trailing ref on both notes. Before adding a trailing ref, check whether the target note already has a trailing ref pointing back; if so, do not add another.

## Phase 2: Enrich existing notes

For each existing note that needs updates:

1. Read the current file
2. Add new bullets/content to the body
3. Add new `[[uid|name]]` wiki-links where appropriate
4. Add trailing refs if the new notes create contrastive interactions
5. Ensure `---` separator is present and tight if trailing refs exist

## Phase 3: Missing parents and stubs

For any address whose parent doesn't exist as a note:
1. Create a stub with a random phrase from `STUB_PHRASES` in `scripts/resolve-issues.js`
2. Stub gets its own UID, proper address, name, and today's date

## Phase 4: Hierarchy restructuring (if needed)

If creating the new notes reveals that existing notes would be better placed elsewhere:
- `node scripts/move-hierarchy.js "old" "new"` — cascading rename (root + all descendants). Always use this over manual renames when children exist.
- `node scripts/rename-address.js "old" "new"` — single address, no cascade. Only for leaf notes.
- Always dry-run first (omit `--apply`), show results, then `--apply` after user confirmation.
- After restructuring, check `distinct` entries for staleness.

## Phase 5: Build and validate

1. `npm run build` — must pass with 0 errors
2. `node scripts/check-references.js` — check for new warnings (orphans, weak parents, one-way refs)
3. `node scripts/analyze-pairs.js "A" "B"` — optionally verify specific relationships between notes if uncertain
4. Report results to user

## Rules

- **Plan first, always.** Never create notes without user approval of the plan.
- **Enrich over create.** If a concept already exists, add to it — don't make a duplicate.
- **Dedup is non-negotiable.** Check the index before proposing any new note.
- **User's content is source of truth.** Don't invent information not in the input. You may restructure, link, and organize — but not fabricate.
- **Interactions are special.** Contrastive, surprising, non-obvious connections only. "Related" is not an interaction — it's a wiki-link.
- **One-sided trailing refs.** Write each trailing ref on only ONE note. The UI crosses it automatically.
- **Flexible input.** The input might be: a single concept name (⟶ create minimal note), bullet points (⟶ structure as-is), a wall of text (⟶ decompose into multiple notes), a question (⟶ clarify before proceeding), or a mix of all.
- **Ask when unsure.** Address placement, concept boundaries, interaction significance — when in doubt, ask the user.

## Address depth philosophy

Each `//` step should be a **small conceptual jump**. Deeper nesting with short steps is always better than shallow nesting with big jumps. The leaf is the actual concept; everything above it is the path to reach it. Any node can act as a container if it groups sub-concepts. Fields, subfields, categories, families, techniques, variants: all valid nesting levels.

**Abbreviate when possible.** `L4` not `transport layer`, `crypto` not `cryptography`, `fs` not `file system`, `arch` not `architecture`. Shorter segments keep deep addresses readable.

**Examples (good depth):**
- `cybersecurity//crypto//symmetric//AES`
- `electronics//signals//analog//filter//low-pass`
- `OS//process//IPC//shared memory`
- `CPU//pipeline//hazard//branch prediction`
- `patterns//concurrency//lock-free//CAS`

**Anti-patterns (too shallow):**
- `steganography` (should nest under its field and subfamily, e.g. `cybersecurity//data hiding//steganography`)
- `TCP` (should trace the path, e.g. `networking//L4//TCP`)
- `Adam` (should nest, e.g. `ML//Training//optimization//Adam`)
