# Modelo de Proposta Comercial Controlada - Nexus One

Use este modelo para vender demonstracao, piloto assistido ou producao controlada sem prometer recursos que ainda dependem de homologacao externa.

## Posicionamento

O Nexus One esta liberado para demonstracao comercial e piloto assistido. A producao controlada pode ser contratada quando deploy, banco, backup, monitoramento, smoke test, Go/No-Go e aceite estiverem aprovados.

Antes de gerar proposta, qualificar a oportunidade com `docs/PLAYBOOK_COMERCIAL_QUALIFICACAO_NEXUS_ONE.md` e arquivar o score gerado por `scripts/gerar-qualificacao-oportunidade.ps1`. Proposta sem dor clara, decisor, responsaveis e escopo minimo deve voltar para diagnostico.

Para limites de plano, valores sugeridos, adicionais e recursos por faixa, usar `docs/MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md`.

Para proposta aprovada, registrar tambem o faturamento do cliente com `docs/PROCESSO_FATURAMENTO_CLIENTE_NEXUS_ONE.md` e `scripts/gerar-faturamento-cliente.ps1`.

Antes da assinatura ou aceite pago, revisar contrato/termos comerciais com `docs/CHECKLIST_CONTRATO_TERMOS_COMERCIAIS_NEXUS_ONE.md` e gerar evidencia com `scripts/gerar-checklist-contrato-comercial.ps1`.

Quando o cliente pedir justificativa financeira, usar `docs/FICHA_ROI_VALOR_PERCEBIDO_NEXUS_ONE.md` e `scripts/gerar-roi-valor-percebido.ps1` como estimativa conservadora, sem prometer resultado garantido.

Quando a proposta precisar circular com diretoria ou dono da empresa, gerar o resumo executivo em `docs/ONE_PAGE_COMERCIAL_DECISOR_NEXUS_ONE.md` com `scripts/gerar-onepage-comercial-decisor.ps1`.

Antes de iniciar implantacao, faturamento ou producao controlada, registrar a decisao em `docs/ATA_FECHAMENTO_COMERCIAL_NEXUS_ONE.md` com `scripts/gerar-ata-fechamento-comercial.ps1`.

## Tipo de Oferta

Use uma das opcoes abaixo na proposta para deixar claro o compromisso comercial assumido.

| Oferta | Quando usar | Entrega principal | Marco de conclusao |
| --- | --- | --- | --- |
| Demonstracao comercial | Cliente ainda avaliando valor | Apresentacao guiada com dados de exemplo | Proximo passo comercial definido |
| Piloto assistido | Cliente quer testar com operacao acompanhada | Uso controlado por prazo, usuarios e modulos definidos | Relatorio do piloto e decisao Go/No-Go |
| Producao controlada | Cliente ja aprovou escopo e quer operar com dados reais | Ambiente real com suporte proximo e aceite formal | Termo de aceite e saude do cliente Verde |

Para venda inicial, priorizar Piloto assistido ou Producao controlada. Evitar proposta de producao ampla antes de evidencias reais e aceite.

## Condicoes de Entrada da Proposta

- Cliente tem responsavel decisor e responsavel operacional definidos.
- Dor principal, ganho esperado e processo atual foram registrados.
- Plano comercial sugerido foi escolhido com limites de usuarios, filiais, caixas e modulos.
- Integracoes externas foram classificadas como inclusas, condicionadas, adicionais ou fora do escopo.
- Dependencias do cliente foram comunicadas: dados, certificado, contador, conta de pagamento, canal de notificacao e disponibilidade de usuarios.
- Implantacao, treinamento, suporte, vencimento e inicio de cobranca foram definidos.
- Go/No-Go comercial indica ao menos G1 aprovado para piloto controlado.

## Escopo Base

- Vendas, pedidos, propostas, CRM e separacao.
- Caixa/PDV, recebimentos, sangria, suprimento, fechamento e conciliacao.
- Clientes, historico comercial e follow-up.
- Estoque, compras, inventario, etiquetas e alertas.
- Financeiro gerencial, contas, cobrancas, DRE, conciliacao e fluxo.
- Relatorios, BI operacional, exportacoes e indicadores.
- Usuarios, permissoes, auditoria e suporte.
- Fiscal controlado/homologacao conforme escopo contratado.

## Condicoes Para Producao Controlada

- Deploy definitivo executado e validado.
- Banco de producao provisionado.
- Backup agendado e restauracao testada com evidencia.
- Monitoramento externo com alerta testado.
- Segredos auditados e protegidos.
- Smoke test operacional aprovado.
- Matriz Go/No-Go preenchida sem pendencia bloqueante.
- Termo de aceite assinado.

## Entregaveis da Implantacao Comercial

| Entregavel | Obrigatorio | Observacao |
| --- | --- | --- |
| Proposta/aceite aprovado | Sim | Deve conter plano, valores, limites e prazo |
| Ficha de diagnostico | Sim | Base para escopo e carga inicial |
| Handoff comercial para implantacao | Sim | Evita promessa sem transferencia interna |
| Cronograma de implantacao | Sim | Datas, responsaveis e janelas de validacao |
| Carga inicial | Conforme escopo | Planilhas simples inclusas; carga complexa pode ser adicional |
| Treinamento por perfil | Sim | Pelo menos usuarios-chave |
| Operacao assistida | Sim para piloto/producao controlada | Registrar diario e pendencias |
| Termo de aceite | Sim para producao controlada | Marco para faturamento regular e suporte |

## Integracoes Condicionadas

| Recurso | Condicao de venda |
| --- | --- |
| Pix/boleto real | Homologacao Asaas ponta a ponta com webhook e baixa validada |
| Notificacoes externas | Canal real, webhook/token e evidencia de envio |
| Fiscal real | Certificado, credenciamento, contador, provedor/SEFAZ/municipio e homologacao oficial |
| Monitoramento externo | Webhook/canal real de alerta testado |

## Nao Prometer Sem Evidencia

- Emissao fiscal oficial sem homologacao por cliente/filial/modelo.
- Pagamento real sem retorno e conciliacao validados.
- Notificacao real sem canal do cliente testado.
- Producao ampla sem ciclos reais assistidos.
- SLA superior ao definido em `docs/POLITICA_SLA_SUPORTE_NEXUS_ONE.md`.

## Modelo de Texto Comercial

O Nexus One sera implantado em regime de piloto assistido/producao controlada, com acompanhamento tecnico e operacional. Os modulos base ficam disponiveis conforme escopo contratado. Integracoes externas, fiscais e financeiras reais serao liberadas conforme homologacao, evidencias e aceite formal.

O plano comercial contratado deve constar na proposta com limites de usuarios, filiais, caixas, suporte, modulos incluidos, adicionais e dependencias externas.

A proposta aprovada deve indicar mensalidade, implantacao, vencimento, forma de pagamento, inicio de cobranca, condicoes especiais e status de faturamento.

Contrato, proposta ou aceite nao deve prometer SLA, integracao, fiscal real, customizacao ou uso de referencia comercial fora dos processos documentados.

Qualquer ROI ou economia citada deve indicar premissas e deixar claro que o resultado depende da operacao real do cliente.

## Texto de Fechamento Recomendado

Esta proposta libera o Nexus One em regime controlado, com escopo, limites e acompanhamento definidos. O objetivo e colocar a operacao do cliente em uso real com seguranca, validar os fluxos principais e transformar o piloto em producao comercial somente apos aceite, evidencias e ausencia de pendencias bloqueantes.

Recursos de terceiros, emissao fiscal oficial, meios de pagamento reais e notificacoes externas dependem de credenciais, provedores, homologacao e colaboracao do cliente. Esses itens serao ativados apenas quando a evidencia de validacao estiver registrada.

## Checklist Antes de Enviar ao Cliente

- [ ] Oferta marcada como Demonstracao, Piloto assistido ou Producao controlada.
- [ ] Plano comercial e limites anexados.
- [ ] Valores, implantacao, vencimento e forma de pagamento definidos.
- [ ] Modulos inclusos e opcionais separados.
- [ ] Integracoes condicionadas descritas.
- [ ] SLA coerente com a politica de suporte.
- [ ] Dependencias do cliente listadas.
- [ ] Criterio de aceite e prazo do piloto informados.
- [ ] Proximos passos apos aceite definidos.

## Gerador

```powershell
.\scripts\gerar-proposta-comercial-controlada.ps1 -Cliente "Cliente" -Plano "Piloto assistido" -Responsavel "Responsavel"
```

Para gerar o anexo de escopo por plano:

```powershell
.\scripts\gerar-escopo-plano-comercial.ps1 -Cliente "Cliente" -Plano "Medio" -Responsavel "Responsavel"
```

Para gerar um resumo de uma pagina para decisor:

```powershell
.\scripts\gerar-onepage-comercial-decisor.ps1 -Cliente "Cliente" -Decisor "Nome" -DorPrincipal "Controle de caixa e estoque" -Plano "Piloto assistido"
```

Para registrar a reuniao de fechamento:

```powershell
.\scripts\gerar-ata-fechamento-comercial.ps1 -Cliente "Cliente" -Decisor "Nome" -Decisao "Aprovar proposta" -ValorMensal 349 -Implantacao 1200
```
