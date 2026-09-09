---
slug: state-machine
uid: "d027dd15"
address: "computer science//state machine"
name: "state machine"
date: "2026-09-08"
aliases: ["state machines"]
---
A state machine models behaviour as a set of states and the transitions allowed between them. An event can trigger a transition, sometimes subject to a condition, and the transition can carry an action. Making those rules explicit prevents the current state from being inferred independently in several places.

The [CRM project](/lab/projects/health-tech-crm) uses this kind of reasoning for workflow. A state model describes the permitted sequence; [[Sv2nKx8R|SQL]] and the application still need to preserve it when concurrent operations reach the same record.
