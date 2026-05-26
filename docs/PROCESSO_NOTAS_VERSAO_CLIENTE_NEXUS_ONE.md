# Processo de Notas de Versao para Cliente - Nexus One

Data de referencia: 10/05/2026

Este processo define como comunicar mudancas de versao para clientes em homologacao, piloto assistido, producao controlada ou producao. Ele complementa o manifesto tecnico de release com uma nota clara, comercial e operacional para o usuario final.

## Quando Usar

- Antes ou depois de publicar uma versao em cliente ativo.
- Quando houver melhoria visivel para o cliente.
- Quando houver correcao de bug percebido pelo cliente.
- Quando houver mudanca em tela, fluxo, permissao, relatorio, fiscal, pagamento ou suporte.
- Quando houver manutencao programada vinculada a uma nova versao.
- Quando uma release exigir acao do cliente, treinamento ou revalidacao.

## Diferenca Entre Manifesto e Nota de Versao

| Artefato | Publico | Objetivo |
| --- | --- | --- |
| Manifesto de release | Tecnico/operacao interna | Registrar versao, branch, commit, evidencias, build, smoke test e decisao |
| Nota de versao | Cliente, suporte, implantacao e comercial | Explicar o que mudou, impacto, acao necessaria e riscos conhecidos |

## Campos Obrigatorios

- Versao.
- Ambiente: homologacao, piloto, producao controlada ou producao.
- Cliente ou grupo de clientes.
- Resumo executivo.
- Melhorias entregues.
- Correcoes realizadas.
- Mudancas de comportamento.
- Impacto operacional.
- Acoes necessarias do cliente.
- Riscos conhecidos ou limitacoes.
- Responsavel Nexus One.
- Data de publicacao.

## Regras de Comunicacao

- Usar linguagem simples e orientada a valor.
- Nao expor branch, commit, stack trace, segredos, logs sensiveis ou detalhes internos.
- Separar melhoria, correcao e mudanca de comportamento.
- Informar se o cliente precisa limpar cache, testar fluxo, treinar usuario ou aguardar homologacao.
- Avisar quando fiscal, pagamento, notificacao ou integracao ainda depender de provedor externo.
- Para mudanca critica, vincular comunicado de manutencao/incidente quando aplicavel.

## Modelo Resumido

Assunto: Nova versao Nexus One - `[versao]`

Publicamos a versao `[versao]` para `[ambiente/cliente]`.

Principais mudancas:

- `[melhoria 1]`
- `[correcao 1]`
- `[mudanca de comportamento]`

Acao recomendada:

- `[acao do cliente ou "nenhuma acao necessaria"]`

Riscos/limitacoes conhecidos:

- `[risco ou "nenhum risco relevante informado"]`

## Evidencias a Arquivar

- Manifesto de release gerado por `scripts/gerar-manifesto-release.ps1`.
- Smoke test operacional.
- Nota de versao gerada por `scripts/gerar-nota-versao-cliente.ps1`.
- Comunicacao enviada ao cliente, quando aplicavel.
- Aceite ou retorno do cliente em producao controlada.

## Gerador

```powershell
.\scripts\gerar-nota-versao-cliente.ps1 -Cliente "Cliente Piloto" -Versao "1.0.0" -Ambiente "producao controlada" -Resumo "Melhorias no caixa e suporte"
```

Arquive a nota em `reports\release` junto do manifesto e das evidencias de smoke test.
