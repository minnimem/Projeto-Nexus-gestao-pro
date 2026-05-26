# One-Page Comercial Para Decisor - Nexus One

Use este material depois da qualificacao, demo ou diagnostico para enviar uma visao executiva curta ao decisor. O objetivo e facilitar decisao comercial sem substituir proposta, contrato, ROI, Go/No-Go ou aceite.

## Quando Usar

- Cliente ja tem dor clara e decisor identificado.
- Depois de uma demonstracao comercial ou reuniao de diagnostico.
- Antes de proposta formal, quando o cliente pediu resumo executivo.
- Em renovacao, upgrade ou defesa de preco.
- Quando a venda precisa circular internamente no cliente.

## Estrutura Recomendada

### 0. Resumo Executivo

Abrir com 4 linhas no maximo:

- Cliente:
- Decisor:
- Oferta recomendada: Demonstracao / Piloto assistido / Producao controlada
- Decisao solicitada: aprovar proximo passo, proposta ou inicio de implantacao

### 1. Dor Principal

Registrar em uma frase o problema de negocio que o Nexus One resolve primeiro.

Exemplos:

- Reduzir retrabalho entre venda, caixa, estoque e financeiro.
- Controlar recebimentos, divergencias de caixa e inadimplencia.
- Substituir planilhas por uma rotina operacional auditavel.
- Centralizar estoque, compras, vendas e relatorios em um unico fluxo.

### 2. Proposta de Valor

Explicar o ganho esperado de forma objetiva, sem promessa absoluta.

- Operacao mais controlada.
- Menos retrabalho manual.
- Melhor visibilidade de caixa, estoque e financeiro.
- Implantacao acompanhada por piloto/producao controlada.
- Evolucao comercial segura, com escopo e aceite.

### 3. Escopo Inicial

Indicar somente o que sera entregue nesta primeira etapa:

- Modulos incluidos.
- Usuarios, filiais e caixas previstos.
- Integracoes condicionadas a homologacao.
- Limites do plano e adicionais.
- O que fica fora ate nova validacao.

### 4. Investimento e Condicao Comercial

Mostrar a decisao financeira sem excesso de detalhe:

- Plano sugerido:
- Mensalidade:
- Implantacao:
- Vencimento:
- Condicao especial, se houver:
- Inicio de cobranca:

Quando o cliente comparar preco, anexar ou citar ROI conservador com premissas claras.

### 5. Riscos Controlados

Explicar que a implantacao sera feita com protecao operacional:

- Piloto assistido ou producao controlada antes de escala ampla.
- Go/No-Go antes de virar producao comercial.
- Integracoes externas liberadas somente apos homologacao.
- Fiscal real condicionado a certificado, contador, credenciamento e provedor.
- Aceite formal antes de encerrar implantacao.

### 6. Evidencias Comerciais

Anexar ou citar quando existir:

- Qualificacao da oportunidade.
- Plano de demonstracao executado.
- Posicionamento competitivo.
- ROI/valor percebido conservador.
- Proposta controlada.
- Checklist contratual.

### 7. Proximo Passo

Definir uma unica acao:

- Aprovar piloto assistido.
- Aprovar producao controlada.
- Validar dados e usuarios-chave.
- Assinar proposta/contrato.
- Agendar implantacao.

## Modelo Pronto Para Envio

```text
Cliente:
Decisor:
Oferta recomendada:
Decisao solicitada:

Dor principal:
Hoje a operacao sofre com [dor principal], gerando retrabalho, pouca visibilidade ou risco operacional em [area afetada].

Proposta de valor:
O Nexus One organiza vendas, caixa, estoque, financeiro e relatorios em um fluxo unico, com implantacao acompanhada e escopo controlado. A proposta e validar valor primeiro, operar com seguranca e evoluir somente apos aceite.

Escopo inicial:
Plano: [Basico/Medio/Avancado/Piloto]
Modulos incluidos:
Usuarios/filiais/caixas:
Itens condicionados:
Itens fora do escopo:

Investimento:
Mensalidade:
Implantacao:
Vencimento:
Inicio previsto:

Riscos controlados:
Fiscal real, Pix/boleto real, notificacoes externas e integracoes dependem de homologacao e evidencias por cliente. A implantacao segue piloto assistido/producao controlada, Go/No-Go e aceite formal.

Proximo passo:
[Aprovar proposta / aprovar piloto / validar dados / agendar implantacao]
```

## Cuidados

- Nao citar percentuais de ganho sem premissas.
- Nao prometer integracao real, fiscal real, Pix/boleto real ou SLA especial sem evidencia e contrato.
- Nao apresentar o one-page como contrato.
- Nao enviar sem decisor, dor clara ou proximo passo.

## Gerador

```powershell
.\scripts\gerar-onepage-comercial-decisor.ps1 -Cliente "Cliente" -Decisor "Nome" -DorPrincipal "Controle de caixa e estoque" -Plano "Piloto assistido"
```
