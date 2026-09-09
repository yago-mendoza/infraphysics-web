---
slug: three-tank-network
uid: "eZ9MJEbt"
address: "mathematics//graph theory//three-tank network"
name: "three-tank network"
date: "2026-09-06"
aliases: ["three tanks example"]
---
Worked example: balance, Laplacian, capacity, modes and a random walk connected in one computable case. Three open tanks share the same reference level. Pipes exist only between 1 and 2, and between 2 and 3, each with conductance \(1\,\mathrm m^2/\mathrm s\). Linear flow, no pumps, leaks, hydraulic inertia or atmospheric pressure differences.
- From mechanism to matrix. With levels \(h_i\) in meters, the flows are \(q_{12}=h_1-h_2\) and \(q_{23}=h_2-h_3\), numerically in cubic meters per second. The numerical matrices are

{math}
W=\begin{bmatrix}0&1&0\\1&0&1\\0&1&0\end{bmatrix},\quad
D=\operatorname{diag}(1,2,1),\quad
L=\begin{bmatrix}1&-1&0\\-1&2&-1\\0&-1&1\end{bmatrix}.
{/math}

The [[4tV2QGXX|graph Laplacian]] converts levels into net outflows; the capacities convert those flows into level velocities.
- Tanks of equal section. For areas \(a_i=1\,\mathrm m^2\) the numerical equation is \(\dot h=-Lh\) in seconds. From \(h(0)=(3,0,0)^{\mathsf T}\,\mathrm m\) a total volume of \(3\,\mathrm m^3\) is conserved and the final level is \(1\,\mathrm m\) everywhere. The eigen-patterns, unnormalized, are \(v_1=(1,1,1)^{\mathsf T}\), \(v_2=(1,0,-1)^{\mathsf T}\), \(v_3=(1,-2,1)^{\mathsf T}\), with rates \(0\), \(1\) and \(3\,\mathrm s^{-1}\). The solution, with \(t\) in seconds and heights in meters, is

{math}
h(t)=v_1+\tfrac32e^{-t}v_2+\tfrac12e^{-3t}v_3.
{/math}

The first mode keeps the common level. The second corrects the difference between the ends. The third corrects a pattern where the middle tank differs from both ends, and it vanishes three times faster than the second.
- Same pipes, double central capacity. Now \(M=\operatorname{diag}(1,2,1)\,\mathrm m^2\): neither the topology nor the pipe conductances change, but the dynamics does, \(\dot h=-M^{-1}Lh\). The initial volume is still \(3\,\mathrm m^3\) and the total area is now \(4\,\mathrm m^2\), so the final common level is \(0.75\,\mathrm m\). The numerical rates are \(0\), \(1\) and \(2\,\mathrm s^{-1}\), and one solution is

{math}
h(t)=\tfrac34(1,1,1)^{\mathsf T}+\tfrac32e^{-t}(1,0,-1)^{\mathsf T}+\tfrac34e^{-2t}(1,-1,1)^{\mathsf T}.
{/math}

The fast mode also changes shape. The spectrum of \(L\) alone no longer gives the rates: \(M\) has to be included ([[f2KRNCOg|nodal capacity]]).
- A walk on the same connectivity. Reading the weights as jump preferences ([[HF547EI2|Markov chain]]),

{math}
P=D^{-1}W=\begin{bmatrix}0&1&0\\1/2&0&1/2\\0&1&0\end{bmatrix}.
{/math}

Its [[4lWVJGgV|stationary distribution]] is \(\pi=(1/4,1/2,1/4)^{\mathsf T}\): not a vector of levels but a distribution of occupation. From \(p_0=(1,0,0)^{\mathsf T}\) the first step concentrates the probability in the center and the second spreads it to the ends, and the alternation continues. A stationary distribution exists, but this walk is periodic and does not converge from that start. The lazy walk \(P_{\mathrm{lazy}}=(I+P)/2\) keeps \(\pi\) and removes the periodicity; its eigenvalues are \(1\), \(1/2\) and \(0\) ([[kRgRUf2W|spectral gap]]).
- What unites and what separates the readings. The connectivity is shared. The level dynamics uses a physical balance and capacities; the walk uses per-step probabilities. With double central capacity the final volumes are in proportion \(1:2:1\), coinciding with \(\pi\) here because capacity and degree happen to be proportional in their respective units. It is not a universal identity between volume and probability.
- The rates come from the [[Vsap2qco|balance equation]]; the matrices from [[YRGQ0acp|adjacency and degree]]; the solution from [[Xevpd3GQ|modes]]. Values, decompositions and comparisons were built and checked algebraically and numerically for this note.
