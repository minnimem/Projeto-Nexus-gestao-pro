# Matriz de Posicionamento Competitivo - Nexus One

Data de referencia: 10/05/2026

Esta matriz ajuda comercial, implantacao e suporte a posicionar o Nexus One em conversas com clientes que comparam ERP, PDV, planilhas, sistemas locais ou concorrentes. O objetivo e responder com clareza, sem atacar terceiros e sem prometer recursos que dependem de homologacao, contrato ou execucao tecnica.

## Posicionamento Central

O Nexus One deve ser apresentado como um ERP operacional para pequenas e medias empresas que precisam unir vendas, caixa, estoque, financeiro, fiscal controlado, logistica, relatorios e suporte em um fluxo unico, com implantacao assistida e escopo bem documentado.

## Onde o Nexus One Deve Ganhar

- Cliente quer mais controle que planilha.
- Cliente precisa ligar venda, caixa, estoque e financeiro.
- Cliente valoriza implantacao guiada, treinamento e suporte documentado.
- Cliente aceita piloto assistido/producao controlada antes de escala ampla.
- Cliente tem dor de fechamento de caixa, estoque, inadimplencia, relatorios ou retrabalho.
- Cliente quer evoluir com processos claros de backup, LGPD, SLA, release e aceite.

## Onde Nao Forcar Venda

- Cliente quer apenas emissor fiscal oficial imediato.
- Cliente exige integracao real sem homologacao ou provedor definido.
- Cliente quer customizacao grande antes de validar o produto base.
- Cliente exige SLA fora da politica atual.
- Cliente nao tem decisor, responsavel por dados ou usuarios-chave.
- Cliente nao aceita piloto assistido quando ha risco operacional.

## Comparativo por Alternativa

| Alternativa | Como posicionar Nexus One | Cuidado comercial |
| --- | --- | --- |
| Planilhas | Mais controle, rastreabilidade, permissoes, historico e relatorios | Nao prometer migracao perfeita sem conferencia |
| PDV simples | Cobre caixa, mas tambem conecta estoque, vendas, financeiro e gestao | Mostrar valor alem do recebimento |
| ERP local antigo | Melhor organizacao visual, suporte e evolucao por release | Validar dados legados antes de migrar |
| Sistema fiscal isolado | Fiscal fica dentro do fluxo comercial/operacional quando homologado | Nao vender emissao oficial sem contador/certificado |
| ERP grande | Mais leve, implantacao mais proxima e custo inicial menor | Nao prometer profundidade enterprise ilimitada |
| Sistema barato | Mais processo, suporte e evidencia de operacao | Defender valor por reducao de retrabalho, nao por preco |

## Diferenciais Seguros

- Fluxo integrado de venda, caixa, estoque e financeiro.
- Caixa/PDV com abertura, recebimento, sangria, suprimento, fechamento e comprovante.
- Estoque com alertas, reposicao, curva ABC, inventario e etiquetas.
- CRM/follow-up e proposta comercial dentro da operacao.
- Processo completo de implantacao, treinamento, suporte, SLA e sucesso do cliente.
- Pacote de entrega com Go/No-Go, aceite, release, smoke test, backup, LGPD e evidencias.
- Planos comerciais com limites e adicionais documentados.

## Diferenciais Condicionados

- Pix/boleto real: depende de conta/provedor, homologacao e baixa validada.
- Fiscal real: depende de certificado, contador, credenciamento, provedor/SEFAZ/municipio e homologacao oficial.
- Notificacoes externas: dependem de canal real, token/webhook e evidencia de envio.
- Multiempresa/filiais ampliadas: conforme contrato, plano e escopo.
- Relatorios customizados: devem ser tratados como adicional ou backlog priorizado.

## Respostas Seguras a Objecoes

### "O concorrente ja tem fiscal pronto."

Resposta sugerida:
O Nexus One trata fiscal com controle e homologacao por cliente/filial/modelo. Se fiscal oficial for requisito imediato, precisamos validar certificado, contador, credenciamento e provedor antes de prometer producao.

### "Achei um sistema mais barato."

Resposta sugerida:
Podemos comparar escopo, suporte, implantacao, limites, backup, LGPD, treinamento e processos de aceite. O foco do Nexus One e reduzir retrabalho operacional, nao ser apenas o menor preco.

### "Quero tudo funcionando sem piloto."

Resposta sugerida:
Para reduzir risco, usamos piloto assistido ou producao controlada com Go/No-Go, evidencias e aceite. Isso protege a operacao do cliente e evita promessas sem validacao real.

### "Da para copiar exatamente meu sistema atual?"

Resposta sugerida:
Primeiro validamos se o fluxo atual deve ser mantido ou melhorado. Customizacoes grandes precisam de escopo, prioridade, custo e manutencao avaliados antes de compromisso.

## Uso no Processo Comercial

- Antes da demo: qualificar dor, decisor e concorrentes citados.
- Durante a demo: mostrar valor nos fluxos que resolvem a dor principal.
- Na proposta: destacar limites, adicionais e dependencias externas.
- No fechamento: anexar contrato, faturamento, Go/No-Go e aceite.
- No feedback: registrar se o concorrente perdeu ou ganhou por preco, recurso, prazo, suporte ou confianca.
- Quando a comparacao for preco, gerar ROI/valor percebido com `scripts/gerar-roi-valor-percebido.ps1`.
- Quando a decisao depender de dono, diretoria ou aprovador financeiro, gerar one-page comercial com `scripts/gerar-onepage-comercial-decisor.ps1`.

## Gerador

```powershell
.\scripts\gerar-posicionamento-competitivo.ps1 -Cliente "Cliente Piloto" -Alternativa "ERP local antigo" -DorPrincipal "Caixa e estoque sem conciliacao"
```

Arquive em `reports\comercial` junto da qualificacao, proposta ou feedback comercial.
