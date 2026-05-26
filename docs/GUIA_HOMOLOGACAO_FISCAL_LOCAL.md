# Guia rapido - homologacao fiscal local

Este guia valida o fluxo fiscal local sem SEFAZ ou provedor fiscal real.

Fluxo validado:

`Configuracao fiscal -> Vendas > Nota fiscal -> Homologar pedido -> Gerar XML -> Validar XML -> Consultar -> Transmitir -> Baixar retorno/DANFE -> Conferir conclusao fiscal real`

## Status atual

O fluxo local representa os 98% ja concluidos do modulo fiscal: preparacao tecnica, validacao, pacote real, auditoria, downloads e transmissao controlada por mock/provedor HTTP.

Os 2% finais nao sao validados por este guia porque dependem de ambiente oficial: certificado real, credenciamento SEFAZ/prefeitura/provedor, schemas vigentes, QR Code oficial da NFC-e e revisao tributaria do contador.

## 1. Subir o mock fiscal

PowerShell:

```powershell
$env:MOCK_FISCAL_TOKEN="token-http"
$env:MOCK_FISCAL_RESPONSE_MODE="json"
npm run mock:fiscal
```

Se estiver automatizando no Windows e o `npm run mock:fiscal` nao iniciar em processo separado, use o fallback direto:

```powershell
$env:MOCK_FISCAL_TOKEN="token-http"
$env:MOCK_FISCAL_RESPONSE_MODE="json"
node scripts/mock-fiscal-provider.js
```

Endpoint do mock:

```text
http://localhost:8098/fiscal/homologacao
```

Formatos disponiveis:

```powershell
$env:MOCK_FISCAL_RESPONSE_MODE="json"       # JSON padrao Nexus
$env:MOCK_FISCAL_RESPONSE_MODE="sefaz-json" # JSON com cStat/xMotivo/chNFe/nProt
$env:MOCK_FISCAL_RESPONSE_MODE="xml"        # XML nfeProc direto
```

Para simular rejeicao:

```powershell
$env:MOCK_FISCAL_STATUS="REJEITADO"
```

## 2. Validar o mock direto

Em outro terminal:

```powershell
$env:MOCK_FISCAL_TOKEN="token-http"
npm run test:fiscal-provider
```

Para rejeicao:

```powershell
npm run test:fiscal-provider -- -StatusEsperado REJEITADO
```

## 3. Configurar o backend para provedor HTTP

Antes de iniciar o Spring Boot:

```powershell
$env:NEXUS_FISCAL_PROVIDER="http"
$env:MOCK_FISCAL_TOKEN="token-http"
```

Se usar assinatura controlada, nao precisa configurar `NEXUS_FISCAL_XML_SIGNER`.

Se quiser testar assinatura PKCS12/A1:

```powershell
$env:NEXUS_FISCAL_XML_SIGNER="pkcs12"
$env:FISCAL_CERT_FILE="C:\caminho\certificado.pfx"
$env:FISCAL_CERT_PASSWORD="senha-do-certificado"
```

## 4. Configurar no sistema

No frontend:

`Admin -> Configuracao fiscal`

Criar ou editar uma configuracao com:

- Modelo: `NFE`
- Ambiente: `HOMOLOGACAO`
- Serie: `1`
- Proximo numero: numero livre para teste
- Endpoint homologacao: `http://localhost:8098/fiscal/homologacao`
- Certificado arquivo env: `FISCAL_CERT_FILE`
- Certificado senha env: `FISCAL_CERT_PASSWORD`
- Validade A1: data futura com mais de 30 dias
- Provedor token env: `MOCK_FISCAL_TOKEN`
- Ativo: sim

Se estiver usando assinatura controlada, os campos de certificado continuam sendo aliases para validar prontidao, mas a assinatura real nao e exigida.

## 5. Testar pela tela Nota fiscal

Na tela `Vendas > Nota fiscal`:

1. Escolha um pedido.
2. Clique em `Homologar`.
3. Clique em `XML`.
4. Clique em `Validar`.
5. Clique em `Consulta` para conferir status, pendencias, chave/protocolo e proxima acao.
6. Clique em `Transmitir`.
7. Confira o status fiscal.
8. Baixe `XML`, `Retorno` e `DANFE` quando disponiveis.
9. Baixe `Dossie` para conferir status, chave, protocolo, pendencias e arquivos gerados em um TXT unico.
10. Baixe `Checklist real` para visualizar o que ainda falta antes de emissao oficial.
11. Clique em `Status real` para conferir o percentual de prontidao, quantidade de pendencias e a proxima acao sem abrir TXT.
12. Baixe `Pacote real` para entregar XML, payload, metadados e checklist ao provedor/contador; se houver bloqueio, a tela mostra o resumo das primeiras pendencias.
13. Baixe `Manifesto` para acompanhar os hashes e a referencia do pacote enviado.
14. Clique em `Validar pacote` para conferir integridade antes do envio externo.
15. Confira o bloco `Conclusao fiscal real` no topo da fila fiscal.
16. Confira o marcador do pedido: `Corrigir cadastro`, `Gerar pacote base`, `Concluir homologacao`, `Aguardando homologacao` ou `Pacote real pronto`.

Se o mock/provedor estiver indisponivel, valide o XML e use `Contingencia` com o documento em `XML_VALIDADO` para registrar a indisponibilidade, manter XML de retorno e gerar DANFE de contingencia para conferencia.
Quando o provedor voltar, use `Regularizar` no documento em `CONTINGENCIA` para retransmitir e receber autorizacao ou rejeicao.

Resultado esperado em autorizacao:

- Status fiscal: `AUTORIZADO`
- Chave preenchida
- Protocolo preenchido
- XML de retorno disponivel
- DANFE disponivel quando o mock retornar `danfeHtml`
- Para NF-e autorizada, acao `CC-e` disponivel para registrar carta de correcao controlada e baixar `XML CC-e`.

Resultado esperado em rejeicao:

- Status fiscal: `REJEITADO`
- Mensagem com motivo da rejeicao
- XML de retorno disponivel
- Acao `Reprocessar` disponivel para corrigir e voltar a `EM_PROCESSAMENTO`.
- Acao de inutilizacao disponivel no fluxo controlado quando a numeracao nao sera reaproveitada.

Resultado esperado em contingencia:

- Status fiscal: `CONTINGENCIA`
- Mensagem com motivo operacional
- XML de retorno disponivel
- DANFE de contingencia disponivel para conferencia

## 6. Checklist rapido

- Mock fiscal respondendo `HEAD 200`.
- Atalho `npm run mock:fiscal` sobe o mock local.
- Atalho `npm run test:fiscal-provider` valida HEAD/POST contra o mock.
- Backend iniciado com `NEXUS_FISCAL_PROVIDER=http`.
- Configuracao fiscal pronta em homologacao.
- Pedido possui dados suficientes para gerar payload fiscal.
- Dados fiscais com formato valido: CNPJ 14 digitos, CPF 11 digitos quando exigido, UF com 2 letras, CEP 8 digitos, codigo IBGE 7 digitos, NCM 8 digitos, CFOP 4 digitos, CEST 7 digitos quando usado, origem fiscal entre 0 e 8, CST/CSOSN conforme regime, codigo de servico para NFS-e e aliquotas entre 0 e 100.
- TXT de pendencias fiscais vazio antes de transmitir, regularizar contingencia ou autorizar/rejeitar manualmente.
- Se houver pendencias, corrigir os cadastros e usar `Revalidar` antes de validar/transmitir novamente.
- Se houver rejeicao, corrigir os dados e usar `Reprocessar` antes de validar/transmitir novamente ou inutilizar a numeracao.
- XML foi gerado e validado antes da transmissao, com itens, totais e bloco de tributacao presentes.
- Transmissao, contingencia e retorno manual Autorizar/Rejeitar so ficam liberados depois do status `XML_VALIDADO`.
- Consulta de homologacao retorna status, totais de arquivos/pendencias/acoes, arquivos disponiveis, pendencias e proxima acao operacional esperada.
- Dossie fiscal de homologacao baixa um TXT consolidado para conferencia com contador/provedor, incluindo totais de arquivos, pendencias e acoes disponiveis.
- Checklist real baixa um TXT de prontidao para producao, certificado, endpoint, token e CSC quando aplicavel, incluindo totalizadores e a proxima acao recomendada.
- Status real retorna percentual de prontidao, total de pendencias internas, total de pendencias externas/oficiais e primeiros bloqueios operacionais na propria tela.
- Certificado A1 vencido ou vencendo em ate 30 dias deve aparecer como pendencia no checklist/status/pacote de emissao real.
- Pacote real baixa JSON consolidado com XML, payload, hashes SHA-256, referencia tecnica, metadados, checklist estruturado, totalizadores, pendencias externas/oficiais e proxima acao, sem transmitir a nota.
- Manifesto baixa TXT curto com referencia do pacote, hashes, status, prontidao, totalizadores, pendencias e proxima acao.
- Validar pacote confere se payload/XML existem, calcula hashes, confirma referencia estruturada, mostra percentual, total de pendencias, proxima acao e falha quando houver pendencias no checklist de emissao real.
- Bloco `Conclusao fiscal real` aparece na tela `Vendas > Nota fiscal` e resume prontidao, pendencias, configuracoes fiscais e proxima acao.
- Marcador de conclusao do pedido condiz com o estado real do documento fiscal.
- Quando houver cadastro fiscal pendente, o marcador da fila deve exibir a quantidade de pendencias retornada pelo resumo fiscal em lote.
- Para NFC-e, o XML/DANFCE traz QR Code interno de homologacao; conferir apenas como rastreio local, nao como QR oficial SEFAZ.
- Para NFS-e, conferir codigo de servico, municipio de incidencia e ISS no XML antes de trocar pelo provedor municipal real.
- Transmissao retornou autorizacao/rejeicao ou contingencia foi registrada quando o provedor ficou indisponivel.
- Contingencia foi regularizada depois que o provedor voltou.
- CC-e controlada foi registrada somente para NF-e autorizada quando houver texto de correcao valido.
- Auditoria fiscal registrou a transicao.

## 7. Problemas comuns

### Status fiscal indisponivel

Verifique:

- mock rodando na porta `8098`;
- endpoint homologacao correto;
- `MOCK_FISCAL_TOKEN` igual ao token resolvido por `provedorTokenEnv`.

### Segredos fiscais pendentes

Verifique se as variaveis informadas na configuracao existem no ambiente do backend.

### Rejeicao no mock

Verifique se `MOCK_FISCAL_STATUS` esta como `REJEITADO`.

### Backend ainda usando provedor controlado

Confirme se o Spring Boot foi iniciado com:

```powershell
$env:NEXUS_FISCAL_PROVIDER="http"
```
