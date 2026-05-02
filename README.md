# Nexus One - Gestao Pro

Sistema de gestao com frontend React/Vite e backend Spring Boot. O frontend oficial esta na raiz do projeto `nexus-gestao-pro` e conecta no backend existente em `backend/projectoads/projectoads`.

## API conectada

- Backend: `http://localhost:8081`
- Login: `POST /auth/login`
- Payload: `{ "login": "...", "senha": "..." }`
- Token: armazenado em `sessionStorage` e enviado como `Authorization: Bearer <token>`

## Rodar frontend

1. Abra a pasta `nexus-gestao-pro` no IntelliJ ou VS Code.
2. Crie um arquivo `.env` copiando `.env.example`.
3. Rode:

```bash
npm install
npm run dev
```

4. Acesse `http://localhost:5173`.

## Rodar backend

O backend deve estar rodando em `http://localhost:8081`.

Requisitos:

- Java 21
- Maven
- PostgreSQL local com banco `TB_ADS`

Backend local:

```text
backend/projectoads/projectoads
```

Comando:

```bash
mvn spring-boot:run
```

Configuracao principal:

- Arquivo: `backend/projectoads/projectoads/src/main/resources/application.yml`
- Banco: `jdbc:postgresql://localhost:5432/TB_ADS`
- Porta: `8081`

Variaveis recomendadas para rodar o backend:

```bash
DB_URL=jdbc:postgresql://localhost:5432/TB_ADS
DB_USERNAME=postgres
DB_PASSWORD=sua-senha-local
JWT_SECRET=sua-chave-base64
```

Se `DB_URL` e `DB_USERNAME` nao forem informadas, o backend usa os valores locais acima. A senha do banco deve ser informada por `DB_PASSWORD`.

## Modulos ja mapeados

- `/auth/login`
- `/clientes`
- `/produtos`
- `/estoque`
- `/pedidos`
- `/caixas`
- `/financeiro`
- `/financeiro/follow-ups`
- `/logistica`
- `/notificacoes/estoque-baixo/enviar`
- `/notificacoes/follow-ups/enviar`
- `/notificacoes/resumo-diario/enviar`
- `/rotas-entrega`
- `/pedidos/follow-ups`
- `/usuarios`

## Notificacoes externas

O backend pode enviar follow-ups de cobranca e comerciais vencidos/para hoje para um webhook externo.
Por padrao fica desligado. Para ativar:

```bash
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_WEBHOOK_URL=https://seu-webhook.com/endpoint
NOTIFICATIONS_TOKEN=token-opcional
NOTIFICATIONS_FOLLOW_UP_CRON="0 0 8 * * *"
NOTIFICATIONS_STOCK_CRON="0 15 8 * * *"
NOTIFICATIONS_DAILY_SUMMARY_CRON="0 0 18 * * *"
```

O envio marca o follow-up como notificado para evitar repeticao automatica.
Para testar sem aguardar o agendamento, use `POST /notificacoes/follow-ups/enviar` com usuario `ADMIN` ou `GERENTE`.
No frontend, o mesmo disparo aparece no Financeiro em `Agenda de cobranca` e em Vendas no bloco `Follow-up comercial`, quando houver follow-up vencido ou de hoje.
Alertas de estoque baixo tambem podem ser enviados automaticamente pelo agendamento, manualmente por `POST /notificacoes/estoque-baixo/enviar`, ou pelo botao `Notificar` na aba Estoque.
Resumo diario pode ser enviado automaticamente pelo agendamento ou manualmente por `POST /notificacoes/resumo-diario/enviar`.

## Validacao rapida

```bash
npm run build
```

```bash
cd backend/projectoads/projectoads
mvn -DskipTests compile
```

## Caixa / PDV

- `ADMIN`, `GERENTE`, `VENDEDOR` e `OPERADOR_CAIXA` podem abrir e operar caixa.
- `FINANCEIRO` pode visualizar o modulo Caixa.
- `OPERADOR_CAIXA` acessa apenas o modulo Caixa.
- Movimentacoes manuais incluem `PAGAMENTO_RECEBIDO`, `SUPRIMENTO` e `SANGRIA`.
- Vendas finalizadas registram movimento `VENDA` automaticamente no caixa aberto do operador.
- Se nao houver caixa aberto, a finalizacao da venda e bloqueada ate abrir caixa.
