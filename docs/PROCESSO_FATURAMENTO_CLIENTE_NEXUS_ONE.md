# Processo de Faturamento do Cliente - Nexus One

Data de referencia: 10/05/2026

Este processo define como transformar proposta aprovada em faturamento controlado, mensalidade recorrente, taxa de implantacao e evidencias comerciais. Ele evita cliente ativo sem plano registrado, vencimento indefinido, desconto informal ou cobranca fora do escopo.

## Quando Usar

- Apos proposta, contrato ou aceite comercial aprovado.
- Apos checklist de contrato/termos comerciais revisado quando houver contrato pago.
- Antes de iniciar implantacao paga.
- Antes de liberar producao controlada.
- Sempre que houver alteracao de plano, usuarios, filiais, modulos ou adicionais.
- Quando o cliente entrar em piloto pago, producao controlada ou producao comercial.
- Quando houver renovacao, reajuste, upgrade, downgrade, pausa ou cancelamento conforme `docs/PROCESSO_RENOVACAO_RETENCAO_CLIENTE_NEXUS_ONE.md`.

## Dados Obrigatorios

- Cliente e CNPJ/identificacao fiscal.
- Plano contratado: Basico, Medio, Avancado ou personalizado.
- Mensalidade contratada.
- Taxa de implantacao.
- Dia de vencimento.
- Data de inicio de cobranca.
- Forma de pagamento: Pix, boleto, transferencia, cartao ou outro.
- Periodicidade: mensal, trimestral, semestral ou anual.
- Modulos incluidos e adicionais cobrados separadamente.
- Responsavel comercial e responsavel financeiro.
- Condicao de reajuste, desconto ou isencao, se existir.
- Status da cobranca inicial e da primeira mensalidade.

## Regras Comerciais

- Toda cobranca deve estar vinculada a proposta, escopo ou aceite.
- Desconto deve ter prazo, responsavel e motivo registrado.
- Implantacao pode ser cobrada antes do go-live, conforme proposta.
- Mensalidade deve iniciar na data combinada, mesmo que o cliente esteja em producao controlada paga.
- Cliente em piloto gratuito deve ter data final e criterio de conversao registrados.
- Modulos adicionais, fiscal real, integracoes e treinamento extra devem ser cobrados conforme escopo.
- Inadimplencia deve seguir rotina do financeiro e suporte, sem bloqueio abrupto fora do combinado.

## Fluxo Recomendado

1. Arquivar proposta/escopo aprovado.
2. Gerar qualificacao comercial e confirmar plano contratado.
3. Registrar taxa de implantacao e mensalidade.
4. Definir vencimento, forma de pagamento e data de inicio.
5. Informar ao financeiro se havera Pix/boleto real, cobranca manual ou outro metodo.
6. Registrar descontos, cortesias ou adicionais.
7. Gerar o relatorio de faturamento do cliente.
8. Anexar o relatorio ao pacote de entrega.
9. Revisar no Go/No-Go se o faturamento esta coerente com o escopo liberado.

## Status de Faturamento

| Status | Uso |
| --- | --- |
| Aguardando aceite | Proposta enviada, sem aprovacao formal |
| Aguardando primeira cobranca | Aceite aprovado, cobranca inicial ainda nao emitida |
| Implantacao faturada | Taxa de implantacao emitida ou registrada |
| Mensalidade ativa | Cliente ja entrou em recorrencia |
| Piloto gratuito | Cliente em uso sem cobranca, com data limite definida |
| Suspenso financeiro | Pendencia financeira relevante, conforme politica acordada |
| Cancelado | Cliente encerrado ou nao convertido |

## Controle de Vencimento e Cobranca

| Marco | Acao |
| --- | --- |
| D-7 antes do vencimento | Conferir se cobranca esta emitida ou programada |
| D-3 antes do vencimento | Enviar lembrete quando aplicavel |
| Dia do vencimento | Confirmar pagamento ou baixa |
| D+3 apos vencimento | Registrar atraso pontual e acionar financeiro |
| D+7 apos vencimento | Classificar risco financeiro e comunicar responsavel comercial |
| D+15 apos vencimento | Avaliar suspensao financeira conforme contrato e sem bloqueio abrupto |

## Desconto, Cortesia e Condicao Especial

Registrar sempre:

- Motivo.
- Responsavel que aprovou.
- Prazo final.
- Valor cheio.
- Valor com desconto/cortesia.
- Regra de retorno ao valor normal.
- Se afeta implantacao, mensalidade, adicional ou suporte.

Desconto sem prazo definido deve ser tratado como risco de receita.

## Evidencias a Arquivar

- Proposta, contrato ou aceite comercial.
- Checklist de contrato/termos comerciais gerado por `scripts/gerar-checklist-contrato-comercial.ps1`, quando aplicavel.
- Escopo do plano gerado por `scripts/gerar-escopo-plano-comercial.ps1`.
- Qualificacao da oportunidade gerada por `scripts/gerar-qualificacao-oportunidade.ps1`, quando aplicavel.
- Relatorio de faturamento gerado por `scripts/gerar-faturamento-cliente.ps1`.
- Comprovante ou registro da primeira cobranca.
- Registro de desconto, cortesia ou condicao especial.
- Comunicacao enviada ao cliente sobre vencimento, forma de pagamento e inicio da recorrencia.
- Registro de atraso, renegociacao, suspensao ou baixa quando houver.

## Cuidados Antes de Comercializar em Escala

- Nao liberar muitos clientes sem controle de vencimento e status financeiro.
- Nao vender plano personalizado sem registrar limites e adicionais.
- Nao deixar piloto gratuito sem data de encerramento.
- Nao prometer integracao de pagamento real antes de homologar provedor/canal.
- Nao misturar aceite tecnico com aceite financeiro: ambos precisam existir quando o cliente for pago.
- Mudanca de plano, renovacao, reajuste, pausa ou cancelamento deve gerar registro em `scripts/gerar-renovacao-retencao-cliente.ps1`.
- Contrato bloqueado ou aprovado com ressalvas nao deve iniciar faturamento sem decisao formal.
- Cliente em atraso recorrente deve atualizar saude do cliente e risco de receita.
- Suspensao financeira deve respeitar contrato, comunicacao previa e dados/exportacao quando aplicavel.

## Bloqueios Financeiros

Nao iniciar ou ampliar cliente pago quando houver:

- Plano sem valor, vencimento ou forma de pagamento.
- Desconto/cortesia sem responsavel e prazo.
- Piloto gratuito sem data de fim.
- Status financeiro desconhecido.
- Integracao de Pix/boleto real prometida sem homologacao.
- Faturamento divergente do escopo contratado.

## Gerador

```powershell
.\scripts\gerar-faturamento-cliente.ps1 -Cliente "Cliente Piloto" -Plano "Medio" -Mensalidade 349 -Implantacao 1200 -DiaVencimento 10 -FormaPagamento "Pix"
```

O arquivo gerado deve ficar em `reports\comercial` e ser anexado ao pacote de entrega do cliente.
