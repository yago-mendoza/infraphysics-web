---
address: "claude-code//dot-claude//hooks"
date: "2026-02-06"
---
Event-driven scripts that Claude Code runs automatically at lifecycle points. Written in JavaScript (or shell), they live in `.claude/hooks/` and are referenced from [[claude-code//dot-claude//settings]].

Each script receives JSON on stdin with the tool name and input. Exit codes control behavior: `0` = allow, `2` = block (stdout becomes the reason shown to Claude).

Available events:

- PreToolUse:: fires before a tool executes. Can block it. Use `matcher` to filter by tool name (e.g. `"Bash"`, `"Edit|Write"`).
- PostToolUse:: fires after a tool succeeds. Good for linting or type-checking after edits.
- Stop:: fires when Claude finishes responding. Good for summary validation.
- UserPromptSubmit:: fires when the user sends a message. Can intercept or transform.
- SessionStart / SessionEnd:: session lifecycle.

Example: a pre-commit guard that runs `npx tsc --noEmit` before any `git commit` and blocks if there are type errors. The script parses stdin JSON, checks if the command matches `/git\s+commit/`, and only then runs the check.
[[claude-code//dot-claude]]
[[claude-code//dot-claude//settings]]
