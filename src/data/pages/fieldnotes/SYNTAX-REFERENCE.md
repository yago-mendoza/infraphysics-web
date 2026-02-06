---
address: "SYNTAX REFERENCE"
date: "2026-02-05"
---
# Markdown estándar
Texto en **negrita**, *cursiva*, ***ambas***, y ~~tachado~~. Código en línea: `const x = 42`. _Subrayado_ reemplaza la cursiva de guiones bajos en este compilador — para cursiva se usa asterisco.
## Encabezados
De `#` (h1) a `######` (h6). Se renderizan en fuente monoespaciada con color de encabezado temático. El h1 lleva borde izquierdo con acento.
## Listas
Desordenada:
- Primer elemento
- Segundo elemento
- Tercer elemento

Ordenada:
1. Paso uno
2. Paso dos
3. Paso tres
## Cita
> Bloque de cita. Se renderiza con borde lateral y color secundario. Puede contener **negrita**, *cursiva*, `código` y [[compiler//custom syntax]] dentro.
## Tabla
| Tipo | Sintaxis | Resultado |
|------|----------|-----------|
| Negrita | doble asterisco | **demo** |
| Cursiva | asterisco simple | *demo* |
| Código | backticks | `demo` |
| Tachado | doble tilde | ~~demo~~ |
## Bloque de código
Bloques delimitados por triple backtick con lenguaje opcional para resaltado Shiki:
```typescript
const greet = (name: string): string => {
  return `Hello, ${name}!`;
};
```
## Enlace externo
Corchetes para texto, paréntesis para URL: [ejemplo](https://example.com). Renderiza en color de acento con subrayado al hover.
# Pre-procesadores
Sintaxis personalizada definida en `compiler.config.js`. Se resuelve _antes_ de que `marked` procese el markdown, por lo que los `<span>` resultantes sobreviven al parser.
## Color de texto
Llaves con almohadilla + nombre CSS o hex + dos puntos: {#red:rojo}, {#blue:azul}, {#22c55e:verde hex}, {#f59e0b:ámbar hex}, {#a78bfa:violeta hex}.
## Versalitas
Llaves con sc: {sc:texto en versalitas}. Útil para acrónimos estilizados.
## Superíndice
Llaves con caret: E = mc{^:2}, x{^:n+1}, nota{^:1}.
## Subíndice
Llaves con v: H{v:2}O, CO{v:2}, log{v:10}.
## Teclas
Llaves con kbd: {kbd:Ctrl+C} copiar, {kbd:Shift+Enter} nueva línea, {kbd:Alt+Tab} cambiar ventana. Renderiza como tecla con borde inferior.
## Subrayado
Guiones bajos en límites de palabra: _texto subrayado_. Solo se activa cuando los guiones no están pegados a otra palabra (para no interferir con nombres como `mi_variable`).
## Texto acentuado
Doble guión: --texto con acento--. Aplica la clase `.accent-text` que toma el color de acento de la sección. Nota: el contenido no puede llevar guiones internos.
# Wiki-links
Doble corchete: [[compiler]]. Con jerarquía: [[compiler//custom syntax]]. Los links resueltos muestran un diamante (◇) y preview al hover. Los no resueltos muestran interrogación roja (?). Las referencias al final de una nota (sin texto alrededor) aparecen en la sección "Related" del detalle.
# Imágenes
Markdown estándar `![alt](url)` renderiza a ancho completo (máximo 450px de alto). El título entre comillas controla la posición: `"right:200px"` flota a la derecha con ancho máximo, `"left:200px"` flota a la izquierda, `"center"` centra como bloque, `"full"` fuerza ancho completo.
# Estructura de nota
Cada entrada en `_fieldnotes.md` sigue: título en primera línea (jerarquía con `//`), contenido en líneas siguientes, wiki-links sueltos al final como trailing refs, y `---` como separador. El título genera el `id` (slug URL) y el `address` (ruta jerárquica). Si el título tiene jerarquía (ej. `CPU//ALU`), el `displayTitle` muestra solo el último segmento.
[[compiler//custom syntax]]
[[compiler//pre-processor]]
[[compiler]]
