---
name: commit
description: Analyze uncommitted changes and propose independent atomic commits
disable-model-invocation: true
argument-hint: "[optional: scope filter or instructions]"
---

Analyze all uncommitted changes against HEAD and propose independent atomic commits.

## Steps

1. Run `git diff --stat HEAD` and `git status` to inventory all changes
2. **Pre-commit hygiene check** — scan the **filesystem** (not just git-tracked files) for debris:
   - Run `ls -la` on the project root to catch ghost folders/files that git doesn't track
   - Empty or near-empty files (0 bytes, only whitespace, placeholder content)
   - Stray documents (READMEs, TODOs, drafts) that aren't referenced anywhere
   - Null/undefined-heavy generated files (e.g. entries with missing required fields)
   - Empty directories (especially ones with suspicious names — path-as-name from bad scripts)
   - Test/scratch files (TEST_*, tmp_*, scratch.*)
   - **Do NOT rely only on `git status`** — untracked empty dirs and ignored debris won't appear there
   - If any are found, list them and **ask the user** whether to delete, keep, or gitignore each one before proceeding
3. Read changed files to understand what each change does
4. Group changes into **independent logical units** — same feature, same concern, or same component
5. For each group, propose:
   - Exact files to stage
   - Commit message: `type(scope): concise description`
   - Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `build`
6. Present all proposed commits as a numbered list — do NOT execute yet
7. Wait for user approval (they may reorder, merge, split, or reject)
8. Execute approved commits sequentially:
   - `git add <specific files>` (never `git add .` or `-A`)
   - `git commit -m "message"` — NEVER include a Co-Authored-By trailer
9. Show `git log --oneline -n <count>` when done

## Rules

- Each commit must leave the project in a buildable state
- Never amend existing commits unless explicitly asked
- One line per commit message — no emoji, no file lists, no humor
- If two changes touch the same file but are logically independent, explain the conflict and ask how to split
- If $ARGUMENTS is provided, use it to filter scope or adjust behavior
