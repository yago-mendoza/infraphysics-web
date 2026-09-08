---
uid: "Uf7pLs4Q"
address: "Web Dev//CRUD"
name: "CRUD"
date: "2026-03-10"
---
Create, Read, Update, Delete -- the four basic operations on data. Any app that manages information implements CRUD.
- In [[Sv2nKx8R|SQL]]: `INSERT`, `SELECT`, `UPDATE`, `DELETE`
- In a REST API: `POST`, `GET`, `PUT/PATCH`, `DELETE`
- In [[Xd9kLw4B|Hono]] (or Express): you define one handler per operation (`app.get`, `app.post`, `app.put`, `app.delete`)
- [[Nx9sGt5L|Wrangler]] runs these handlers locally against [[Wn4pCx7H|D1]] for development, and in production against the remote D1 -- the code is identical
- Automations: creating a resource can trigger side effects in the same handler (e.g. creating a contact --> automatically create its associated story and prospect). All in TypeScript, in the same API handler.
