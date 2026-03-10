---
uid: "bnEfAyOH"
address: "Claude Code//.claude//settings"
name: "Settings"
date: "2026-02-06"
---
>> 26.03.10 - changed permissions to allow grep, sudo, apt, and background agents without prompting. the idea is simple: the more you let claude run autonomously, the fewer context switches you eat. you can alt+tab between terminals, sure, but once you have half a dozen projects open the cognitive overhead of approving every bash command stops being caution and starts being drag. the productivity scaling only kicks in when the agent can actually move without you babysitting every step. Hole in the sun.

- JSON files that control what Claude Code is allowed to do and what automations run.
- `.claude/settings.json`:: shared (committed to git). Team-wide permissions, [[0C6FXSnp|hooks]] config.
- `.claude/settings.local.json`:: personal (gitignored). Local permission overrides, machine-specific paths. Merges on top of shared.
- Permissions:: `allow` and `deny` arrays of tool patterns (e.g. `"Bash(git commit:*)"`, `"Bash(npm run:*)"`)
- Hooks:: event-to-script mappings — each event has an array of matchers pointing to scripts in `.claude/hooks/`.
- Precedence (highest wins): managed (org) → CLI args → `settings.local.json` → `settings.json` → user `~/.claude/settings.json`.
