---
uid: "Zr6kDj2F"
address: "Infrastructure//Cloudflare//R2"
name: "R2"
date: "2026-03-10"
---
Cloudflare's object storage. S3-compatible API -- any tool that works with AWS S3 works with R2.
- Key differentiator: zero egress fees (AWS charges for every byte downloaded from S3; R2 doesn't)
- Use cases: static assets, user uploads, backups, media storage
- Access via [[Lk2rXj6D|Workers]] bindings, S3 API, or the dashboard
- Pricing: storage ($0.015/GB/month) + operations (Class A $4.50/M, Class B $0.36/M), no bandwidth charges
