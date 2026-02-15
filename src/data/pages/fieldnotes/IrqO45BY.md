---
uid: "IrqO45BY"
address: "Claude Code//dot-claude//skills"
name: "skills"
date: "2026-02-06"
---
- Reusable instruction packages invoked with `/name` in a session — each skill is a directory inside `.claude/skills/` containing a `SKILL.md` file
- `SKILL.md` has YAML frontmatter + markdown instructions
- Name:: the slash command name (e.g. `commit` → `/commit`)
- Description:: what it does — Claude also uses this to decide whether to auto-load the skill when relevant
- Disable-model-invocation:: if `true`, only the user can trigger it (not Claude on its own)
- Argument-hint:: shown to the user as placeholder (e.g. `"[filename]"`)
- Allowed-tools:: restrict which tools Claude can use while executing this skill
- The body is a prompt — can reference `$ARGUMENTS` and `$0`, `$1`, `$2` for positional args
- Skills are not scripts — they tell Claude what to do with existing tools, not deterministic execution
- Legacy path `.claude/commands/<name>.md` also works but lacks frontmatter features
