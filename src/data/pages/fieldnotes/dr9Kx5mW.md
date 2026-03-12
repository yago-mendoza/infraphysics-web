---
uid: "dr9Kx5mW"
address: "Math//dimensionality reduction"
name: "dimensionality reduction"
date: "2026-03-11"
---
Transforming data from a high-dimensional space to a lower-dimensional one while preserving as much meaningful structure as possible. The goal is to make data visualizable, compressible, or computationally tractable without losing the essential relationships.

Common techniques: PCA (principal component analysis) finds the directions of maximum variance and projects onto them. t-SNE preserves local neighborhood structure for 2D visualization. Random projections exploit the fact that in high dimensions, random orthogonal vectors preserve relative distances surprisingly well.

This is something humans do constantly. When someone asks "how did you become a doctor?" they are asking you to reduce a process that depended on thousands of factors to 3 or 4 key ones. Your brain performs dimensionality reduction to make complexity communicable.

In deep learning, dimensionality reduction is how [[Lk7mT3nQ|loss landscapes]] (which live in millions of dimensions) get visualized in 3D. The standard technique (Li et al., 2018) selects two random orthogonal directions in weight space, forms a 2D plane, and plots the loss value as the third axis. The result is a "photograph" of a high-dimensional surface: imperfect but informative.

## Interactions

- [[Lk7mT3nQ|Loss Landscape]] : : loss landscapes live in millions of dimensions; dimensionality reduction is the only way to visualize them. random projections onto 2D planes are the standard technique, trading completeness for accessibility
