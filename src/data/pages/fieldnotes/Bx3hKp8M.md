---
uid: "Bx3hKp8M"
address: "Infrastructure//storage//bucket"
name: "bucket"
date: "2026-03-10"
---
A container for objects (files, blobs, assets) in cloud object storage. You upload files, get a URL back, serve them. No filesystem hierarchy -- flat namespace with key prefixes that look like folders.
- Use cases: static assets (images, videos, PDFs), backups, logs, data lake files
- Compatible APIs converged around AWS S3's API -- most providers ([[Zr6kDj2F|Cloudflare R2]], Google GCS, MinIO) implement S3-compatible endpoints
- Cheap, durable, and scale infinitely

## Interactions
- [[Zr6kDj2F|R2]] : : R2 is Cloudflare's bucket implementation -- S3-compatible API with zero egress fees
