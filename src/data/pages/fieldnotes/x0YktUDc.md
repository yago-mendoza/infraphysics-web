---
uid: "x0YktUDc"
address: "Blockchain//Besu//Docker Path"
name: "Docker Path"
date: "2025-05-18"
---
- "Docker-only" workflow: use the Besu Docker image for everything — no local Java/JDK needed
- Key generation: `docker run --rm -v $(pwd)/n1:/data/n1 hyperledger/besu ... export-address`
- Ephemeral container runs the Besu CLI tool, saves output to host via volume, self-destructs
- Even students with Java installation problems can use this approach — Docker abstracts all dependencies

---
[[IjOYtr23|Docker Lifecycle]] :: the `--rm` flag makes these containers truly ephemeral — run the tool, get output, done

