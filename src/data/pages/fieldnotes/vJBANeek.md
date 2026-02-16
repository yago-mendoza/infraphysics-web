---
uid: "vJBANeek"
address: "Claude Code//dot-claude"
name: "dot-claude"
date: "2026-02-06"
---
- The `.claude/` directory at the project root — houses all Claude Code configuration that isn't pure instructions
- CLAUDE.md:: project instructions — rules, architecture, gotchas. Lives at project root (not inside `.claude/`). Loaded into context at every session start. `CLAUDE.local.md` for personal additions (gitignored).
- [[bnEfAyOH|settings]]: permissions and hooks. `.claude/settings.json` (shared, committed) sets team-wide defaults. `.claude/settings.local.json` (personal, gitignored) for local overrides.
- [[0C6FXSnp|hooks]]: automation that fires on tool events. Config goes in settings, scripts live in `.claude/hooks/` — not in `scripts/`, because they consume Claude Code's JSON stdin protocol and are useless outside of it.
- [[IrqO45BY|skills]]: reusable workflows invoked as `/name`. Each skill lives at `.claude/skills/<name>/SKILL.md` with YAML frontmatter + instructions.
- Memory:: persistent notes in `.claude/memory/MEMORY.md` (auto-loaded) + topic files. Survives across sessions. Claude reads and writes these to remember project-specific patterns, mistakes, and decisions.
- Private (gitignored): `settings.local.json`, `CLAUDE.local.md`, `memory/`. Committable: `settings.json`, `skills/`, `hooks` (part of settings).
