# Documentação da API — Nexus Gestão Pro

Este diretório reúne a documentação dos endpoints da API do sistema.

## Organização por módulo

| Módulo | Diretório |
|---|---|
| Autenticação | autenticacao/ |
| Usuários | usuarios/ |
| Empresas | empresas/ |
| Clientes | clientes/ |
| Produtos | produtos/ |
| Estoque | estoque/ |
| Compras | compras/ |
| Pedidos | pedidos/ |
| Financeiro | financeiro/ |
| Caixa | caixa/ |
| Fiscal | fiscal/ |
| Logística | logistica/ |
| Serviços | servicos/ |
| Notificações | notificacoes/ |
| Auditoria | auditoria/ |
| Outros | outros/ |

## Padrão de documentação

Cada endpoint deverá apresentar:

- Nome e finalidade da operação.
- Método HTTP: GET, POST, PUT, PATCH ou DELETE.
- Caminho da rota.
- Parâmetros da requisição.
- Exemplo de JSON enviado.
- Exemplo de resposta.
- Necessidade de autenticação e permissões.
- Possíveis códigos de resposta HTTP.

## Observações

A documentação detalhada será construída com base nos controllers,
DTOs, serviços e configurações reais do backend.

Não considerar esta página como uma lista completa de rotas.
