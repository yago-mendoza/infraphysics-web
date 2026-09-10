/**
 * Claude Code hook: PreToolUse on Bash
 * Intercepts git commit commands and runs type checking first.
 * Blocks the commit if tsc finds errors.
 *
 * Receives JSON on stdin with { tool_name, tool_input: { command } }
 * Exit 0 = allow, Exit 2 = block (stdout = reason shown to Claude)
 */
import { execSync } from 'node:child_process';

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const command = data.tool_input?.command || '';

    // Only intercept git commit commands
    if (!command.match(/\bgit\s+commit\b/)) {
      process.exit(0);
    }

    // Run type check
    try {
      execSync('npx tsc --noEmit', {
        stdio: 'pipe',
        cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
        timeout: 60000,
      });
      process.exit(0);
    } catch (e) {
      const stderr = [e.stdout?.toString(), e.stderr?.toString()].filter(Boolean).join('\n').slice(0, 1600) || e.message || 'Unknown error';
      process.stdout.write(
        'Type check failed — fix errors before committing:\n' + stderr
      );
      process.exit(2);
    }
  } catch {
    // If JSON parsing fails or anything unexpected, don't block
    process.exit(0);
  }
});
