# Roteiro de Smoke Test Operacional - Nexus One

Este roteiro valida se o ambiente publicado esta minimamente pronto para uso depois de deploy, release ou restauracao de backup.

## Quando Rodar

- Depois de subir producao.
- Depois de atualizar release.
- Depois de rollback.
- Depois de restaurar backup.
- Antes de entregar ambiente para cliente piloto.

## Smoke Test Via API

Rodar com usuario operacional ou admin:

```powershell
.\scripts\smoke-test-operacional.ps1 -BaseUrl http://localhost:8081 -Login admin -Senha "senha" -EnvironmentName producao
```

O relatorio e salvo em `reports` e nao grava senha nem token.

## O Que Ele Valida

- Backend `/health`.
- Login e emissao de token.
- Produtos/estoque.
- Pedidos/vendas.
- Caixa.
- Financeiro.
- Usuarios/admin, quando o perfil permitir.

Respostas `403` em areas restritas viram aviso quando o perfil usado nao tem permissao. Falhas de login, backend fora e erro em modulo critico bloqueiam a entrega.

## Checklist Manual Complementar

- Abrir frontend.
- Entrar com usuario operacional.
- Criar venda simples.
- Abrir/consultar caixa.
- Conferir estoque do produto usado.
- Conferir financeiro/resumo.
- Exportar um relatorio.
- Conferir central de alertas.
- Registrar evidencia no manifesto de release.

## Criterio de Aprovacao

- Smoke test sem falha critica.
- Frontend acessivel.
- Login validado.
- Pelo menos um fluxo operacional principal validado.
- Relatorio salvo em `reports`.
- Pendencias registradas com responsavel e prazo.
