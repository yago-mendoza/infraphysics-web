---
address: "claude-code//dot-claude//skills"
date: "2026-02-06"
---
Reusable instruction packages invoked with `/name` in a session. Each skill is a directory inside `.claude/skills/` containing a `SKILL.md` file.

The `SKILL.md` has YAML frontmatter + markdown instructions:

- name:: the slash command name (e.g. `commit` → `/commit`).
- description:: what it does. Claude also uses this to decide whether to auto-load the skill when relevant.
- disable-model-invocation:: if `true`, only the user can trigger it (not Claude on its own).
- argument-hint:: shown to the user as placeholder (e.g. `"[filename]"`).
- allowed-tools:: restrict which tools Claude can use while executing this skill.

The body is a prompt — instructions Claude follows when the skill is triggered. Can reference `$ARGUMENTS` (what the user passed after the slash command) and `$0`, `$1`, `$2` for positional args.

Skills are not scripts. They don't execute code directly — they tell Claude _what to do_ with the tools it already has (Bash, Read, Edit, etc.). The intelligence is in Claude's interpretation, not in deterministic execution.

Legacy path `.claude/commands/<name>.md` also works but lacks frontmatter features.
[[claude-code//dot-claude]]
