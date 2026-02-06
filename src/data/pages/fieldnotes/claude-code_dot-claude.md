---
address: "claude-code//dot-claude"
date: "2026-02-06"
---
The `.claude/` directory at the project root. Houses all Claude Code configuration that isn't pure instructions.

Five layers, each doing something different:

- CLAUDE.md:: project instructions — rules, architecture, gotchas. Lives at project root (not inside `.claude/`). Loaded into context at every session start. `CLAUDE.local.md` for personal additions (gitignored).
- [[claude-code//dot-claude//settings]]:: permissions and hooks. `.claude/settings.json` (shared, committed) sets team-wide defaults. `.claude/settings.local.json` (personal, gitignored) for local overrides.
- [[claude-code//dot-claude//hooks]]:: automation that fires on tool events. Config goes in settings, scripts live in `.claude/hooks/` — not in `scripts/`, because they consume Claude Code's JSON stdin protocol and are useless outside of it.
- [[claude-code//dot-claude//skills]]:: reusable workflows invoked as `/name`. Each skill lives at `.claude/skills/<name>/SKILL.md` with YAML frontmatter + instructions.
- memory:: persistent notes in `.claude/memory/MEMORY.md` (auto-loaded) + topic files. Survives across sessions. Claude reads and writes these to remember project-specific patterns, mistakes, and decisions.

What stays private (gitignored by convention): `settings.local.json`, `CLAUDE.local.md`, `memory/`. What can be committed: `settings.json`, `skills/`, `hooks` (part of settings).
[[claude-code]]
[[claude-code//dot-claude//settings]]
[[claude-code//dot-claude//hooks]]
[[claude-code//dot-claude//skills]]
