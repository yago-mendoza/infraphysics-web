---
uid: "Gk6tPm2H"
address: "Web Dev//deploy//CI/CD"
name: "CI/CD"
date: "2026-03-10"
---
Continuous Integration / Continuous Deployment -- automated pipeline that builds, tests, and deploys code when you push to a repository.
- GitHub Actions, GitLab CI, CircleCI, Jenkins
- The flow: git push **> pipeline triggers **> run tests **> build **> [[Dx8yLn3F|deploy]] to production
- Advantages: automated, consistent, auditable
- Disadvantages: more setup, slower feedback loop (wait for pipeline), requires a git hosting service in the loop

## Interactions
- [[Rw4sVx7J|Direct Deploy]] : : CI/CD is automated via git push; direct deploy is manual via CLI. CI/CD gives audit trail and tests, direct deploy gives speed and simplicity
