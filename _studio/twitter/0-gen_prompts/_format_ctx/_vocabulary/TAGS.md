# Tags

The vocabulary for the `tags` field of every piece under `twitter/` (and `inbox/`). Lowercase, kebab-case, one concept each. Add a tag here before using it, with a word on what it covers when the name alone could mean two things; `npm run find -- --tags` shows which ones are in use and how often, so a tag that never appears can be removed and two that mean the same can be merged.

Grouped for reading only; a piece takes three to six from anywhere in the list.

**Subjects** (the wiki's roots and the tags the articles already use, lowercased, plus what Twitter adds)
- AI: `agi`, `timelines`, `scaling`, `scaling-laws`, `alignment`, `ai-safety`, `interpretability`, `evaluation`, `agents`, `mcp`, `skills`, `context-engineering`, `chain-of-thought`, `llm`, `transformers`, `attention`, `rlhf`, `sft`, `dpo`, `rl`, `training`, `dataset`, `neural-network`, `time-series`, `simulation`, `inference`, `compute`, `energy`, `robotics`
- Engineering and industry: `industrial`, `plants`, `control`, `fault-detection`, `systems-theory`, `supply-chain`, `manufacturing`, `know-how`, `hardware`, `physics`, `mathematics`, `linear-algebra`
- Software and infrastructure: `infrastructure`, `networks`, `web-dev`, `os`, `security`, `privacy`, `blockchain`, `rust`, `python`, `memory-safety`, `state-machine`, `relational-database`, `docker`, `cloudflare`, `react`, `vite`, `open-source`
- Tooling and practice: `tooling`, `claude-code`, `codex`, `vscode`, `markdown`, `documentation`, `knowledge-management`, `writing`, `essays`, `wiki`, `infraphysics` (a piece about the site itself)
- Economy and people: `economics`, `labour`, `careers`, `startups`, `healthcare`, `psychology`, `education`
- Named things: `openclaw`

**People and labs** (when the piece is about them, not merely mentioning them)
- `ilya`, `openai`, `anthropic`, `deepmind`, `xai`, `mistral`, `huggingface`

**Register of the subject** (what kind of claim it is)
- `prediction`, `contrarian`, `explainer`, `personal`, `humour`, `meta` (about Twitter or the account itself), `announcement` (a piece of the site going out)

How the list grows: a tag is added when the second piece needs it, not the first (one piece is a `--text` search away). Once a year, `npm run find -- --tags` shows what is never used and what has drifted into synonyms; those get merged here and in the files that carry them.
