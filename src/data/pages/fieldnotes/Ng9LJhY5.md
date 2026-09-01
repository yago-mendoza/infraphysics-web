---
uid: "Ng9LJhY5"
address: "Tools//Google//Cloud Console"
name: "Cloud Console"
date: "2026-03-10"
---
Google's web dashboard for managing cloud infrastructure: servers, databases, networking, storage, APIs, billing. The control plane for everything running on Google Cloud Platform (GCP).
- Virtual machines (Compute Engine), containers (GKE), serverless (Cloud Run, Cloud Functions)
- Managed databases (Cloud SQL, Firestore, BigQuery), object storage (Cloud Storage)
- AI/ML services: Vertex AI, [[t8sPNl54|TPU]] clusters, pre-trained APIs (Vision, Speech, Translation)
- Networking: load balancers, CDN, VPCs, Cloud DNS
- **Projects**: where you register your app with Google. "I'm Rankmail, I want to read email, here's my [[odwaJwaf|callback URL]], these are my credentials." Google gives you a Client ID (public, goes in [[ISjyfjZ6|frontend]]) and a Client Secret (private, goes in [[Bk9sTm2J|backend]]). Without them, Google rejects any [[Oa3kTm7D|OAuth]] request. The project is the permission. The [[w2EGofgI|SDK]] knows how to talk to Google, the project is what makes Google listen.
- **API enablement**: each Google API ([[2DTZTKbQ|Gmail]], Drive, Calendar) must be enabled per project. You flip a switch, set scopes (e.g. `gmail.readonly`), and configure consent screens for external users.
- Not the same as [[Qc71eVI9|Google Admin Console]] (that's for Workspace users) or [[DkJNApLt|Google Search Console]] (that's for SEO)

## Interactions

- [[Kv8cRm3Q]] : : GCP is one of the major [[Kv8cRm3Q|cloud]] providers. This console is its management interface
