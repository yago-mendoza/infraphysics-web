---
uid: "Q1EwYECD"
address: "ML//GAN//StyleGAN"
name: "StyleGAN"
date: "2019-08-10"
---
- StyleGAN is NVIDIA's [[JP0VCiWq|GAN]] architecture that maps a latent code through an intermediate style space and injects style controls throughout the generator.
- Coarser layers tend to control pose and global shape, while finer layers influence texture and local detail. This partial disentanglement made latent-space editing unusually legible.
- "This person does not exist": the website that showed the world what GANs could do.
- The original StyleGAN inherited progressive growing; later StyleGAN versions achieved better quality and stability without relying on that training schedule.

The important contribution was not just photorealistic faces. It was making the generator's internal coordinate system useful enough to manipulate.
