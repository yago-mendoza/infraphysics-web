---
uid: "AgCnt9Zm"
address: "Security//agent containment"
name: "Agent Containment"
date: "2026-09-03"
---

A shell command can be proposed in text without possessing authority to execute. Agent containment preserves that separation: the model may generate a dangerous action, while enforcement outside the model limits what can actually occur.

Containment includes filesystem sandboxes, read-only mounts, network restrictions, scoped credentials, rate limits, approval gates, execution isolation, and recoverable operations.

The model policy determines what the agent attempts. Enforcement is a separate layer that determines what the environment actually permits. Keeping those responsibilities separate is the core security boundary.

Prompt instructions are useful policy guidance, not a hard security boundary. A restriction is strong only when the component being constrained cannot rewrite, bypass, or socially negotiate it away.

The objective is not perfect model obedience. It is a bounded failure surface when the model, user input, tool output, or surrounding software is wrong.

## Interactions

- [[1gCBEfat|minimum privilege]] : : Give each agent run only the credentials and writable scope required by its present task
