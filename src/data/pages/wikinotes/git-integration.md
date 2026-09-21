---
slug: git-integration
uid: "Gi7bQs3L"
address: "infrastructure//Cloudflare//Pages//Git integration"
name: "Git integration"
date: "2026-09-19"
aliases: ["Direct Upload"]
---
A [[Fs8tBm3G|Pages]] project is deployed in one of two ways, and the choice is fixed when the project is created. With **Git integration** the project is connected to a repository and receives its pushes ([[Gk6tPm2H|CI/CD]]). With **Direct Upload** it accepts files sent to it, which is what [[Nx9sGt5L|Wrangler]] does. The two do not coexist in one project and a project cannot be converted from one to the other.

The consequence shows up when a project is inherited. A client's project connected to the GitHub of a previous technician cannot be turned into a direct-upload project: a new project is created and the [[Cd6yMw2S|custom domain]] is moved to it. Each project keeps its own [[Pd4kVz8N|pages.dev]] hostname through that operation.

## Interactions

- [[Rw4sVx7J|direct deploy]] : : In general a direct deploy can coexist with a pipeline; inside one Pages project it cannot, because the project was created either to receive pushes or to receive uploads
