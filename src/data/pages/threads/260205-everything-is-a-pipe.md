---
id: everything-is-a-pipe
title: everything-is-a-pipe
displayTitle: everything is a pipe
category: threads
date: 2026-02-05
thumbnail: https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop
description: roman aqueducts, your bloodstream, and TCP/IP all solved the same problem. none of them knew about the others.
tags: [systems-thinking, infrastructure, networking, biology, history]
featured: true
---

i had a weird realization the other day. i was reading about how the internet routes packets through TCP, and something in my brain went "wait, this is just plumbing." not metaphorically. not in a cute, hand-wavy way. i mean the engineering is *structurally identical* to plumbing. the solutions are the same. the failure modes are the same. the math is the same.

and then i looked at blood circulation. also plumbing. and then i looked at Unix pipes. *also plumbing.* and then oil pipelines, electrical grids, supply chains — all plumbing. everything is plumbing.

this should not have been as unsettling as it was.

# rome didn't fall, it leaked

the Roman aqueduct system is one of the most impressive engineering achievements in human history, and also basically a gravity-powered municipal water API.

here's how it worked. you find a source of clean water in the hills — a spring, a lake, whatever — and you build a channel from there to the city. the channel has a very slight downward gradient. we're talking about 1 meter of drop for every 4,800 meters of horizontal distance. that's barely a slope. that's less slope than most people's driveways. and yet water flows through it, reliably, for hundreds of kilometers, powered by nothing but gravity and the quiet confidence of Roman engineering.

but here's where it gets interesting. the water doesn't go straight from the hills into your mouth. it hits a --castellum divisorium-- first — a distribution tank at the city's edge. this tank splits the incoming flow into multiple smaller pipes heading to different neighborhoods.

sound familiar? it should.

it's a load balancer. same concept. same function. two thousand years earlier.

and when demand in one neighborhood spiked — say, everyone in Trastevere decided to take a bath at the same time because Trastevere apparently had *one* hobby — the flow to other neighborhoods would drop. so the Romans built reservoirs. holding tanks that accumulated water during low-demand periods and released it during peaks.

that's a buffer. literally a buffer. they invented buffering to manage throughput in a distributed delivery system and they did it using rocks.

they also had redundant supply lines. Rome had *eleven* aqueducts feeding the city. not because one wasn't enough, but because --if the Goths cut your water supply, you want a failover--. redundancy. fault tolerance. high availability. the Romans built a four-nines uptime water system using concrete, arches, and slave labor, and it ran for five hundred years without a version update.

anyway.

# your blood is enterprise middleware

let's talk about the circulatory system, which is — and i cannot stress this enough — also a pipe.

your heart pumps blood. that blood carries oxygen (the payload) inside red blood cells (the packets) through arteries (the trunk lines) down to capillaries (the last-mile delivery network) and back through veins (the return path). this is a packet-switched delivery network. it has routing. it has flow control. it has congestion management. it has better uptime than most things humans have intentionally built.

{bkqt/keyconcept}
when a muscle needs more oxygen — say, you're running from something with teeth — your body dilates the arterioles feeding that muscle, increasing flow. simultaneously, it constricts arterioles to less critical areas. your digestive system can wait. you're being chased. this is dynamic bandwidth allocation. your body is doing QoS routing in real time, prioritizing critical traffic over background processes. it figured this out roughly 400 million years before Cisco did.
{/bkqt}

and the failure modes? hilariously familiar.

an aneurysm is a buffer overflow — a section of pipe that expanded beyond spec and burst. a blood clot is a packet that got stuck in the pipe and blocked all downstream traffic — a deadlock with fatal consequences. atherosclerosis — plaque buildup in arteries — is literally pipe corrosion reducing throughput over time. your cardiologist is basically a plumber with a medical degree and better handwriting.

your body even has error detection. if a blood vessel gets damaged, platelets rush to the site and form a clot to seal the leak. that's a self-healing mechanism. your circulatory system has better incident response than most Series B startups.

here's the kicker: the total length of blood vessels in a human body is roughly --100,000 kilometers--. that's enough to wrap around the earth two and a half times. you are carrying a pipe network longer than most countries' highway systems, and it runs 24/7 without a maintenance window for about 80 years.

try getting that SLA from AWS.

## TCP/IP: the internet is literally plumbing

when Vint Cerf and Bob Kahn designed TCP in the 1970s, they probably weren't thinking about Roman aqueducts or hemoglobin. but they independently arrived at the exact same solutions to the exact same problems. because the problems are the same. because everything is a pipe.

TCP breaks your data into packets (chunks of bytes — little buckets of water). it numbers them sequentially so the receiver can reassemble them in order, even if they arrive scrambled. it sends them through a network of routers (junctions in the pipe system). and it implements --flow control-- to avoid overwhelming the receiver.

{bkqt/note|The Congestion Window}
TCP doesn't just blast data at full speed. it starts slow — sends one packet, waits for acknowledgment. then two. then four. doubling each time. this is called slow start, and it's TCP's way of probing the network's capacity without flooding it.

if packets start getting dropped (the pipe is full), TCP halves its sending rate immediately. this is congestion avoidance. it's the exact same principle as Roman reservoirs managing demand spikes — buffer when you can, throttle when you must.

Vint Cerf reinvented the sluice gate. using math. in the 1970s. wearing a three-piece suit, presumably.
{/bkqt}

and just like the Romans built redundant aqueducts, the internet routes around failures. if one path goes down, packets find another way. that's not a feature someone added later — it's the fundamental architecture. the internet was designed so that you could literally nuke a chunk of it and traffic would reroute automatically.

cold war engineering at its finest.

## `cat universe | grep pattern`

and then there's Unix pipes. which might be the purest, most distilled expression of this whole concept.

in 1973, Ken Thompson and Dennis Ritchie — while building Unix at Bell Labs in their spare time like it was a weekend project and not the foundation of all modern computing — introduced the pipe operator: `|`. it takes the output of one program and feeds it directly into the input of another. no intermediate files. no manual copying. just a stream flowing from one process to the next.

```bash
cat server.log | grep "ERROR" | sort | uniq -c | sort -nr | head -20
```

that one line reads a log file, filters for errors, sorts them, counts unique occurrences, sorts by frequency, and shows the top 20. six programs. zero of them know the others exist. they just read from a pipe and write to a pipe. beautiful. elegant. plumbing.

{bkqt/tip}
the Unix philosophy is literally "do one thing well and connect to everything via pipes." each program is a simple, specialized valve in a pipeline. the power comes from composition, not complexity. this is the same reason Roman aqueducts used standardized pipe diameters — interchangeable components, composable infrastructure. Ken Thompson and a Roman hydraulic engineer would have had a great conversation if you could get past the language barrier and the 2,000-year gap.
{/bkqt}

and the backpressure mechanism is *perfect*. if the receiving program can't process data fast enough, the pipe buffer (typically 64KB on Linux) fills up. when it's full, the sending program just... stops. blocks. waits. no data loss. no overflow. the slow consumer controls the pace of the fast producer.

your blood vessels do the same thing. TCP does the same thing. Roman sluice gates did the same thing.

# the table that shouldn't exist

here's where it gets properly eerie.

| concept | aqueducts | blood | TCP | unix pipes |
|---|---|---|---|---|
| payload | water | oxygen | data packets | text streams |
| conduit | stone channels | arteries / veins | cables / fiber | file descriptors |
| buffer | reservoirs | spleen | socket buffer | pipe buffer (64KB) |
| flow control | sluice gates | vasoconstriction | congestion window | backpressure |
| load balancing | castellum | heart chambers | routers / BGP | tee / split |
| error detection | human inspection | platelets | checksums | exit codes |
| redundancy | 11 aqueducts | collateral circulation | multi-path routing | fallback pipes |

seven completely different engineering domains. same seven solutions. same seven problems. independently discovered across --two thousand years-- by people who had absolutely no idea the others existed.

that table should be illegal.

## why this keeps happening

okay so hydraulic engineering, evolutionary biology, packet networking, and operating system design all converge on identical solutions. that's not a coincidence. that's not even a pattern. that's a --structural inevitability--.

here's why. every pipe system shares the same fundamental constraint: you have a producer, a consumer, and a channel with finite capacity between them. that's it. that's the whole problem. and there are only so many mathematically valid solutions to that problem.

{bkqt/keyconcept}
this is what queuing theory formalizes. Little's Law — published in 1961 but applicable to Roman water systems and human arteries alike — states:

--L = λW--

the average number of items in a system (L) equals the average arrival rate (λ) multiplied by the average time each item spends in the system (W). it doesn't care if L is packets, water molecules, or red blood cells. the math is identical. the math was always identical. Little's Law doesn't know what domain it's solving for, and that's the point.
{/bkqt}

the reason every pipe system discovers buffering is that variable demand plus fixed capacity equals overflow without a buffer. the reason every pipe system discovers flow control is that unregulated producers will always overwhelm finite channels. the reason every pipe system discovers redundancy is that single points of failure will, given enough time, fail.

these aren't design choices. they're --theorems--. any engineer building any pipe system will rediscover them, because they are properties of the *problem space*, not the solution space. the Romans didn't *choose* to invent buffering. buffering *chose* to be necessary. evolution didn't *design* vasoconstriction. physics demanded it.

---

i keep coming back to a line that sits on the front page of this site: *engineering is engineering — the substrate doesn't matter.*

i used to think that was a nice sentiment. a philosophical position. a way of saying "i work across domains and that's cool."

now i think it's a mathematical statement. and the proof is sitting in a table comparing Roman concrete to red blood cells to TCP congestion windows, and all three columns say the same thing.

the patterns that work in pipe engineering are the patterns that work. period. doesn't matter if the pipe carries water, blood, photons, or bytes. the physics of flow through a bounded channel produces the same constraints, and the same constraints produce the same solutions. every time. everywhere. for two thousand years and counting.

which means if you deeply understand *one* pipe system — i mean really understand it, down to the failure modes and the math — you already understand all of them. the transfer is free. the knowledge is portable. the only thing that changes is what's flowing through the tube.

and the tube, as it turns out, doesn't care.
