---
uid: "FlMHYCjo"
address: "Docker"
name: "Docker"
date: "2025-02-03"
---
- Containers package an application with its dependencies — isolated from the host OS
- Images are immutable blueprints; containers are running instances of those images
- `docker run` creates a container from an image — the image itself never changes
- The containerization model trades a little overhead for massive portability and reproducibility
- In blockchain: eliminates "works on my machine" — everyone runs the exact same Besu binary

---
[[pduX6oJa|Docker Network]] :: containers live in isolated network namespaces by default — Docker networking bridges the gap

