---
uid: "Wek5Z0Un"
address: "ML//diffusion model//consistency model"
name: "consistency model"
date: "2026-02-26"
---
- Distillation: train a model to map any noise level directly to the clean image in one step
- Standard diffusion needs 20–50 denoising steps; consistency models need 1–4 — orders of magnitude faster
- LCMs (Latent Consistency Models) enabled the "quick draw" viral moment (Dec 2023) — real-time generation
- Updated with sCMs and DMDs. Core tradeoff: sacrifice some quality for massive speed gains
---
[[steRXbqf|DDPM]] :: consistency models distill the DDPM denoising process — compressing 50 steps into 1–4 by jumping directly to the clean image
