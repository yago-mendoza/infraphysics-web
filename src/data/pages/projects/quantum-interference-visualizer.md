---
id: quantum-interference-visualizer
title: quantum-interference-visualizer
displayTitle: quantum interference visualizer
category: projects
date: 2023-10-15
thumbnail: https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=400&auto=format&fit=crop
description: visualizing wave functions in webgl.
status: implemented
technologies: [WebGL, GLSL, JavaScript]
---

# quantum interference visualizer

## abstract
this project aims to render real-time quantum interference patterns using webgl shaders. the concept is to map the probability density function directly to pixel luminance.

![interference pattern result](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop)

## implementation
created a custom glsl fragment shader that solves the schrödinger equation for a particle in a box 2d.

- step 1: grid setup
- step 2: boundary conditions
- step 3: time evolution

## outcome
the visuals are hypnotic. it serves as a good educational tool for understanding wave duality.
