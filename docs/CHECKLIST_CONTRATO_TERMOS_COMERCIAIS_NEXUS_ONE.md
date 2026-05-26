# Checklist de Contrato e Termos Comerciais - Nexus One

Data de referencia: 10/05/2026

Este checklist ajuda a revisar proposta, contrato ou aceite comercial antes de liberar piloto pago, producao controlada ou producao comercial. Ele nao substitui revisao juridica, mas reduz risco de venda com escopo, SLA, preco, dados, integracoes ou cancelamento mal definidos.

## Quando Usar

- Antes de assinar contrato ou aceitar proposta paga.
- Antes de iniciar implantacao paga.
- Antes de liberar producao controlada paga.
- Quando houver plano personalizado, desconto, cortesia, integracao externa ou SLA especial.
- Em renovacao, reajuste, upgrade, downgrade, pausa ou cancelamento.

## Checklist Minimo

- [ ] Cliente, CNPJ/identificacao e responsavel decisor registrados.
- [ ] Plano contratado definido como Starter, Business, Enterprise ou Personalizado.
- [ ] Codigo tecnico do plano registrado quando aplicavel: `STARTER`, `BUSINESS` ou `ENTERPRISE`.
- [ ] Mensalidade, implantacao, vencimento e inicio de cobranca definidos.
- [ ] Limites de usuarios, filiais, caixas, empresas e modulos documentados.
- [ ] Limites de produtos, notas fiscais e adicionais documentados.
- [ ] Adicionais, opcionais e fora do escopo separados.
- [ ] Data de inicio de cobranca e regra de reajuste registradas.
- [ ] Forma de pagamento e consequencia de atraso definidas.
- [ ] SLA e suporte coerentes com `docs/POLITICA_SLA_SUPORTE_NEXUS_ONE.md`.
- [ ] Dados, LGPD, backup, retencao e exportacao descritos.
- [ ] Integracoes externas condicionadas a homologacao e provedor/canal do cliente.
- [ ] Fiscal real condicionado a certificado, contador, credenciamento e homologacao oficial.
- [ ] Treinamento, implantacao e aceite operacional definidos.
- [ ] Renovacao, cancelamento, pausa e offboarding definidos.
- [ ] Uso de nome/logo/depoimento/caso condicionado a autorizacao especifica.
- [ ] Riscos e dependencias comunicados sem promessa indevida.

## Limites Que Devem Entrar no Contrato

| Limite | Starter | Business | Enterprise |
| --- | --- | --- | --- |
| Empresas | 1 | 1 | Conforme contrato |
| Filiais | 1 | Ate 3 | Conforme contrato |
| Usuarios | Ate 3 | Ate 8 | 15+ ou conforme contrato |
| Caixas/PDV | 1 | Ate 3 | Conforme contrato |
| Produtos | Ate 500 sugerido | Ate 5.000 sugerido | Conforme contrato |
| Fiscal real | Adicional/limitado | Homologado conforme escopo | Homologado conforme contrato |
| Logistica | Nao incluida | Simples | Completa conforme escopo |
| Suporte | Padrao | Prioritario horario comercial | Prioritario/assistido conforme contrato |

## Itens Contratados e Condicionados

Marque como "contratado e condicionado" quando o cliente comprou o direito comercial, mas o uso real depende de evidencia:

- Fiscal real depende de certificado, contador, credenciamento, provedor, SEFAZ/municipio e homologacao.
- Pix/boleto real depende de provedor, conta do cliente, token e conciliacao ponta a ponta.
- Notificacoes dependem de canal real, token, webhook e aceite do cliente.
- Integracao externa depende de API, chave, ambiente de teste e homologacao.
- Producao ampla depende de Go/No-Go, aceite, backup, monitoramento, suporte e score F4.

## Clausulas que Precisam de Atencao

| Tema | Risco se faltar |
| --- | --- |
| Escopo e limites | Cliente espera modulos, usuarios ou filiais nao contratados |
| Integracoes | Venda promete Pix, boleto, fiscal ou notificacao sem homologacao |
| SLA | Suporte assume prazo maior que a operacao consegue cumprir |
| Dados/LGPD | Exportacao, retencao ou exclusao fica indefinida |
| Cancelamento | Offboarding, acessos e cobranca final ficam sem regra |
| Reajuste/desconto | Receita recorrente fica presa em condicao informal |
| Aceite | Cliente usa producao sem marco formal de responsabilidade |
| Upgrade/downgrade | Cliente muda plano sem impacto de limites documentado |
| Adicionais | Recurso extra vira obrigacao sem cobranca recorrente |

## Decisao

- Aprovado: contrato/proposta pode seguir para faturamento e implantacao.
- Aprovado com ressalvas: registrar ressalvas e responsavel antes do Go/No-Go.
- Bloqueado: corrigir contrato/proposta antes de iniciar operacao paga.

## Evidencias a Arquivar

- Proposta/contrato/aceite comercial aprovado.
- Escopo do plano.
- Faturamento do cliente.
- Qualificacao da oportunidade, quando aplicavel.
- Checklist contratual gerado por `scripts/gerar-checklist-contrato-comercial.ps1`.
- Termo de aceite de implantacao/Go-No-Go, quando houver producao controlada.

## Gerador

```powershell
.\scripts\gerar-checklist-contrato-comercial.ps1 -Cliente "Cliente Piloto" -Plano "Business" -ValorMensalidade 349 -ValorImplantacao 1200 -UsuariosContratados 8 -FiliaisContratadas 3 -CaixasContratados 3
```

Arquive o relatorio em `reports\comercial` junto da proposta, escopo e faturamento.
