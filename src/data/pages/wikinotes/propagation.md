---
slug: propagation
uid: "Pg8dNk4V"
address: "web dev//DNS//propagation"
name: "propagation"
date: "2026-09-19"
aliases: ["DNS propagation"]
---
Propagation is the window after a [[Jt7nKx4S|DNS]] change in which the old answer and the new one coexist. When the [[Ns4vTb8W|nameservers]] of a domain are changed, for some hours both sets keep being asked: some users reach the old one and some the new one, with no criterion a site owner can control.

The window is usually described as slowness, and that is the wrong picture. If the new [[Zn5qHc7M|zone]] is empty during those hours, the users who land on it do not get a slow site. They get a correct answer that says *there is nothing here*, and for them the website and the mail do not exist.

{bkqt/keyconcept}
Replicate first, switch the nameservers after. Every record of the old zone is copied into the new one before the delegation changes, so that both sides give the same answer for as long as both are being asked.
{/bkqt}
