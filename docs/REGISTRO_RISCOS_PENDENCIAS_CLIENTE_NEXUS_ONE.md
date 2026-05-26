# Registro de Riscos e Pendencias por Cliente - Nexus One

Data de referencia: 10/05/2026

Este registro deve ser usado durante demonstracao avancada, piloto assistido, homologacao e producao controlada. Ele centraliza riscos, pendencias, responsaveis, prazos e decisao de liberacao.

## Identificacao

- Cliente:
- CNPJ:
- Ambiente: demonstracao / homologacao / piloto assistido / producao controlada / producao
- Plano contratado:
- Responsavel Nexus One:
- Responsavel do cliente:
- Data de abertura:
- Data da ultima revisao:

## Classificacao de Severidade

| Severidade | Significado | Efeito na liberacao |
| --- | --- | --- |
| Bloqueante | Impede producao controlada ou producao ampla | No-go ate corrigir ou reclassificar formalmente |
| Alta | Afeta fluxo importante, mas pode ter contorno operacional | Exige responsavel, prazo e ciencia do cliente |
| Media | Afeta produtividade, relatorio ou experiencia | Pode seguir se registrada e planejada |
| Baixa | Ajuste, texto, refinamento ou melhoria futura | Nao bloqueia entrega |

## Areas de Risco

- Comercial/escopo.
- Deploy/infraestrutura.
- Banco/backup/restauracao.
- Segredos/seguranca.
- LGPD/dados reais.
- Vendas/caixa/estoque/financeiro.
- Fiscal/pagamentos/notificacoes.
- Treinamento/operacao assistida.
- Suporte/SLA.
- Relatorios/auditoria/permissoes.

## Ciclo de Tratamento

| Etapa | Quando usar | Saida esperada |
| --- | --- | --- |
| Abrir | Risco, pendencia ou promessa sem evidencia identificada | ID, area, severidade, responsavel e prazo |
| Classificar | Antes de decidir Go/No-Go ou aceite | Bloqueante, alta, media ou baixa |
| Definir contorno | Quando nao ha correcao imediata, mas existe alternativa operacional | Contorno documentado e aceito |
| Reclassificar | Quando evidencia reduz ou aumenta impacto | Nova severidade e motivo |
| Aceitar risco | Quando cliente e Nexus One concordam em seguir com pendencia nao bloqueante | Ciencia formal do cliente |
| Fechar | Quando evidencia comprova resolucao | Evidencia anexada ao pacote de entrega |

## Registro

| ID | Area | Descricao | Severidade | Status | Responsavel | Prazo | Contorno | Evidencia/observacao |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R001 | Deploy | Servidor definitivo ainda nao validado | Bloqueante | Aberto |  |  |  |  |
| R002 | Backup | Restauracao ainda nao testada com evidencia | Bloqueante | Aberto |  |  |  |  |
| R003 | Integracoes | Pagamento/notificacao/fiscal real sem homologacao oficial | Alta | Aberto |  |  |  |  |

Status permitidos:

- Aberto.
- Em tratamento.
- Aguardando cliente.
- Aguardando terceiro.
- Reclassificado.
- Aceito pelo cliente.
- Resolvido.
- Cancelado.

## Regras de Decisao

- Producao controlada nao deve ser liberada com pendencia bloqueante aberta.
- Pendencia alta pode seguir apenas com responsavel, prazo, contorno e ciencia do cliente.
- Pendencia media/baixa deve entrar no plano de acao, mas nao impede aceite se o fluxo contratado estiver operacional.
- Integracao externa vendida como producao precisa de evidencia real arquivada.
- Fiscal real precisa de validacao com contador/provedor/SEFAZ/municipio conforme o escopo.
- Dados reais exigem responsavel de privacidade e politica LGPD comunicada.
- Risco aceito pelo cliente nao pode contradizer item bloqueante de seguranca, LGPD, fiscal real ou pagamento real vendido como ativo.
- Pendencia aceita precisa constar no termo de aceite quando impactar uso, suporte, integracao ou prazo.

## Revisao para Go/No-Go

Antes de preencher `docs/MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md`, conferir:

- [ ] Nao ha pendencia bloqueante aberta.
- [ ] Pendencias altas possuem responsavel e prazo.
- [ ] Dependencias externas foram classificadas como homologadas, sandbox ou fora do escopo.
- [ ] Cliente aceitou formalmente pendencias nao bloqueantes.
- [ ] Evidencias obrigatorias foram anexadas ao pacote de entrega.

## Plano de Acao

| Prioridade | Acao | Responsavel | Prazo | Evidencia esperada |
| --- | --- | --- | --- | --- |
| P0 | Corrigir pendencia bloqueante |  |  |  |
| P1 | Definir contorno para pendencia alta |  |  |  |
| P2 | Planejar pendencias medias/baixas |  |  |  |

## Aceite de Pendencia Nao Bloqueante

Usar apenas quando a operacao principal estiver segura.

- Pendencia:
- Severidade:
- Contorno:
- Prazo:
- Impacto comunicado ao cliente:
- Cliente aceita seguir: sim / nao
- Registrar no termo de aceite: sim / nao

## Encerramento

- Total de pendencias bloqueantes abertas:
- Total de pendencias altas abertas:
- Total de pendencias medias/baixas abertas:
- Decisao: Go demonstracao / Go piloto / Go producao controlada / Go producao ampla / No-go
- Observacao final:
- Assinatura Nexus One:
- Assinatura cliente:

## Gerador

Use:

```powershell
.\scripts\gerar-registro-riscos-pendencias.ps1 -Cliente "Cliente" -Ambiente "producao controlada" -Responsavel "Nexus One"
```

O arquivo gerado deve ser arquivado junto do pacote de entrega e revisado antes do Go/No-Go.
