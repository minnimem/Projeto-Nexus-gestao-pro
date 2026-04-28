# Nexus One - Frontend React

Frontend em React JSX preparado para conectar no backend Spring Boot existente.

## API conectada

- Backend: `http://localhost:8080`
- Login: `POST /auth/login`
- Payload: `{ "login": "...", "senha": "..." }`
- Token: armazenado em `localStorage` e enviado como `Authorization: Bearer <token>`

## Rodar no IntelliJ

1. Abra a pasta `frontend` no IntelliJ ou como modulo do projeto.
2. Crie um arquivo `.env` copiando `.env.example`.
3. Rode:

```bash
npm install
npm run dev
```

4. Acesse `http://localhost:5173`.

## Spring Boot esperado

O backend deve estar rodando em `http://localhost:8080`.
Pelo log analisado, ele ja usa PostgreSQL `TB_ADS`, Spring Security/JWT e CORS liberado.

## Modulos ja mapeados

- `/auth/login`
- `/clientes`
- `/produtos`
- `/estoque`
- `/pedidos`
- `/financeiro`
- `/logistica`
- `/rotas-entrega`
- `/usuarios`
