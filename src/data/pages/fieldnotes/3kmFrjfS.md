---
uid: "3kmFrjfS"
address: "RPC//CORS"
name: "CORS"
date: "2025-08-19"
---
- Cross-Origin Resource Sharing: browser security that controls which web origins can call the RPC
- `rpc-http-cors-origins=["*"]` allows ANY website to call your node — convenient for development only
- Dangerous in production if the port is internet-accessible — any malicious page could interact with your node
- Restrict to specific origins (`["http://localhost:3000"]`) for any non-development deployment

---
[[1gCBEfat|Security: Minimum Privilege]] :: restricting CORS is part of the minimum-privilege principle for RPC nodes

