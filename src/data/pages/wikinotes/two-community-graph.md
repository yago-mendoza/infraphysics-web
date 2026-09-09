---
slug: two-community-graph
uid: "ZSEkGNUs"
address: "mathematics//graph theory//two-community graph"
name: "two-community graph"
date: "2026-09-06"
aliases: ["two communities example"]
---
Worked example: how a slow disagreement pattern becomes two groups of points. Four nodes: the pairs \((1,2)\) and \((3,4)\) are joined internally with weight 1, and each node of one pair connects to both nodes of the other with weight \(\varepsilon>0\).

{math}
W=\begin{bmatrix}0&1&\varepsilon&\varepsilon\\1&0&\varepsilon&\varepsilon\\\varepsilon&\varepsilon&0&1\\\varepsilon&\varepsilon&1&0\end{bmatrix}.
{/math}

Every degree is \(d=1+2\varepsilon\). The weights are abstract affinities here; diffusion time is model time, not physical seconds.
- The pattern that tells the groups apart. An orthonormal eigenbasis of \(L=D-W\) is \(v_1=\tfrac12(1,1,1,1)^{\mathsf T}\), \(v_2=\tfrac12(1,1,-1,-1)^{\mathsf T}\), \(v_3=\tfrac1{\sqrt2}(1,-1,0,0)^{\mathsf T}\), \(v_4=\tfrac1{\sqrt2}(0,0,1,-1)^{\mathsf T}\), with eigenvalues \(0\), \(4\varepsilon\), \(2+2\varepsilon\) and \(2+2\varepsilon\). For \(\varepsilon=0.05\) these are \(0\), \(0.2\), \(2.1\) and \(2.1\). The mode \(v_2\) barely changes inside each community and only differs across the weak links; its diffusive time constant is 5 units, against \(1/2.1\approx0.476\) for the internal disagreements ([[kRgRUf2W|spectral gap]]).
- Evolution of an imbalance between communities. From \(x(0)=(1,1,0,0)^{\mathsf T}\),

{math}
x(t)=\tfrac12(1,1,1,1)^{\mathsf T}+\tfrac12e^{-0.2t}(1,1,-1,-1)^{\mathsf T}.
{/math}

The internal modes do not take part because each pair starts with equal values. An existing eigenvalue does not guarantee that its mode appears in every trajectory.
- From columns of modes to rows of coordinates. Since every degree is equal, \(L_{\mathrm{sym}}=L/d\) shares eigenvectors with \(L\). For two groups use \(U=[v_1\;v_2]\); its rows are \(\xi_1=\xi_2=(1/2,1/2)\) and \(\xi_3=\xi_4=(1/2,-1/2)\). After row normalization two positions remain, \((1,1)/\sqrt2\) and \((1,-1)/\sqrt2\), and [[9ELAQ3ap|K-means]] with two centers separates the pairs exactly in this ideal case. Columns describe patterns over the whole network; rows describe nodes in the new representation. No initial condition was projected to build those rows ([[5Gsj9whS|spectral coordinates]]).
- What happens in the discrete walk. The eigenvalues of \(L_{\mathrm{rw}}\) are \(0\), \(2/11\) and \(21/11\) twice; those of \(P=I-L_{\mathrm{rw}}\) are \(1\), \(9/11\) and \(-10/11\) twice. Although the chain converges for \(\varepsilon>0\) on this graph, the alternating modes can also persist. For \(P_{\mathrm{lazy}}=(I+P)/2\) the factors are \(1\), \(10/11\) and \(1/22\) twice: the between-community pattern is now clearly slow relative to the internal ones.
- The limit that explains [[iRDhDtGq|clustering]]. At \(\varepsilon=0\) there are two disconnected components and two zero eigenvalues. For small \(\varepsilon\) the exact separation becomes a separation of scales; as external connections grow, that justification weakens. The two groups are a property of this affinity, not a truth independent of the model. The graph, the numbers and the spectral representation were built for this note; they do not come from a measured dataset.
