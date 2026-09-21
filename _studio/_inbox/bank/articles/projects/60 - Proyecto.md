# El artefacto que convierte toda la decisión en algo que CONSTRUYES y ENSEÑAS. No es un doc de notas — es tu puente del análisis a la acción (tu §3.3). El proyecto que te posiciona como lo que el mundo va a pagar caro.

## §1 · La tesis (por qué ESTE proyecto)

**La regla madre:** *no aprendas lo que la ola está a punto de hacer GRATIS; aprende lo que se vuelve MÁS valioso cuando eso es gratis.* Cuando la **generación** (código, texto, modelos) se abarata, suben: **curación, evaluación, confianza, accountability, gusto.**

**La trampa (donde estás medio metido hoy):** prompt-engineering como especialidad, wrappers finos sobre APIs, perseguir frameworks. Eso = "el lenguaje concreto" que aprendiste antes y que la IA se comió. Se commoditiza.

**Tu punta de lanza (lo que casi nadie está haciendo y es tu forma exacta):**
> **Conviértete en el VERIFICADOR/JUEZ de élite de la IA en un dominio físico-crítico.**
> Porque: (a) **ya lo hiciste** (el benchmark de DxGPT en F29 — tu activo más infravalorado), (b) es **lo más escaso** cuando explota la generación (alguien tiene que decir si el output está bien), (c) combina **tu dominio (industrial/crítico) + juicio + el ángulo físico/accountability**, (d) **la IA no puede ser responsable legal** → siempre hará falta un humano que **certifique.** Eso es *"el que sabe si la fábrica autónoma está bien montada y por qué"*, no *"el que escribió el prompt".*

→ **Por eso el proyecto no puede ser otro wrapper.** Tiene que **demostrar que JUZGAS y VERIFICAS la IA en un sistema físico-crítico**, no solo que la invocas. Ahí está tu diferencial.

## §2 · Qué construyo — el "Mission-Critical Copilot"

Un **sistema agéntico de IA sobre una planta industrial simulada**, end-to-end:
1. **Ingesta** de datos de sensores (time-series de un dataset público industrial — NASA turbofan, datos de bombas/rodamientos, o telemetría de DC simulada).
2. **Detección de anomalías / fallos** (un modelo sobre la serie temporal).
3. **RAG sobre manuales/specs** del equipo (el agente recupera el procedimiento correcto).
4. **Agente que genera** work orders / pasos de troubleshooting / valida contra spec.
5. **★ LA CAPA QUE TE DIFERENCIA — EVALUACIÓN/VERIFICACIÓN:** un **benchmark** que mide si los diagnósticos/recomendaciones del agente son **CORRECTOS** (precision/recall sobre fallos conocidos, detección de alucinaciones, una rúbrica de calidad, "¿cuándo NO confiar en el agente?"). **Esto es el ADN de tu benchmark de F29 aplicado** — y es lo que te convierte en *el que juzga la IA*, no *el que la usa.*

> Sin la capa 5, es un demo más. **Con la capa 5, eres el verificador-en-dominio-crítico** de §1. La capa 5 es el proyecto.

## §3 · Qué prueba — y a quién

- **Prueba que:** construyes (pipeline), despliegas (agente funcionando), **y JUZGAS** (la capa de eval) IA en contexto industrial → cierras tu gap percibido ("código asistido / wrappers") y demuestras rigor.
- **A quién se lo enseñas:** hiring managers / leads de **Field Engineering** y **Solution Architecture** en **Cognite, AVEVA, Siemens, Schneider, consultoría GenAI (Accenture/Minsait)** — el perfil que despliega IA industrial. Es la prueba que compensa "no he sido senior / mi código era asistido".
- **Bonus:** es tu hilo **evangelist** — un write-up serio en **InfraPhysics** sobre "cómo verificar IA agéntica en infra crítica" te posiciona como autoridad-de-nicho (la envidia-del-PhD, saciada en público).

## §4 · El re-skin — un proyecto, seis señales

Mismo núcleo (ingesta → anomalía → RAG → agente → **eval**), distinta **piel** por dominio → cada piel = una historia distinta para una entrevista/sector distinto, sin rehacer el core:
- **Data center** (telemetría de potencia/refrigeración) · **Farma** (batch/desviaciones GMP) · **Minería** (equipo/predictivo) · **Energía/grid** (carga/anomalía) · **Espacio** (telemetría satélite) · **Defensa** (sensor-fusion / detección).
→ Si lo haces **agéntico**, cada piel demuestra a la vez tu **sueño de "lead de transformación agéntica"** + tu encaje en ese dominio. Doble pájaro.

## §5 · Scope / stack / milestones

**Stack:** Python · un LLM API (Claude/GPT) · vector DB (RAG) · una lib de time-series/anomalía · dashboard simple (Streamlit) · un framework de agentes · *(opcional, sube nota OT: simulador OPC-UA para fluidez con datos industriales).*

**Milestones (MVP-first, shippea cada uno):**
- **M1 — Pipeline + anomalía:** ingesta de un dataset público + detección de fallos. *(Prueba: "construyo y despliego un pipeline".)*
- **M2 — RAG + agente:** RAG sobre manuales + agente que genera work orders/troubleshooting. *(Prueba: "agéntico industrial".)*
- **M3 — ★ EVAL/benchmark:** la capa de verificación (tu diferencial). *(Prueba: "JUZGO la IA, no solo la uso".)*
- **M4 — Demo + write-up + 1 re-skin:** dashboard + vídeo demo + artículo InfraPhysics + una segunda piel de dominio.

> Regla anti-parálisis: **shippea M1 imperfecto antes de pulir nada.** El objetivo no es el proyecto perfecto — es **el movimiento** (§3.3). Un M1 público bate a un M4 en tu cabeza.

## §6 · Cómo lo enseño (el movimiento)

- **Cold-message en LinkedIn** a un Field-Engineering/Solution-Architecture lead (Cognite & co.): *no* "busco trabajo", sino *"construí esto sobre datos de planta simulada + una capa de verificación de la IA — ¿encajaría en vuestro equipo?"* + link al repo/demo. Te separa de los 500 que aplican en frío.
- **InfraPhysics:** el write-up = prueba viva de que no te oxidas + autoridad-de-nicho.
- **En entrevista:** es tu respuesta a "cuéntame algo que hayas construido" Y a "¿cómo sabes que la IA no se equivoca?" (la pregunta que casi nadie sabe responder — tú sí).

## §7 · Changelog
- **2026-06-24** — Creación. La tesis (verificador/juez en dominio físico-crítico) + el spec del Mission-Critical Copilot con la capa de evaluación como diferencial + re-skin + milestones MVP-first + cómo enseñarlo. Es el artefacto-puente análisis→acción.
