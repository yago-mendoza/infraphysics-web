---
uid: "Nda95Rti"
address: "Cloud//Cloudflare//Wrangler//.wrangler"
name: ".wrangler"
date: "2026-03-14"
---
Hidden directory that [[Nx9sGt5L|Wrangler]] creates in the project root. Contains the local state of all Cloudflare services: the "local cloud" on your machine.
- The [[Wn4pCx7H|D1]] SQLite files live here. When you write to D1 locally (`--local`), the rows go into `.wrangler/state/v3/d1/.../*.sqlite`. That IS the local database: no separate server, no daemon, just a file.
- `wrangler d1 export --local` reads from these SQLite files and generates a `dump.sql`, the transport file you can then execute against the remote DB. The data flows: `.wrangler/` → `dump.sql` → remote D1.
- [[Kv8nTm5J|Workers KV]] local data, [[Zr6kDj2F|R2]] local buckets, all simulated here too. Same pattern: local files that mimic the cloud service.
- Lives in `.gitignore`. GitHub never sees it. Code deploys ([[NnPGeWsu|GitHub Actions]], `wrangler pages deploy`) push `dist/` + `functions/` only. `.wrangler/` stays on your machine.
- If you delete `.wrangler/`, you lose all local data. Next `wrangler dev` recreates the directory structure but the data is gone. Pull from remote to restore.
- No config needed. Wrangler creates and manages it automatically based on `wrangler.toml` bindings.
