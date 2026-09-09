---
slug: normalized-laplacian
uid: "5b5LCoKr"
address: "mathematics//graph theory//graph Laplacian//normalized Laplacian"
name: "normalized Laplacian"
date: "2026-09-06"
aliases: ["random walk Laplacian", "symmetric normalized Laplacian"]
---
What changes when a node's disagreement is divided by its degree. For \(L=D-W\) with degrees \(d_i>0\), the **random-walk Laplacian** is

{math}
L_{\mathrm{rw}}=D^{-1}L=I-P,\qquad P=D^{-1}W,
{/math}

whose action is \((L_{\mathrm{rw}}x)_i=x_i-\sum_j\frac{w_{ij}}{d_i}x_j\). It no longer measures an absolute sum of differences but the difference with respect to the **weighted mean of the neighbors**; the coefficients of that mean sum to one. Zero degree demands an explicit decision (separate isolated nodes or adopt a convention): \(D^{-1}\) is undefined there.
- What is removed and what is kept. Multiplying every weight by \(c>0\) multiplies \(L\) by \(c\) but leaves \(P\) and \(L_{\mathrm{rw}}\) unchanged: the global intensity scale goes, relative connectivity stays. That **does not erase every influence of sampling density**. Density, choice of neighbors, affinity width and geometry still shape the graph. A density-free operator needs extra hypotheses and normalizations, as the diffusion-maps analysis by Nadler, Lafon, Coifman and Kevrekidis shows (reference in the last bullet). If the weights were conductances with units, \(D^{-1}L\) is dimensionless: to read it as dynamics in seconds a rate is needed, \(\dot x=-\nu L_{\mathrm{rw}}x\). Normalizing does not preserve the physical clock.
- The symmetric version. For \(W=W^{\mathsf T}\),

{math}
L_{\mathrm{sym}}=D^{-1/2}LD^{-1/2}=I-D^{-1/2}WD^{-1/2}.
{/math}

Both normalized Laplacians share the spectrum because they are similar: if \(L_{\mathrm{sym}}u=\lambda u\), then \(v=D^{-1/2}u\) satisfies \(L_{\mathrm{rw}}v=\lambda v\). **They do not share the same vector in the same coordinates.** \(L_{\mathrm{sym}}\) offers Euclidean orthonormal eigenvectors; those of \(L_{\mathrm{rw}}\) can be normalized as \(v_i^{\mathsf T}Dv_j=\delta_{ij}\). The null modes are \(\mathbf1\) for \(L_{\mathrm{rw}}\) and \(D^{1/2}\mathbf1\) for \(L_{\mathrm{sym}}\).
- Relation with transition and storage. Since \(P=I-L_{\mathrm{rw}}\), right eigenvectors coincide and eigenvalues relate by \(\mu=1-\lambda\). But a column distribution of probabilities evolves through \(P^{\mathsf T}\) ([[HF547EI2|Markov chain]]). Writing \(\dot x=-D^{-1}Lx\) resembles a capacity proportional to degree, in compatible units; it does not license replacing an arbitrary physical capacity \(M\) by \(D\). Those are different decisions ([[f2KRNCOg|nodal capacity]]).
- The [[kRgRUf2W|spectral gap]] separates continuous rates from discrete per-step factors; [[iRDhDtGq|spectral clustering]] uses these normalizations to define a grouping geometry.
- Reference on density and normalization: [Nadler, Lafon, Coifman and Kevrekidis, Diffusion maps, spectral clustering and reaction coordinates of dynamical systems (2005)](https://arxiv.org/abs/math/0503445)
