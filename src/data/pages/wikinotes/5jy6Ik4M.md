---
uid: "5jy6Ik4M"
address: "ML//agent//function calling"
name: "Function Calling"
date: "2024-03-15"
---
Function calling is a structured model output containing a tool identifier and arguments, commonly represented as JSON. The application validates the call, executes ordinary code, returns an observation, and may invoke the model again.

- It is a protocol for requesting execution, not execution itself. The model has no direct function pointer into the host process.
- Schemas constrain syntax and communicate intent, but valid JSON can still request a semantically wrong or unsafe operation.
- The returned observation becomes new context. Its selection, formatting, truncation, and error detail influence the model's next decision.

Function calling supplies the plumbing for [[mydQy6ia|tool use]]. The [[HaRn3sA1|harness]] supplies the control loop and enforcement around it.

## Interactions

- [[TlAb1Def|tool interface]] : : Names, descriptions and schemas determine which calls the model can represent and select reliably
- [[AtkSurf7|attack surface]] : : A valid structured call still crosses into implementation code that must validate authority and untrusted arguments
