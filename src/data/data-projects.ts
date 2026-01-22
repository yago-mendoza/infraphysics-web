import { Post } from './types';

export const projectPosts: Post[] = [
  {
    id: 'quantum-interference-visualizer',
    title: 'quantum-interference-visualizer',
    displayTitle: 'quantum interference visualizer',
    category: 'projects',
    date: '2023-10-15',
    thumbnail: 'https://images.unsplash.com/photo-1506318137071-a8bcbf90d177?q=80&w=400&auto=format&fit=crop',
    description: 'visualizing wave functions in webgl.',
    content: `
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
    `
  },
  {
    id: 'neural-cellular-automata',
    title: 'neural-cellular-automata',
    displayTitle: 'neural cellular automata',
    category: 'projects',
    date: '2023-11-02',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop',
    description: 'growing textures with local rules.',
    content: `
# neural cellular automata

exploring self-organizing systems. unlike traditional cellular automata (like game of life), the update rule here is a small neural network.

the goal: can a texture "heal" itself if parts of it are erased?

![cellular growth](https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=800&auto=format&fit=crop)

results: yes, with sufficient training on the target image, the system creates a robust homeostasis.
    `
  }
];