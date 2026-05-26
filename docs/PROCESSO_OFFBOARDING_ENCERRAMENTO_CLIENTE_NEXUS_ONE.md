# Processo de Offboarding e Encerramento de Cliente - Nexus One

Data de referencia: 10/05/2026

Este processo orienta o encerramento seguro de cliente, incluindo motivo de saida, exportacao ou retencao de dados, bloqueio de acessos, pendencias financeiras, integracoes e confirmacao final. Ele deve ser usado quando houver cancelamento, fim de piloto nao convertido, pausa longa com encerramento operacional ou troca para outro fornecedor.

## Quando Usar

- Cliente solicitou cancelamento.
- Piloto gratuito ou pago terminou sem conversao.
- Cliente ficou inadimplente e houve decisao formal de encerramento.
- Contrato terminou e nao foi renovado.
- Cliente vai migrar para outro sistema.
- Ambiente de homologacao com dados reais sera encerrado.

## Checklist de Encerramento

- [ ] Motivo do encerramento registrado.
- [ ] Decisor do cliente confirmou a solicitacao.
- [ ] Data efetiva de encerramento definida.
- [ ] Faturamento final, multa, saldo ou credito revisado.
- [ ] Exportacao de dados combinada quando aplicavel.
- [ ] Obrigacoes fiscais/contabeis avaliadas antes de excluir ou anonimizar dados.
- [ ] Backups e retencao definidos conforme contrato, contador e LGPD.
- [ ] Usuarios e acessos externos bloqueados na data combinada.
- [ ] Webhooks, tokens, certificados e integracoes do cliente desativados ou removidos.
- [ ] Pendencias de suporte e implantacao encerradas ou documentadas.
- [ ] Autorizacao de referencia comercial revogada ou mantida conforme decisao do cliente.
- [ ] Confirmacao final enviada ao cliente.

## Tipos de Saida

| Tipo | Conduta recomendada |
| --- | --- |
| Cancelamento voluntario | Registrar causa, exportar dados se contratado e encerrar acesso na data combinada |
| Nao conversao de piloto | Arquivar aprendizado, remover dados reais e encerrar ambiente |
| Inadimplencia | Seguir acordo comercial antes de suspender/encerrar definitivamente |
| Migração para outro sistema | Combinar exportacoes, prazo de acesso e suporte de transicao |
| Pausa operacional longa | Formalizar se e pausa com retorno ou cancelamento efetivo |

## Go de Encerramento

Antes de concluir offboarding, confirmar:

- [ ] Decisor autorizado confirmou o encerramento.
- [ ] Retencao, exportacao, anonimizacao ou exclusao de dados foi definida.
- [ ] Obrigacoes fiscais/contabeis foram validadas com cliente/contador quando aplicavel.
- [ ] Financeiro revisou saldo, credito, multa, inadimplencia ou ultima cobranca.
- [ ] Acessos, tokens, webhooks, certificados e integracoes possuem data de bloqueio/remocao.
- [ ] Base de conhecimento, suporte e incidentes foram encerrados ou transferidos.
- [ ] Aprendizado comercial/produto foi registrado.

## Dados, LGPD e Retencao

- Dados fiscais e contabeis podem exigir retencao legal, validada pelo cliente/contador.
- Exclusao, anonimizacao, portabilidade ou informacao deve seguir `docs/POLITICA_PRIVACIDADE_LGPD_NEXUS_ONE.md`.
- Backups com dados do cliente devem respeitar prazo contratual e politica de retencao.
- Exportacoes devem ser feitas apenas para responsavel autorizado.
- Dados de demonstracao ou piloto sem conversao devem ser removidos ou anonimizados quando nao houver obrigacao de retencao.

## Plano de Dados

| Item | Decisao | Responsavel | Prazo | Evidencia |
| --- | --- | --- | --- | --- |
| Exportacao | Entregar / dispensar / nao aplicavel |  |  |  |
| Retencao | Manter conforme contrato / fiscal / backup |  |  |  |
| Anonimizacao | Executar / nao aplicavel |  |  |  |
| Exclusao | Executar quando permitido / bloquear |  |  |  |

## Acessos e Integracoes

Encerrar ou revisar:

- Usuarios do cliente.
- Usuarios internos com acesso ao ambiente do cliente.
- Tokens de API, webhooks e notificacoes.
- Credenciais Asaas, fiscal, e-mail, WhatsApp ou provedor externo.
- Certificados digitais e arquivos sensiveis.
- Rotinas de backup/monitoramento especificas do cliente.
- Permissao de uso de nome, logo, depoimento ou caso comercial.

## Aprendizado de Saida

Registrar para melhorar venda, produto e suporte:

- Motivo principal da saida:
- Concorrente ou alternativa escolhida:
- Falha de produto, atendimento, preco, fit, implantacao ou expectativa:
- O que poderia ter retido o cliente:
- Se o caso deve virar roadmap, base de conhecimento, treinamento ou ajuste comercial:

## Evidencias a Arquivar

- Registro de renovacao/retencao com decisao `Cancelar`, quando houver.
- Relatorio de offboarding gerado por `scripts/gerar-offboarding-cliente.ps1`.
- Solicitacao LGPD gerada por `scripts/gerar-solicitacao-lgpd.ps1`, quando houver acesso, exclusao, anonimização ou portabilidade.
- Comunicacao final enviada ao cliente.
- Evidencia de bloqueio de acessos.
- Evidencia de exportacao/entrega de dados, quando aplicavel.
- Baixa financeira ou pendencia final documentada.
- Registro de aprendizado de saida.

## Bloqueios

Nao concluir encerramento se:

- Houver duvida sobre quem autorizou o cancelamento.
- Existirem dados fiscais/contabeis com retencao legal indefinida.
- Exportacao contratada ainda nao tiver sido entregue.
- Acesso do cliente permanecer ativo sem justificativa.
- Tokens, webhooks ou certificados do cliente continuarem ativos sem necessidade.
- Faturamento final, credito, multa ou inadimplencia estiver sem decisao.
- Uso de nome/logo/depoimento/caso comercial nao tiver sido revogado ou confirmado.

## Gerador

```powershell
.\scripts\gerar-offboarding-cliente.ps1 -Cliente "Cliente Piloto" -Motivo "Cancelamento solicitado pelo decisor" -DataEncerramento "31/05/2026"
```

Arquive o relatorio em `reports\sucesso-cliente` junto dos registros de renovacao/retencao, faturamento e LGPD.
