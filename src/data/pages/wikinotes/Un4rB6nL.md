---
uid: "Un4rB6nL"
address: "ML//diffusion model//U-Net"
name: "U-Net"
date: "2026-02-24"
---
The backbone architecture for image [[sr0JBXRW|diffusion models]]: an encoder-decoder with skip connections that predicts the noise to remove at each denoising step.
- Shaped like a U: the encoder downsamples the image through [[A9DuyXJ2|convolutional]] layers (high resolution to low resolution), capturing increasingly abstract features. The decoder upsamples back to full resolution, recovering spatial detail.
- The skip connections are the key: they connect each encoder layer directly to the corresponding decoder layer at the same resolution. Without them, fine spatial details (edges, textures) are lost during downsampling and can't be recovered. With them, the decoder gets both abstract semantics (from the bottom of the U) and precise spatial information (from the skips)
- Originally designed for medical image segmentation (2015). The diffusion model community adopted it because its architecture naturally fits the denoising task: take noisy input, output noise prediction at the same resolution.
- [[steRXbqf|DDPM]], [[Tj137ydg|latent diffusion]], and [[ZY388cmd|Stable Diffusion]] all used U-Net as the denoiser. The U-Net processes the noisy latent (or image) and predicts what noise was added, so it can be subtracted.
- [[L7lWic03|DiT]] (Diffusion Transformer) replaced U-Net's convolutional backbone with a [[QtZjVPKo|Transformer]], and newer models like [[IoT0wPoc|Flux]] followed. The insight: attention handles global context better than convolutions. U-Net's local receptive fields struggle with long-range dependencies in images.

