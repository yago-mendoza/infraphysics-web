---
uid: "Va6tK5jL"
address: "ML//VAE"
name: "VAE"
date: "2026-02-28"
aliases: ["variational autoencoder"]
---
Variational Autoencoder: learn to compress data into a structured [[RnKMoC3a|latent space]], then generate new data by sampling from that space. An encoder maps input to latent distribution, a decoder maps latent sample to output.
- The "variational" part: instead of encoding to a single point, the encoder outputs a mean and variance (a Gaussian distribution). During training, you sample from this distribution, which forces the latent space to be smooth and continuous.
- The KL divergence loss is the key: it penalizes the encoder for making the latent distribution too different from a standard Gaussian. This regularization is what makes the latent space navigable. Without it, you get an autoencoder (good reconstruction but holes in the latent space)
- [[Tj137ydg|Latent diffusion]] (including [[ZY388cmd|Stable Diffusion]]) uses a pre-trained VAE to compress images from pixel space (e.g., 512x512x3) to latent space (e.g., 64x64x4). The [[sr0JBXRW|diffusion model]] then operates in this much smaller space, making training and generation dramatically cheaper.
- Compared to [[JP0VCiWq|GAN]]s: VAEs produce blurrier outputs but have stable training and a meaningful latent space. GANs produce sharper outputs but suffer from [[bKPquVKV|mode collapse]] and training instability. Latent diffusion combines the best of both worlds: VAE for compression, diffusion for generation quality.
- The decoder half is also used in text-to-image: after the diffusion model denoises in latent space, the VAE decoder converts back to pixel space. This is why all [[WeLIuxyC|text-to-image]] models based on latent diffusion share a VAE component.

