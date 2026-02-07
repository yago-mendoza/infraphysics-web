/**
 * Claude Code hook: PreToolUse on Bash
 * Detects --apply on rename-address.js or move-hierarchy.js and injects a reminder.
 * Does NOT block — allows the command but ensures Claude sees the checklist.
 *
 * Exit 0 + JSON permissionDecision "allow" + additionalContext = allow with warning.
 * Exit 0 with no output = no action.
 */
let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const command = data.tool_input?.command || '';

    // Only trigger for fieldnote scripts with --apply
    if (
      !/\b(rename-address|move-hierarchy)\.js\b/.test(command) ||
      !command.includes('--apply')
    ) {
      process.exit(0);
    }

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'allow',
        permissionDecisionReason: 'Fieldnote script with --apply detected',
        additionalContext:
          'FIELDNOTE APPLY — verify before proceeding:\n' +
          '- Did you dry-run this script first and review the output?\n' +
          '- After applying: npm run build + node scripts/check-references.js',
      },
    }));
    process.exit(0);
  } catch {
    process.exit(0);
  }
});
