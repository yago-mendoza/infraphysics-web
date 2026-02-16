---
uid: "IjOYtr23"
address: "Docker//Lifecycle"
name: "Lifecycle"
date: "2025-02-03"
---
- `--rm` creates ephemeral "use-and-discard" containers — perfect for one-shot tools like key generation
- Key gen pattern: `docker run --rm -v $(pwd):/data besu ... export-address` — run, save output, self-destruct
- `-d` (detach): container runs in background, returns control to terminal
- `-it` (interactive + tty): attaches your terminal to the container — opposite of `-d`
- Persistent nodes use `-d` without `--rm`; tooling uses `--rm` without `-d`

---
[[x0YktUDc|Besu Docker Path]] :: the "Docker-only" workflow relies entirely on ephemeral containers for Besu tooling

