---
uid: "0C6FXSnp"
address: "Claude Code//.claude//hooks"
name: "Hooks"
date: "2026-02-06"
---
- Event-driven scripts that Claude Code runs automatically at lifecycle points — written in JavaScript (or shell), live in `.claude/hooks/`.
- Referenced from [[bnEfAyOH|settings]]
- Each script receives JSON on stdin with the tool name and input.
- Exit codes control behavior — `0` = allow, `2` = block (stdout becomes the reason shown to Claude)
- PreToolUse:: Fires before a tool executes. Can block it. Use `matcher` to filter by tool name.
- PostToolUse:: Fires after a tool succeeds. Good for linting or type-checking after edits.
- Stop:: Fires when Claude finishes responding. Good for summary validation.
- UserPromptSubmit:: Fires when the user sends a message. Can intercept or transform.
- SessionStart / SessionEnd:: Session lifecycle.
