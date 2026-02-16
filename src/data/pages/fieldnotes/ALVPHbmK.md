---
uid: "ALVPHbmK"
address: "Blockchain//Besu//Config"
name: "Config"
date: "2025-05-03"
---
- `config.toml` simplifies `docker run` commands — groups static settings in a file
- Contains: RPC settings, bootnodes, sync options, CORS configuration
- Parser is strict: a syntax error on one line can make Besu fail to recognize options on later lines
- `rpc-http-cors-origins=["*"]` allows any web page to call the RPC — convenient for dev, dangerous in production

---
[[3kmFrjfS|CORS]] :: the CORS setting controls which web origins can access the RPC endpoint

