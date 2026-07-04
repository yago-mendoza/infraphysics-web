---
uid: "FlMHYCjo"
address: "Docker"
name: "Docker"
date: "2025-02-03"
---
Ship the entire kitchen, not just the recipe. Guaranteed to taste the same on every machine. Containers package an application with its dependencies, isolated from the host OS.
- Images are immutable blueprints; containers are running instances of those images.
- `docker run` creates a container from an image. The image itself never changes.
- The containerization model trades a little overhead for massive portability and reproducibility.
- In blockchain: eliminates "works on my machine": everyone runs the exact same Besu binary.

## Interactions

- [[pduX6oJa|Docker Network]] : : Containers live in isolated network namespaces by default. Docker networking bridges the gap
