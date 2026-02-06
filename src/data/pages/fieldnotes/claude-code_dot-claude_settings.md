---
address: "claude-code//dot-claude//settings"
date: "2026-02-06"
---
JSON files that control what Claude Code is allowed to do and what automations run. Two files, same format, different scope:

- `.claude/settings.json`:: shared (committed to git). Team-wide permissions, [[claude-code//dot-claude//hooks]] config. Anyone who clones the repo gets these.
- `.claude/settings.local.json`:: personal (gitignored). Local permission overrides, machine-specific paths. Merges on top of the shared file.

Main keys:

- permissions:: `allow` and `deny` arrays of tool patterns. Format: `"Bash(git commit:*)"`, `"Bash(npm run:*)"`. Controls which tool calls Claude can execute without asking.
- hooks:: event-to-script mappings. Each event (`PreToolUse`, `PostToolUse`, etc.) has an array of matchers, each with an array of hook definitions pointing to scripts in `.claude/hooks/`.

Precedence (highest wins): managed (org) → CLI args → `settings.local.json` → `settings.json` → user `~/.claude/settings.json`.
[[claude-code//dot-claude]]
[[claude-code//dot-claude//hooks]]
