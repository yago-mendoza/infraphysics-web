/**
 * Claude Code hook: PostToolUse on Write|Edit
 * Detects edits to fieldnote .md files and reminds Claude to build + check references.
 *
 * Exit 0 + JSON additionalContext = reminder shown to Claude.
 * Exit 0 with no output = no action.
 */
let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = (data.tool_input?.file_path || '').replace(/\\/g, '/');

    // Only trigger for fieldnotes .md files (not README)
    if (
      !filePath.includes('src/data/pages/fieldnotes/') ||
      !filePath.endsWith('.md') ||
      filePath.endsWith('README.md')
    ) {
      process.exit(0);
    }

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext:
          'FIELDNOTE MODIFIED — when all fieldnote changes are complete, run:\n' +
          '1. npm run build\n' +
          '2. node scripts/check-references.js',
      },
    }));
    process.exit(0);
  } catch {
    process.exit(0);
  }
});
