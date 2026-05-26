# Ata de Fechamento Comercial - Nexus One

Use esta ata na reuniao final antes de proposta aprovada, piloto pago, producao controlada, upgrade ou renovacao. O objetivo e registrar decisao, objecoes, limites, promessas feitas e proximos passos antes de iniciar implantacao ou faturamento.

## Quando Usar

- Depois da demo, diagnostico, proposta ou one-page.
- Quando houver decisor presente.
- Antes de contrato pago, piloto pago ou producao controlada.
- Quando existirem objecoes comerciais relevantes.
- Em renovacao, upgrade, downgrade ou mudanca de escopo.

## Campos Obrigatorios

- Cliente e CNPJ/identificacao.
- Decisor e participantes.
- Plano, valor, implantacao e condicoes especiais.
- Dor principal confirmada.
- Escopo aprovado.
- Itens fora do escopo.
- Dependencias externas.
- Objecoes e respostas aceitas.
- Riscos comerciais ou tecnicos reconhecidos.
- Proximo passo, data e responsavel.

## Decisoes Possiveis

| Decisao | Uso |
| --- | --- |
| Aprovar proposta | Cliente aceitou escopo, valor e condicoes |
| Avancar para piloto | Cliente precisa validar operacao antes de producao |
| Avancar para producao controlada | Cliente aprovou escopo e requisitos minimos |
| Voltar para diagnostico | Dor, decisor, dados ou escopo ainda estao incompletos |
| Pausar oportunidade | Cliente sem momento, verba, decisor ou fit |
| Encerrar oportunidade | Sem fit comercial ou risco alto demais |

## Regras de Seguranca Comercial

- Toda concessao precisa ficar registrada.
- Toda integracao externa precisa indicar dependencia e responsavel.
- Toda promessa de prazo precisa depender de dados, acessos e aceite do cliente.
- ROI deve ser citado como estimativa, nao garantia.
- Fiscal real, Pix/boleto real, notificacoes reais e SLA especial exigem evidencias e contrato.

## Evidencias Recomendadas

- Qualificacao comercial.
- One-page para decisor.
- ROI/valor percebido.
- Proposta controlada.
- Checklist de contrato/termos comerciais.
- Faturamento do cliente, quando aprovado.
- Handoff comercial/implantacao/suporte.

## Gerador

```powershell
.\scripts\gerar-ata-fechamento-comercial.ps1 -Cliente "Cliente" -Decisor "Nome" -Decisao "Aprovar proposta" -ValorMensal 349 -Implantacao 1200
```
