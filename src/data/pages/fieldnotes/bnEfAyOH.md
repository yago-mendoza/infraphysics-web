---
uid: "bnEfAyOH"
address: "Claude Code//dot-claude//settings"
name: "settings"
date: "2026-02-06"
---
- JSON files that control what Claude Code is allowed to do and what automations run
- `.claude/settings.json`:: shared (committed to git). Team-wide permissions, [[0C6FXSnp|hooks]] config.
- `.claude/settings.local.json`:: personal (gitignored). Local permission overrides, machine-specific paths. Merges on top of shared.
- Permissions:: `allow` and `deny` arrays of tool patterns (e.g. `"Bash(git commit:*)"`, `"Bash(npm run:*)"`)
- Hooks:: event-to-script mappings — each event has an array of matchers pointing to scripts in `.claude/hooks/`
- Precedence (highest wins): managed (org) → CLI args → `settings.local.json` → `settings.json` → user `~/.claude/settings.json`
