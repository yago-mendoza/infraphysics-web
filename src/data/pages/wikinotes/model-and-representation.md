---
slug: model-and-representation
uid: "lfwTGFSW"
address: "mathematics//dynamical systems//model and representation"
name: "model and representation"
date: "2026-09-06"
---
What kind of object am I reading, and what does it claim about the system?
A **model** gathers variables, relations, parameters, domain and hypotheses for a purpose. A **representation** decides how to express it: differential equation, state space, transfer function or matrix. An equation is one relation inside that representation; it is not the whole physical system.
- Name before operating. In

{math}
\dot x=f(x,u,t;\theta),\qquad y=h(x,u,t;\theta),
{/math}

\(x\) is the **state** vector, \(u\) the **input**, \(y\) the **output**, \(t\) time and \(\theta\) the **parameters**. \(f\) describes the dynamics and \(h\) the observation. An input can be a chosen actuation or a disturbance; not every input is control.
- "Vector" describes the shape of an object. "State" describes its predictive role. "Parameter" means it stays fixed during the run considered. "Coefficient" means it multiplies a term: a coefficient can be constant or depend on the state. These categories overlap but are not synonyms.
- A measurement is not necessarily a [[u18hGtFd|sufficient state]]. Measuring a drone's position does not determine its future without also knowing its velocity and the future inputs.
- Engineering example. In \(m\ddot q=-c\dot q-kq+u\), \(q\) is position, \(m\) mass, \(c\) damping, \(k\) stiffness and \(u\) the applied force. The state can be \(x=(q,\dot q)^{\mathsf T}\). Every term of the balance is a force; after dividing by \(m\), an acceleration. The viscous force \(-c\dot q\) is an **approximate constitutive relation**: the force balance and the choice of that relation do not have the same provenance. A controller that picks \(u\) belongs to another layer ([[5zL83qyU|feedback control]]).
- What a formula does not prove. A coherent equation does not show that it represents the phenomenon. Keep apart **mathematical consequence**, **modeling hypothesis**, **physical interpretation** and **validation against data**. A matrix can represent a physical system, a statistic or a geometric transformation; it is not physically all of those at once.
- Convention in these notes: \(F\) for the dynamics matrix in \(\dot x=Fx+Bu\), \(M\) for nodal storage, \(W\) for graph weights, \(D\) for degree, \(L\) for the Laplacian, \(P\) for Markov transitions and \(\Sigma\) for covariance. See [[kkZ5fiaf|dynamical systems]].
