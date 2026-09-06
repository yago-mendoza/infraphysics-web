---
uid: "Mp5Hiqw8"
address: "OS"
name: "OS"
date: "2026-09-01"
---
An operating system turns hardware into durable abstractions: processes instead of raw CPU execution, virtual memory instead of physical addresses, files instead of storage sectors, and sockets instead of network-device registers.

- It multiplexes scarce resources while enforcing isolation between programs that do not trust one another.
- Scheduling, caching, buffering, and virtual memory make the machine easier to program, but also make timing indirect. “My code is idle” does not mean the system is doing nothing.
- [[GcSpHzEs|Concurrency]] is unavoidable inside an OS because devices, processes, interrupts, and cores progress independently.

The operating system is not merely software between an application and hardware. It is the authority that decides which version of the machine each application is allowed to believe it owns.
