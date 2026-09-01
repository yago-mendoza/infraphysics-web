---
uid: "S3m8Kw4R"
address: "Infrastructure//AWS//S3"
name: "S3"
date: "2026-03-12"
---
Amazon's object storage service. The original and most widely used cloud storage: virtually every provider copies its API.
- Stores files (objects) in buckets. Any size, any type.
- Pricing: storage + requests + egress (bandwidth). The egress fees are the controversial part: serving files to users gets expensive at scale.
- So ubiquitous that "S3-compatible" became a standard. Tools built for S3 work with [[Zr6kDj2F|R2]], MinIO, Backblaze B2, etc.

## Interactions
- [[Zr6kDj2F|R2]] : : R2 is S3-compatible (same API, same tools) but with zero egress fees: [[Hp5nVw9C|Cloudflare]]'s play to make S3 users switch by eliminating the most hated part of S3 pricing
