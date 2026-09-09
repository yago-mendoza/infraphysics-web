---
slug: nodal-capacity
uid: "f2KRNCOg"
address: "mathematics//graph theory//nodal capacity"
name: "nodal capacity"
date: "2026-09-06"
aliases: ["physical network", "storage matrix"]
---
Why the same flow changes the state of two nodes at different speeds. The **nodal capacity** converts a transfer rate into a rate of change of the intensive variable. In a tank with volume \(V_i(h_i)\),

{math}
a_i(h_i)=\frac{dV_i}{dh_i},\qquad \dot V_i=a_i(h_i)\dot h_i.
{/math}

For tanks of constant section, \(a_i\) is the cross-sectional area. Define \(M=\operatorname{diag}(a_i)\), the storage matrix. With linear conductances and inflows \(b\),

{math}
M\dot h=-Lh+b,\qquad \dot h=-M^{-1}Lh+M^{-1}b.
{/math}

\(L\) describes the connections ([[4tV2QGXX|graph Laplacian]]); \(M\) the storage. In hydraulics, \([h]=\mathrm m\), \([a_i]=\mathrm m^2\), \([b_i]=\mathrm m^3/\mathrm s\) and \([k_{ij}]=\mathrm m^2/\mathrm s\).
- Level and volume are not interchangeable. If \(v=Mh\) with constant \(M\), then \(\dot v=-LM^{-1}v+b\): the order of the matrices changes. It is not correct in general to use \(\dot v=-M^{-1}Lv\), nor to call the state of \(\dot h=-Lh\) a volume without explaining capacities and units. In a closed network \(\mathbf1^{\mathsf T}Mh\), the total volume, is conserved, not necessarily \(\sum_i h_i\). The final level of a connected network is

{math}
h_*=\frac{\sum_i a_i h_i(0)}{\sum_i a_i}.
{/math}

- The same scheme in other engineering. In a thermal network the state can be temperature and \(M\) the heat capacities; in an RC network, voltage and capacitances; the edges are thermal or electrical conductances. The resemblance comes from a balance and a law proportional to differences ([[Vsap2qco|balance equation]]), not from water, charge and heat being the same quantity.
- Storage is not automatically mechanical inertia. Changing positive capacities does not by itself create oscillatory modes in this passive first-order network, because

{math}
M^{-1}L=M^{-1/2}(M^{-1/2}LM^{-1/2})M^{1/2}
{/math}

and the central matrix is symmetric positive semidefinite, so the decay rates are real and non-negative. An individual level can rise and then fall by superposition of exponentials without any oscillatory mode. A mechanical model \(M_m\ddot q+C_m\dot q+L_kq=0\) is second order; without damping the modal problem \(L_kv=\omega^2M_mv\) yields frequencies, a different reading of eigenvalues from diffusion.
- [[eZ9MJEbt|three-tank network]] compares capacities numerically; the [[Gs96QiPq|Lyapunov function]] note proves dissipation for this network; the [[5b5LCoKr|normalized Laplacian]] explains why dividing by degree is not the same as introducing an arbitrary physical capacity.
