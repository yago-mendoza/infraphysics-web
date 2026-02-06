---
name: commit
description: Analyze uncommitted changes and propose independent atomic commits
disable-model-invocation: true
argument-hint: "[optional: scope filter or instructions]"
---

Analyze all uncommitted changes against HEAD and propose independent atomic commits.

## Steps

1. Run `git diff --stat HEAD` and `git status` to inventory all changes
2. Read changed files to understand what each change does
3. Group changes into **independent logical units** — same feature, same concern, or same component
4. For each group, propose:
   - Exact files to stage
   - Commit message: `type(scope): concise description`
   - Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `build`
5. Present all proposed commits as a numbered list — do NOT execute yet
6. Wait for user approval (they may reorder, merge, split, or reject)
7. Execute approved commits sequentially:
   - `git add <specific files>` (never `git add .` or `-A`)
   - `git commit -m "message"` — NEVER include a Co-Authored-By trailer
8. Show `git log --oneline -n <count>` when done

## Rules

- Each commit must leave the project in a buildable state
- Never amend existing commits unless explicitly asked
- One line per commit message — no emoji, no file lists, no humor
- If two changes touch the same file but are logically independent, explain the conflict and ask how to split
- If $ARGUMENTS is provided, use it to filter scope or adjust behavior
