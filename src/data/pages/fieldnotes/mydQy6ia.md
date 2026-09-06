---
uid: "mydQy6ia"
address: "ML//agent//tool use"
name: "Tool Use"
date: "2024-03-15"
---
Tool use lets a model request operations such as search, code execution, file access, database queries, and browser interaction. [[5jy6Ik4M|Function calling]] is a common structured transport for those requests.

- The model does not execute the implementation. It emits a call that an [[HaRn3sA1|agent harness]] may validate, reject, transform, or execute.
- Tools extend more than capability: read tools determine what the model can learn about the environment, while write tools determine what it can change.
- Reliability depends on choosing the right tool, supplying valid arguments, interpreting observations, and recovering when reality disagrees with the plan.

Giving a model a tool is not enough. The [[TlAb1Def|tool interface]] must make the correct use legible and the runtime must make incorrect use bounded.

## Interactions

- [[1gCBEfat|minimum privilege]] : : A tool should carry only the authority needed for the operation it represents
