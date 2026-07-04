---
uid: "Kv8nTm5J"
address: "Cloud//Cloudflare//Workers KV"
name: "Workers KV"
date: "2026-03-12"
---
[[Hp5nVw9C|Cloudflare]]'s distributed key-value store. Despite being persistent storage, it's often called "cache" because it's optimized for high-frequency reads from [[Lk2rXj6D|Workers]].
- Key → value. Values can be text, JSON, or binary blobs (up to 25MB)
- Eventually consistent: writes propagate globally within ~60 seconds
- Optimized for read-heavy patterns: reads are fast at the edge, writes are slower
- Use cases: configuration, feature flags, session data, cached API responses
- Named "Workers KV" because it's designed to be accessed from Workers, not a standalone database, more like a fast distributed dictionary
- Different from [[Wn4pCx7H|D1]] ([[Sv2nKx8R|SQL]], structured data with queries) and [[Zr6kDj2F|R2]] (large files, object storage). KV is for small values you need to read fast at the edge.
