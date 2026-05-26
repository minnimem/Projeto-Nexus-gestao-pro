# Matriz de Planos Comerciais - Nexus One

Data de referencia: 10/05/2026

Esta matriz organiza uma sugestao inicial de planos comerciais para vender o Nexus One sem desvalorizar o produto completo e sem prometer recursos que ainda dependem de homologacao real.

## Posicionamento

- Basico: entrada acessivel para loja pequena.
- Medio: principal plano de venda, com melhor custo-beneficio.
- Avancado: operacao completa para empresas maiores, redes ou operacoes com mais controle.

Nomenclatura comercial recomendada:

| Nome tecnico | Nome comercial premium | Objetivo |
| --- | --- | --- |
| Basico | Starter | Entrada acessivel |
| Medio | Business | Plano principal |
| Avancado | Enterprise | Operacao completa |

Para comparacao com planilhas, PDV simples, ERP local, ERP grande ou sistema barato, usar `docs/MATRIZ_POSICIONAMENTO_COMPETITIVO_NEXUS_ONE.md`.

Os valores abaixo sao sugestoes de lancamento e devem ser revisados conforme mercado, custo de suporte, infraestrutura, implantacao e complexidade do cliente.

## Resumo de Precos Sugeridos

| Plano | Mensalidade sugerida | Implantacao sugerida | Perfil indicado |
| --- | ---: | ---: | --- |
| Basico | R$ 179,00 | R$ 300,00 a R$ 600,00 | Loja pequena, 1 filial, poucos usuarios |
| Medio | R$ 349,00 | R$ 800,00 a R$ 1.500,00 | Empresa em crescimento, estoque/financeiro mais serio |
| Avancado | R$ 699,00 | R$ 2.000,00 a R$ 5.000,00 | Rede, multiusuario, logistica, fiscal e gestao completa |

## Como os Planos Sao Liberados

A liberacao deve acontecer em duas camadas:

1. Plano contratado: define limites comerciais, modulos e adicionais.
2. Prontidao/homologacao: define o que pode operar em producao real.

Fluxo recomendado:

| Etapa | Acao | Evidencia |
| --- | --- | --- |
| Diagnostico | Confirmar necessidade, volume e plano recomendado | Ficha de diagnostico |
| Proposta | Registrar plano, valores, limites e adicionais | Proposta comercial |
| Contrato | Validar SLA, LGPD, fiscal, integracoes e implantacao | Checklist de contrato |
| Ativacao | Gravar plano na empresa e aplicar limites | Escopo do plano |
| Implantacao | Configurar usuarios, filiais, caixa, dados e treinamento | Cronograma/handoff |
| Producao controlada | Liberar uso real somente sem bloqueios | Go/No-Go e aceite |
| Expansao | Aumentar plano/limite com score e capacidade | Resultado do lote e decisao |

Regra central: o plano libera o direito comercial; a homologacao libera o uso real.

## Controles Tecnicos Por Plano

| Controle | Starter/Basico | Business/Medio | Enterprise/Avancado |
| --- | --- | --- | --- |
| `planoComercial` | `STARTER` | `BUSINESS` | `ENTERPRISE` |
| Limite de empresas | 1 | 1 | Conforme contrato |
| Limite de filiais | 1 | 3 | Conforme contrato |
| Limite de usuarios | 3 | 8 | 15+ ou conforme contrato |
| Limite de caixas | 1 | 3 | Conforme contrato |
| Limite de produtos sugerido | 500 | 5.000 | Ilimitado/conforme contrato |
| Limite fiscal sugerido | Adicional ou 30/mês | Ate 500/mês apos homologacao | Conforme contrato |
| Modulos bloqueados | Logistica completa, auditoria avancada, multiempresa | Multiempresa e avancados sob contrato | Apenas itens fora do escopo |
| Adicionais | Usuario, caixa, filial, fiscal, backup, relatorio | Usuario, caixa, filial, integracao, relatorio | Customizacao, SLA, integracao |

## Limites Comerciais

| Recurso | Basico | Medio | Avancado |
| --- | --- | --- | --- |
| Empresas | 1 | 1 | Multiempresa conforme contrato |
| Filiais | 1 | Ate 3 | Conforme contrato |
| Usuarios | Ate 3 | Ate 8 | A partir de 15 ou conforme contrato |
| Caixas/PDV | 1 | Ate 3 | Conforme contrato |
| Vendas e pedidos | Incluido | Incluido | Incluido |
| Orcamentos/propostas | Simples | Completo | Completo |
| CRM/follow-up | Basico | Completo | Completo com automacoes/homologacao |
| Caixa | Basico | Completo | Completo |
| Pagamento misto | Incluido | Incluido | Incluido |
| Pix/boleto real | Adicional/homologacao | Homologacao conforme escopo | Homologacao conforme escopo |
| Estoque | Simples | Completo | Completo |
| Compras/fornecedores | Limitado | Incluido | Incluido |
| Inventario/etiquetas | Limitado | Incluido | Incluido |
| Financeiro | Basico | Completo gerencial | Completo gerencial |
| DRE/fluxo/conciliacao | Limitado | Incluido | Incluido |
| Logistica | Nao incluido | Simples | Completa conforme escopo |
| Servicos/OS | Nao incluido | Opcional | Incluido se contratado |
| Fiscal real | Adicional e homologacao | Homologacao conforme escopo | Homologacao conforme escopo |
| Relatorios | Basicos | Gerenciais | Avancados/consolidados |
| Exportacoes | Basicas | CSV/PDF/Excel conforme tela | Ampliadas conforme permissao |
| Auditoria/permissoes | Simples | Por perfil | Governanca ampliada |
| Suporte | Padrao | Prioritario horario comercial | Prioritario e implantacao acompanhada |
| Treinamento | Inicial reduzido | Por perfil-chave | Por perfil e operacao assistida |

## Recursos que Nao Devem Entrar no Basico

- Multiplas filiais.
- Multiplos caixas.
- Logistica completa.
- Rotas, entregadores e romaneio completo.
- Relatorios avancados.
- Multiempresa.
- Integracoes externas reais incluidas sem homologacao.
- Nota fiscal completa ilimitada.
- Auditoria detalhada.
- Suporte fora do horario comercial.

## Recursos que Diferenciam o Medio

- PDV completo.
- Financeiro gerencial mais forte.
- Estoque com compras, fornecedores e reposicao.
- Relatorios por vendedor, filial, periodo e caixa.
- Separacao de produtos.
- Entrega basica.
- Fiscal e pagamentos reais como escopo homologado.
- Suporte prioritario em horario comercial.

## Recursos que Diferenciam o Avancado

- Multiempresa ou rede de filiais conforme contrato.
- Usuarios e caixas ampliados.
- Logistica completa.
- Relatorios gerenciais mais amplos.
- Auditoria e governanca mais fortes.
- Implantacao acompanhada.
- Operacao assistida com evidencias e aceite.

## Adicionais Comerciais

| Adicional | Quando cobrar separado |
| --- | --- |
| Usuario extra | Quando ultrapassar limite do plano |
| Caixa/PDV extra | Quando ultrapassar limite do plano |
| Filial extra | Quando ultrapassar limite do plano ou exigir nova implantacao |
| Pacote de produtos maior | Quando ultrapassar limite de cadastros do plano |
| Pacote fiscal adicional | Quando exceder volume fiscal contratado |
| Importacao/carga de dados grande | Quando houver planilhas complexas, limpeza de dados ou conferencia extensa |
| Homologacao fiscal real | Quando depender de certificado, contador, credenciamento, provedor ou SEFAZ/municipio |
| Pix/boleto real | Quando exigir conta/provedor do cliente e conciliacao ponta a ponta |
| Notificacoes externas | Quando envolver WhatsApp, e-mail transacional, webhook ou canal real do cliente |
| Relatorio customizado | Quando nao estiver nos relatorios padrao |
| Treinamento extra | Quando ultrapassar o escopo inicial do plano |
| Suporte fora do horario comercial | Quando exigir plantao ou atendimento especial |

## Regras de Venda Segura

- Nunca vender fiscal real como pronto sem homologacao por cliente, filial e modelo fiscal.
- Nunca incluir integracao real sem token/canal/provedor definido e testado.
- Nunca prometer suporte acima de `docs/POLITICA_SLA_SUPORTE_NEXUS_ONE.md`.
- Registrar limites do plano na proposta.
- Registrar faturamento, vencimento, implantacao e recorrencia conforme `docs/PROCESSO_FATURAMENTO_CLIENTE_NEXUS_ONE.md`.
- Registrar modulos opcionais e adicionais separadamente.
- Para producao controlada, seguir `docs/MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md`.
- Para implantacao, seguir `docs/PROCESSO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`.
- Se o cliente comprar plano superior, mas o recurso ainda depender de homologacao, registrar como "contratado e condicionado".
- Upgrade pode liberar limite imediatamente, mas integracao/fiscal/producao real continuam dependendo de evidencia.
- Downgrade deve bloquear criacao acima do limite, sem apagar dados existentes sem aceite do cliente.

## Regras de Upgrade e Downgrade

| Movimento | Como tratar |
| --- | --- |
| Starter -> Business | Liberar mais usuarios, caixas, filiais e recursos gerenciais apos aceite comercial |
| Business -> Enterprise | Revisar escopo, implantacao, SLA, multiempresa e capacidade operacional |
| Enterprise personalizado | Exigir anexo de escopo, limites, SLA e adicionais |
| Downgrade | Manter dados historicos, bloquear novos cadastros acima do limite e formalizar impacto |
| Adicional temporario | Registrar prazo, valor, responsavel e data de revisao |

## Estrategia Recomendada

O plano Medio deve ser o plano principal de venda. Ele deve parecer completo para a maioria dos clientes, enquanto o Basico fica como porta de entrada e o Avancado como solucao completa para operacoes maiores.

## Gerador de Escopo Comercial

Use:

```powershell
.\scripts\gerar-escopo-plano-comercial.ps1 -Cliente "Cliente" -Plano "Medio" -Responsavel "Nexus One"
```

O arquivo gerado pode ser anexado a proposta controlada para deixar limites, adicionais e dependencias claros.

Para registrar a cobranca do cliente:

```powershell
.\scripts\gerar-faturamento-cliente.ps1 -Cliente "Cliente" -Plano "Medio" -Mensalidade 349 -Implantacao 1200 -DiaVencimento 10
```

Para registrar posicionamento competitivo:

```powershell
.\scripts\gerar-posicionamento-competitivo.ps1 -Cliente "Cliente" -Alternativa "PDV simples" -PlanoSugerido "Medio"
```
