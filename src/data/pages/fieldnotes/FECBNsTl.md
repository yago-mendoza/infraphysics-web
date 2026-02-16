---
uid: "FECBNsTl"
address: "Blockchain//Besu//Automation"
name: "Automation"
date: "2025-05-18"
---
- Script idempotency: always start with a cleanup section to remove previous containers and networks
- `.env` file generation: script writes node keys and RPC URLs so the frontend auto-configures
- Bash vs TypeScript: bash scripts are simpler but less portable; TS libraries abstract OS differences
- `node -e "..."` pattern: inline JS execution from bash — keeps the script self-contained and portable
- Silent failures: never redirect stderr to `/dev/null` — hides critical errors like missing npm packages

---
[[C3w8sWpi|Besu]] :: automation scripts are the glue between [[FlMHYCjo|Docker]], Besu, and the frontend application

