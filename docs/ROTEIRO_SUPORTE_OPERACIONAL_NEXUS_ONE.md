# Roteiro de Suporte Operacional - Nexus One

Este roteiro ajuda suporte e implantacao a responder problemas comuns sem depender de improviso.

Politica de SLA: `docs/POLITICA_SLA_SUPORTE_NEXUS_ONE.md`.
Handoff comercial/implantacao/suporte: `docs/CHECKLIST_HANDOFF_COMERCIAL_IMPLANTACAO_SUPORTE_NEXUS_ONE.md`.
Comunicacao de incidente/status: `docs/PLAYBOOK_COMUNICACAO_INCIDENTE_STATUS_NEXUS_ONE.md`.
Base de conhecimento/FAQ: `docs/BASE_CONHECIMENTO_SUPORTE_CLIENTE_NEXUS_ONE.md`.

Para abrir ficha de incidente:

```powershell
.\scripts\gerar-incidente-suporte.ps1 -Cliente "Cliente" -Modulo "Caixa" -Prioridade P1 -Resumo "Erro ao fechar caixa" -Responsavel "Suporte"
```

Para gerar comunicado ao cliente:

```powershell
.\scripts\gerar-comunicado-incidente-status.ps1 -Cliente "Cliente" -Tipo "Abertura" -Prioridade P1 -Modulo "Caixa" -Impacto "Erro ao fechar caixa"
```

Para registrar artigo de base de conhecimento:

```powershell
.\scripts\gerar-artigo-base-conhecimento.ps1 -Titulo "Como fechar caixa com divergencia" -Modulo "Caixa" -Publico "Operador de Caixa"
```

## Prioridade

- P0: sistema indisponivel, perda de dados, caixa travado, emissao fiscal real bloqueada.
- P1: venda, caixa, financeiro ou fiscal com erro que impede operacao do dia.
- P2: relatorio incorreto, permissao incorreta, problema visual que atrapalha uso.
- P3: melhoria, duvida operacional, ajuste de layout ou treinamento.

## Coleta Inicial

- Conferir handoff recebido da implantacao.
- Conferir plano, SLA, modulos contratados e pendencias aceitas.
- Empresa e filial.
- Usuario afetado.
- Modulo.
- Data/hora do erro.
- Passo a passo para reproduzir.
- Print da tela.
- Mensagem de erro.
- Pedido, caixa, lancamento ou documento fiscal envolvido.

## Verificacoes Rapidas

### Login e Permissoes

- Confirmar perfil do usuario.
- Conferir se usuario esta ativo e nao bloqueado.
- Conferir permissoes manuais.
- Conferir auditoria de mudanca recente.

### Caixa

- Confirmar se ha caixa aberto.
- Conferir operador.
- Conferir forma de pagamento.
- Conferir divergencia no fechamento.
- Gerar comprovante para conciliacao.

### Venda

- Conferir status do pedido.
- Conferir itens e estoque.
- Conferir cliente e filial.
- Conferir pagamento.
- Conferir fiscal/logistica quando esperado.

### Estoque

- Conferir saldo atual.
- Conferir estoque minimo.
- Conferir entradas/baixas recentes.
- Conferir se venda baixou estoque.

### Financeiro

- Conferir tipo: receita/despesa.
- Conferir status: pendente/aprovado.
- Conferir vencimento.
- Conferir conciliacao com venda/caixa.

### Fiscal

- Confirmar ambiente: mock, homologacao ou producao.
- Conferir CNPJ, serie, certificado e provedor.
- Conferir retorno do provedor/SEFAZ/municipio.
- Nunca liberar emissao real sem aceite fiscal.

### Infraestrutura

- Conferir backend em `8081`.
- Conferir frontend.
- Conferir PostgreSQL.
- Conferir espaco em disco.
- Conferir ultimo backup.

## Encerramento

- Registrar causa raiz.
- Registrar acao aplicada.
- Registrar se houve impacto financeiro/fiscal.
- Registrar orientacao dada ao cliente.
- Se for recorrente, transformar em tarefa de melhoria.
- Se for duvida recorrente, transformar em artigo de base de conhecimento.
- Se virar melhoria de produto, gerar priorizacao com `scripts/gerar-priorizacao-roadmap.ps1`.
- Arquivar ficha de incidente quando houver P0, P1 ou impacto financeiro/fiscal.
- Arquivar comunicado externo quando houver P0/P1, indisponibilidade, manutencao ou impacto percebido pelo cliente.
