---
date: 2026-07-05
tags:
  - career
title: LeadRank
related:
  - "[[Origin]]"
  - "[[260705 - Las habilidades escasas de la década agéntica]]"
status: pre-launch
url: https://leadrank.net
---

# Infraestructura de IA que convierte el inbox de un agente inmobiliario en un motor de ventas estructurado — y, en su forma ambiciosa, el banco de pruebas de MI problema grande: la fiabilidad industrial del razonamiento de agentes.

## Qué es (el producto)

Agente que lee Gmail/Outlook (OAuth2 read-only, nunca envía ni borra) y:
- Extrae contactos, propiedades e intención de años de historial de correo + adjuntos (Excel de portfolio, PDFs, escrituras).
- Analiza mensajes nuevos en tiempo real y **surfacea matches comprador-vendedor** con % y explicación + draft de respuesta.
- Crea contact/property cards vivas. Detecta invitaciones de calendario para visitas.

Pricing lanzamiento: primeros 300 correos gratis, €69/mes, 14 días money-back. GDPR. Landing pulida (last-mile hecho). **Estado: pre-launch** — validar con inmobiliarias reales; el hueco no es más código, es (a) usuarios pagando y (b) contar en público cómo está hecho.

## El problema GRANDE (por qué esto importa más de lo que parece)

LeadRank no es "un SaaS inmobiliario". Es el **banco de pruebas en miniatura** de EL problema de la década para mi perfil:

> *"El sistema de IA da una respuesta plausible" ≠ "puedo confiarle un proceso real de alto riesgo".* Cerrar ese gap — **evaluar y verificar el razonamiento de agentes como una disciplina de fiabilidad industrial, no como un examen** — es el problema grande, y es mío.

Hoy la IA se evalúa como un estudiante: accuracy en un test, un número. Como ingeniero industrial sé que un proceso no es fiable porque una pieza pasó el control una vez: es Cpk, cartas de control, failure modes, SPC, ¿cuándo salta la alarma y paras la línea? **Nadie aplica esa mentalidad al razonamiento de los agentes.** Se evalúa la IA como un parcial cuando debería evaluarse como una línea de producción. Ese hueco —*control de calidad y fiabilidad industrial del razonamiento de IA*, ingeniería de la confianza en IA— es el Arquetipo D llevado a su forma ambiciosa.

En LeadRank el problema aparece en miniatura: *"¿cómo sé que este match comprador-vendedor al 92% es correcto y no una alucinación plausible?"* Ese es EL problema, pequeño.

## Por qué es mío y de casi nadie más (tres miradores que no coinciden en otra cabeza)

- **F29:** ya lo hice en producción clínica. El 70→93% de DxGPT no es "output accuracy", es que mejoré el *razonamiento* en un sistema con vidas detrás. El post de reasoning vs output mimicking es la semilla.
- **UNE / AI Act:** escribo la ley que *obliga* a evaluar la conformidad de sistemas de IA — pero nadie sabe *cómo* se hace técnicamente. Estoy en la sala donde se decide, con el problema técnico sin resolver encima.
- **Industrial:** mi cabeza piensa en procesos, tolerancias y control de calidad. Ese es justo el método que le falta al campo.

Uno de F29 no tiene la regulación. Uno de la AI Act no ha shippeado un modelo. Un industrial no sabe de LLMs. Yo tengo los tres — eso no se compra ni con un PhD.

## Cómo aproximar el problema grande (sin abrir un cuarto frente)

1. **LeadRank como laboratorio del método**, no solo como negocio: construir aquí el primer **eval harness de razonamiento** ("¿cómo verifico que un match es fiable?") — para forjar el método, no para vender.
2. **Destilar en público:** writeup tipo *"Cpk para agentes: por qué evaluamos la IA como un examen cuando es una línea de producción"*. Me clava en la intersección que nadie ocupa y es munición de vuelta a UNE (y arranca la divulgación / Arquetipo C sola).
3. **Cerrar el last mile del producto:** de pre-launch a usuarios reales pagando — la prueba más fuerte de "construí algo" para entrevistas, por encima de cualquier repo.

No es *otro* proyecto: es LeadRank + experiencia F29 + silla en UNE apuntando al mismo blanco. El problema grande es el marco que da sentido a lo que ya tengo.

## Pendiente

- [ ] Conseguir primeras inmobiliarias usando/pagando (validación real).
- [ ] Eval harness de razonamiento sobre el matching (el método).
- [ ] Writeup público de decisiones técnicas (no secreto: modelo elegido, cómo evalué accuracy, OAuth read-only + GDPR, qué falló).
- [ ] Enganchar este marco al [[Origin]].
