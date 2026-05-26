# Homologacao Fiscal Real

Este roteiro organiza o caminho para evoluir o controle fiscal interno do Nexus One para emissao real de documentos fiscais.

> Importante: regras tributarias, enquadramento fiscal, CFOP, CST/CSOSN, aliquotas, series e obrigatoriedades devem ser validadas com contador e com a SEFAZ/municipio do contribuinte. Este documento e um roteiro tecnico de integracao.

Para o passo a passo operacional com mock local, use `docs/GUIA_HOMOLOGACAO_FISCAL_LOCAL.md`.

## Status atual - 98% concluido

O modulo fiscal esta aproximadamente 98% concluido para homologacao controlada e preparacao de emissao real.

Ja esta coberto no ERP:

- Configuracao fiscal por empresa, filial, modelo, ambiente, serie, numeracao, certificado, CSC/token e provedor.
- Status de prontidao, status do servico fiscal, segredos por variavel de ambiente e bloqueio de producao sem homologacao.
- Documento fiscal persistido a partir do pedido, com payload JSON, XML por modelo, pendencias fiscais, auditoria e consulta operacional.
- Validacao interna de XML, revalidacao de pendencias, reprocessamento de rejeicao e bloqueio de transmissao quando houver cadastro fiscal pendente.
- Fluxo controlado para transmitir, autorizar, rejeitar, cancelar, inutilizar, regularizar contingencia e gerar CC-e.
- Provedor HTTP opcional com retorno JSON/XML, aliases de emissores externos, `cStat=100`, `xMotivo`, `chNFe`, `nProt`, XML autorizado e DANFE retornado.
- DANFE/DANFCE/DANFSe de conferencia, dossie TXT, checklist de emissao real, status real, pacote real JSON, manifesto e validacao de integridade.
- Tela `Vendas > Nota fiscal` com fila fiscal, seletor de modelo fiscal por pedido, acoes fiscais, downloads, bloco `Conclusao fiscal real` e marcador de conclusao por pedido.

Os 2% finais dependem de validacao externa e operacional:

- Certificado A1/A3 real instalado e testado no ambiente oficial.
- Credenciamento da empresa/filial na SEFAZ, prefeitura ou provedor fiscal.
- Schemas/layouts vigentes do estado/municipio confirmados.
- QR Code oficial da NFC-e substituindo o marcador de homologacao.
- Regras tributarias, CFOP, CST/CSOSN, aliquotas, NCM, CEST, ISS e retencoes validadas pelo contador.
- Homologacao oficial por modelo fiscal, primeiro em uma filial piloto, antes de liberar producao.

Enquanto esses 2% finais nao forem concluidos, o sistema deve ser tratado como pronto para homologacao controlada e preparacao tecnica, nao como emissor real automatico em producao.

## 1. Documentos no escopo

- NF-e, modelo 55: venda/faturamento de mercadorias.
- NFC-e, modelo 65: venda presencial ao consumidor.
- NFS-e: prestacao de servicos, preferencialmente via padrao nacional quando aplicavel ao municipio.

## 2. Referencias oficiais

- NF-e/NFC-e: Portal Nacional da NF-e e documentacao tecnica indicada pelas SEFAZ estaduais.
- NFC-e: portais estaduais indicam que a implementacao segue o padrao tecnico nacional da NF-e.
- NFS-e Nacional: Portal gov.br NFS-e, documentacao tecnica, manuais, anexos e schemas.

Links uteis:

- https://www.nfe.fazenda.gov.br/
- https://www.gov.br/nfse/pt-br/nfs-e-via/documentacao-tecnica
- https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/documentacao-atual

## 3. Pre-requisitos por empresa/filial

Antes de emitir em homologacao, cada empresa/filial precisa ter:

- CNPJ, IE/IM, razao social, nome fantasia e endereco completos.
- Regime tributario confirmado pelo contador.
- Certificado digital A1 ou A3 valido.
- Credenciamento na SEFAZ estadual para NF-e/NFC-e.
- Credenciamento municipal ou nacional para NFS-e.
- Series e numeracoes definidas por modelo fiscal.
- CSC/Token NFC-e, quando exigido pela UF.
- Ambiente inicial: homologacao/producao restrita.

## 4. Dados minimos no ERP

Produtos:

- NCM.
- CEST, quando aplicavel.
- CFOP por operacao.
- Unidade comercial/tributavel.
- Origem da mercadoria.
- CST/CSOSN, PIS, COFINS, ICMS e IPI quando aplicavel.

Clientes:

- CPF/CNPJ.
- Nome/razao social.
- Endereco completo.
- Indicador de IE/contribuinte quando necessario.

Pedidos:

- Natureza da operacao.
- Modelo fiscal pretendido.
- Serie e numero.
- Itens com impostos calculados.
- Frete, desconto, acrescimos e forma de pagamento.

Servicos:

- Codigo de servico municipal/nacional.
- NBS ou codigo exigido no padrao adotado.
- Municipio de incidencia.
- ISS e retencoes, quando aplicavel.

## 5. Arquitetura recomendada

Criar um modulo fiscal isolado:

- `FiscalService`: orquestra emissao, consulta, cancelamento e inutilizacao.
- `FiscalDocument`: entidade para documento fiscal emitido ou tentado.
- `FiscalEvent`: historico de eventos, retornos e erros.
- `FiscalProvider`: interface para provedor real, com implementacoes por SEFAZ/NFS-e/provedor terceiro.
- `FiscalConfig`: configuracao por empresa/filial.

Base administrativa ja iniciada no backend:

- Entidade `ConfiguracaoFiscal` para empresa, filial opcional, modelo fiscal, ambiente, serie, proximo numero, provedor e endpoints.
- Endpoint protegido para `ADMIN` e `GERENTE`: `GET /configuracoes-fiscais`, `POST /configuracoes-fiscais` e `PUT /configuracoes-fiscais/{id}`.
- Endpoint de prontidao: `GET /configuracoes-fiscais/{id}/status`, retornando `PRONTO_HOMOLOGACAO` ou pendencias cadastrais por modelo.
- Status de servico controlado: `GET /configuracoes-fiscais/{id}/status-servico`, retornando endpoint, disponibilidade, pendencias cadastrais, validade do certificado A1 e existencia das variaveis de ambiente de arquivo/senha do certificado e CSC.
- Resolvedor de segredos fiscais criado para conferir senha de certificado e token CSC sem retornar o valor sensivel ao frontend.
- Base de documento fiscal: `POST /documentos-fiscais/homologacao` prepara o registro fiscal a partir de pedido + configuracao pronta, incrementando a numeracao e persistindo payload JSON.
- O fluxo `/documentos-fiscais/homologacao` aceita apenas configuracao em `HOMOLOGACAO`; configuracao em `PRODUCAO` fica bloqueada ate existir emissao oficial homologada.
- Geracao XML interna: `PATCH /documentos-fiscais/{id}/gerar-xml-homologacao`, gravando `xmlEnvio` e status `EM_PROCESSAMENTO`, com raiz/campos especificos para `NFE`, `NFCE` e `NFSE`.
- Empresa passou a aceitar dados fiscais do emitente: inscricao estadual, inscricao municipal, regime tributario, CRT, CEP e codigo IBGE do municipio.
- Cliente passou a aceitar endereco fiscal estruturado do destinatario: numero, bairro, cidade, UF, CEP, codigo IBGE do municipio e inscricao estadual opcional.
- Produto passou a aceitar dados fiscais opcionais no cadastro: NCM, CFOP, CEST, origem fiscal, unidade comercial, CST/CSOSN, aliquotas basicas de ICMS, PIS, COFINS e IPI, codigo de servico municipal/nacional e aliquota ISS.
- Payload JSON e XML de homologacao passaram a conter blocos de emitente, destinatario, itens fiscais, codigo de barras, NCM, CFOP, CEST, origem, unidade, tributacao, dados de servico, total por item e pendencias fiscais para CNPJ, IE, IM, CRT, CEP, codigo municipio, CPF, UF, endereco do destinatario e CSC antes da emissao real.
- As pendencias fiscais tambem apontam formatos invalidos para CNPJ, CPF, UF, CEP, codigo IBGE do municipio, NCM, CFOP, CEST, origem fiscal, CST/CSOSN, aliquotas, codigo de servico e ISS.
- Pendencias fiscais ficam persistidas em `DocumentoFiscal.pendenciasFiscais` e o resumo em lote informa quando ha cadastro fiscal pendente para a fila operacional.
- Documento com pendencias fiscais persistidas fica bloqueado para transmissao, regularizacao de contingencia e retorno manual ate a correcao cadastral.
- A fila fiscal do frontend exibe a acao `Pendencias` para baixar um TXT com os ajustes cadastrais necessarios antes da emissao real e `Revalidar` para recalcular depois da correcao.
- Assinatura controlada: o XML gerado recebe `AssinaturaHomologacao` com digest SHA-256, alias e variavel do arquivo do certificado; ainda falta substituir por assinatura criptografica A1 oficial.
- Assinatura PKCS12/A1 real disponivel por configuracao: definir `NEXUS_FISCAL_XML_SIGNER=pkcs12`, apontar `certificadoArquivoEnv` para a variavel com caminho do `.pfx/.p12` e `certificadoSenhaEnv` para a senha.
- Validacao XML interna: `PATCH /documentos-fiscais/{id}/validar-xml-homologacao`, conferindo estrutura minima por modelo, itens, totais e bloco de tributacao antes da transmissao externa e marcando o documento como `XML_VALIDADO`.
- Revalidacao de pendencias: `PATCH /documentos-fiscais/{id}/revalidar-pendencias-homologacao`, recalculando pendencias, payload e XML depois de ajustes cadastrais.
- Reprocessamento de rejeicao: `PATCH /documentos-fiscais/{id}/reprocessar-rejeicao-homologacao`, regenerando payload/XML de documento rejeitado corrigido e retornando para `EM_PROCESSAMENTO`.
- Consulta operacional: `GET /documentos-fiscais/{id}/consulta-homologacao`, retornando status, chave, protocolo, totalizadores de arquivos/pendencias/acoes, pendencias, arquivos disponiveis e proxima acao recomendada para o operador.
- Transmissao e retorno manual em homologacao controlada: `PATCH /documentos-fiscais/{id}/transmitir-homologacao`, `autorizar-homologacao` e `rejeitar-homologacao` exigem `XML_VALIDADO` para isolar a troca futura por SEFAZ/provedor fiscal real sem pular validacao estrutural.
- Provedor HTTP opcional: definir `NEXUS_FISCAL_PROVIDER=http` para enviar o XML e metadados fiscais ao endpoint configurado em `endpointHomologacao` ou `endpointProducao`.
- Autenticacao do provedor HTTP: preencher `provedorTokenEnv` com o nome da variavel do token/API key; o backend envia `Authorization: Bearer <token>` no status e na transmissao.
- Resposta esperada do provedor HTTP: JSON com `autorizado` ou `status`, `chaveAcesso`, `protocolo`, `mensagem` e `xmlRetorno`.
- O provedor HTTP tambem aceita aliases comuns de emissores externos: `chave`, `accessKey`, `chave_acesso`, `chNFe`, `protocoloAutorizacao`, `authorizationProtocol`, `receipt`, `nProt`, `xml`, `xmlAutorizado`, `authorizedXml`, `nfeProc`, `danfeHtml`, `danfe` e `documentoAuxiliarHtml`.
- Em JSON, `cStat=100` tambem e tratado como autorizacao e `xMotivo` como mensagem fiscal.
- O retorno pode vir na raiz do JSON ou aninhado em `data`, `result`, `resultado`, `documento` ou `retorno`.
- O retorno tambem pode ser XML direto no corpo HTTP, como `nfeProc`, desde que contenha `cStat=100`, `chNFe`, `nProt` e `xMotivo`; a leitura usa parser XML seguro e aceita namespace fiscal.
- XML direto com `cStat` diferente de `100` e `xMotivo` e tratado como rejeicao fiscal, preservando o XML de retorno para conferencia.
- Quando o provedor retornar `danfeHtml`, o backend persiste o documento auxiliar junto com a transmissao autorizada, evitando uma chamada manual posterior para gerar DANFE de conferencia.
- O contrato HTTP possui teste automatizado para payload de envio, autorizacao, rejeicao, aliases de retorno, DANFE retornado e bloqueio quando segredos fiscais nao existem.
- Com `NEXUS_FISCAL_PROVIDER=http`, a consulta de status do servico fiscal faz `HEAD` no endpoint configurado e retorna `DISPONIVEL_HTTP` ou `INDISPONIVEL_HTTP`.
- Timeouts do provedor HTTP: `NEXUS_FISCAL_HTTP_CONNECT_TIMEOUT_MS`, `NEXUS_FISCAL_HTTP_READ_TIMEOUT_MS` e `NEXUS_FISCAL_HTTP_STATUS_READ_TIMEOUT_MS`.
- Mock local de provedor fiscal: `npm run mock:fiscal`, expondo `HEAD/POST http://localhost:8098/fiscal/homologacao` para validar status, transmissao, retorno XML e DANFE sem depender ainda de SEFAZ/provedor real.
- Documento auxiliar: `PATCH /documentos-fiscais/{id}/gerar-danfe-homologacao`, criando HTML de conferencia para documento autorizado em homologacao.
- Carta de correcao controlada: `PATCH /documentos-fiscais/{id}/carta-correcao-homologacao`, gerando XML de evento separado para NF-e autorizada, com sequencia, texto, chave e protocolo.
- Dossie de homologacao: `GET /documentos-fiscais/{id}/dossie-homologacao`, gerando TXT consolidado com status, chave, protocolo, resumo de arquivos/pendencias/acoes, arquivos gerados, pendencias, CC-e e proxima acao.
- Checklist de emissao real: `GET /documentos-fiscais/{id}/checklist-emissao-real`, gerando TXT com itens prontos, totalizadores, pendencias, percentual e proxima acao para producao, certificado, endpoint, token e CSC; certificado A1 vencido ou vencendo em ate 30 dias bloqueia a prontidao real.
- Status de emissao real: `GET /documentos-fiscais/{id}/status-emissao-real`, retornando JSON com percentual de prontidao, itens prontos, totalizadores, pendencias internas, pendencias externas/oficiais e proxima acao, incluindo alerta de certificado A1 vencido ou vencendo.
- Pacote de emissao real: `GET /documentos-fiscais/{id}/pacote-emissao-real`, exportando JSON com XML, payload, hashes SHA-256, referencia tecnica, metadados, aliases de certificado/provedor, checklist estruturado, totalizadores, pendencias externas/oficiais e proxima acao.
- Manifesto de integridade do pacote real: `GET /documentos-fiscais/{id}/manifesto-pacote-emissao-real`, gerando TXT curto com referencia, hashes, status, prontidao, totalizadores, pendencias e proxima acao.
- Validacao de integridade do pacote real: `GET /documentos-fiscais/{id}/validar-integridade-pacote-emissao-real`, retornando hashes, referencia, itens prontos, total de pendencias, percentual de prontidao, pendencias de payload/XML, pendencias do checklist de emissao real, proxima acao e indicador de validade.
- NFC-e de homologacao inclui `QrCodeHomologacao` com hash interno no XML e no DANFCE; o QR Code oficial da SEFAZ deve substituir esse marcador na emissao real.
- NFS-e de homologacao inclui bloco `Servico` com codigo municipal/nacional, municipio de incidencia, aliquota ISS e discriminacao, ainda sem substituir a integracao municipal real.
- Retorno de homologacao controlado: `PATCH /documentos-fiscais/{id}/autorizar-homologacao` e `PATCH /documentos-fiscais/{id}/rejeitar-homologacao`, liberados somente apos XML validado.
- Regularizacao de contingencia: `PATCH /documentos-fiscais/{id}/regularizar-contingencia-homologacao`, retransmitindo documento em contingencia pelo provedor fiscal configurado.
- Cancelamento controlado: `PATCH /documentos-fiscais/{id}/cancelar-homologacao` para documento autorizado.
- Inutilizacao controlada: `PATCH /documentos-fiscais/{id}/inutilizar-homologacao` para numeracao de documento rejeitado.
- Consulta por pedido: `GET /documentos-fiscais/pedido/{pedidoId}`.
- Consulta em lote para operacao: `GET /documentos-fiscais/pedidos?ids=...`, incluindo totais de arquivos disponiveis e pendencias fiscais por documento.
- Consulta completa pontual: `GET /documentos-fiscais/{id}`, incluindo XML e payload.
- Consulta de situacao da homologacao: `GET /documentos-fiscais/{id}/consulta-homologacao`, sem baixar XML completo.
- Tela administrativa no frontend em `Admin > Configuracao fiscal`, com cadastro, edicao, CSV e PDF.
- Tela administrativa permite consultar o status do servico fiscal configurado.
- Tela `Vendas > Nota fiscal` com acao `Homologar` para preparar o documento fiscal do pedido usando configuracao NFE ativa por filial ou empresa.
- Tela `Vendas > Nota fiscal` com acao `Validar` quando o documento esta `EM_PROCESSAMENTO`, `Consulta` para diagnostico operacional da homologacao e `Transmitir` quando esta `XML_VALIDADO`, chamando o provedor fiscal configurado.
- Tela `Vendas > Nota fiscal` com acao `Reprocessar` quando o documento esta `REJEITADO`, permitindo corrigir e validar novamente antes de inutilizar.
- Tela `Vendas > Nota fiscal` permite baixar o `xmlEnvio` de homologacao quando o documento fiscal ja possui XML gerado.
- Tela `Vendas > Nota fiscal` permite baixar o `payloadJson` preparado para conferencia e futura integracao com provedor.
- Tela `Vendas > Nota fiscal` permite baixar o `xmlRetorno` gerado pelos retornos controlados de homologacao.
- Tela `Vendas > Nota fiscal` permite baixar o `danfeHtml` gerado para conferencia/impressao de homologacao.
- Tela `Vendas > Nota fiscal` permite registrar CC-e em NF-e autorizada e baixar o XML da carta de correcao controlada.
- Tela `Vendas > Nota fiscal` permite baixar dossie fiscal em TXT para conferencia operacional.
- Tela `Vendas > Nota fiscal` permite baixar checklist de emissao real em TXT para separar pendencias de homologacao e producao.
- Tela `Vendas > Nota fiscal` permite consultar status real estruturado para ver percentual, quantidade de pendencias e resumo dos primeiros bloqueios sem baixar arquivo.
- Tela `Vendas > Nota fiscal` permite baixar pacote real em JSON para apoio tecnico ao provedor/contador, sem transmitir a nota, e sinaliza na propria tela quando ainda ha pendencias de prontidao.
- Tela `Vendas > Nota fiscal` permite baixar manifesto de integridade para acompanhar o pacote real enviado.
- Tela `Vendas > Nota fiscal` permite validar integridade do pacote real antes do envio externo.
- Tela `Vendas > Nota fiscal` concentra a fila fiscal sem misturar com a tela comercial de venda/PDV.
- Tela `Vendas > Nota fiscal` exibe o bloco `Conclusao fiscal real`, com percentual, pendencias, configuracoes prontas, pacotes reais disponiveis e proxima acao operacional.
- Cada pedido fiscal exibe marcador de conclusao: `Corrigir cadastro`, `Gerar pacote base`, `Concluir homologacao`, `Aguardando homologacao` ou `Pacote real pronto`.
- O marcador de cadastro fiscal pendente mostra a quantidade de pendencias quando o resumo em lote fornece esse total.
- Preparacao, geracao de XML, autorizacao, rejeicao, cancelamento e inutilizacao registram auditoria no modulo Fiscal.
- Modelos aceitos: `NFE`, `NFCE` e `NFSE`.
- Ambientes aceitos: `HOMOLOGACAO` e `PRODUCAO`.
- Campos sensiveis guardam apenas nomes de variaveis/aliases, como `certificadoArquivoEnv`, `certificadoSenhaEnv` e `cscTokenEnv`; o arquivo/senha do certificado e o token CSC devem ficar fora do Git.
- A validade do certificado A1 fica registrada como metadado operacional e bloqueia prontidao quando vencida ou vencendo em ate 30 dias.

Estados sugeridos:

- `PENDENTE`
- `ENVIANDO`
- `AUTORIZADO`
- `REJEITADO`
- `CANCELADO`
- `INUTILIZADO`
- `ERRO_COMUNICACAO`

## 6. Fluxo NF-e/NFC-e

1. Gerar XML conforme layout vigente.
2. Assinar XML com certificado digital.
3. Validar XML contra schemas.
4. Enviar lote/autorizacao para ambiente de homologacao.
5. Consultar recibo/protocolo quando o envio for assincrono.
6. Persistir chave de acesso, protocolo, XML enviado, XML autorizado e retorno.
7. Gerar DANFE/DANFCE.
8. Permitir cancelamento dentro das regras do ambiente.
9. Permitir inutilizacao de numeracao quando necessario.

## 7. Fluxo NFS-e

1. Identificar se o municipio usa padrao nacional, proprio ou provedor intermediario.
2. Gerar DPS/RPS conforme padrao aplicavel.
3. Assinar quando exigido.
4. Enviar para homologacao/producao restrita.
5. Persistir numero, codigo de verificacao, XML/JSON enviado e retorno.
6. Gerar DANFSe ou link de consulta.
7. Implementar cancelamento/substituicao conforme padrao adotado.

## 8. Checklist de homologacao

- Configuracao fiscal cadastrada por empresa/filial/modelo em `HOMOLOGACAO`.
- Tela administrativa conferida com todas as configuracoes esperadas por unidade.
- Prontidao validada em `GET /configuracoes-fiscais/{id}/status` sem pendencias.
- Serie e proximo numero conferidos com contador/SEFAZ/municipio.
- Documento de homologacao preparado e persistido para pedido real antes da transmissao externa.
- Pedido preparado pela tela `Vendas > Nota fiscal` e marcado como `PREPARADO_HOMOLOGACAO` no controle interno.
- XML de homologacao gerado e persistido por modelo fiscal antes do retorno controlado.
- XML de homologacao validado internamente antes da transmissao externa.
- XML de homologacao baixado pela tela `Vendas > Nota fiscal` para conferencia manual.
- DANFE/DANFCE/DANFSe de homologacao gerado e baixado para conferencia manual apos autorizacao controlada.
- Payload JSON fiscal baixado pela tela `Vendas > Nota fiscal` para conferencia manual.
- XML de retorno fiscal baixado pela tela `Vendas > Nota fiscal` para conferencia manual.
- Bloco `Conclusao fiscal real` conferido na tela `Vendas > Nota fiscal`.
- Marcador de conclusao fiscal conferido em cada pedido antes de chamar contador/provedor.
- Pacote real, manifesto e validacao de integridade baixados para pelo menos um pedido piloto.
- Eventos fiscais conferidos na auditoria administrativa.
- Retorno de homologacao registrado como `AUTORIZADO` ou `REJEITADO`, com protocolo/chave/mensagem quando aplicavel.
- Cancelamento de homologacao registrado para documento autorizado quando necessario.
- Inutilizacao de numeracao registrada para documento rejeitado quando necessario.
- Alias do certificado e nomes de variaveis sensiveis preenchidos sem gravar segredo real no banco ou no Git.
- Validade do certificado A1 preenchida e com mais de 30 dias restantes.
- Certificado carregado sem expor senha no Git.
- Empresa/filial credenciada no ambiente correto.

### Mock local de provedor fiscal HTTP

Use o mock para testar o fluxo `Gerar XML -> Validar -> Transmitir` sem depender de emissor externo:

```powershell
$env:MOCK_FISCAL_TOKEN="token-http"
npm run mock:fiscal
```

Em automacoes Windows, se o processo do `npm` nao ficar ativo, execute diretamente:

```powershell
$env:MOCK_FISCAL_TOKEN="token-http"
node scripts/mock-fiscal-provider.js
```

Configure a aplicacao:

```powershell
$env:NEXUS_FISCAL_PROVIDER="http"
$env:MOCK_FISCAL_TOKEN="token-http"
```

Na configuracao fiscal em homologacao:

- `endpointHomologacao`: `http://localhost:8098/fiscal/homologacao`
- `provedorTokenEnv`: `MOCK_FISCAL_TOKEN`

Para simular rejeicao:

```powershell
$env:MOCK_FISCAL_STATUS="REJEITADO"
npm run mock:fiscal
```

Para variar o formato do retorno:

```powershell
$env:MOCK_FISCAL_RESPONSE_MODE="json"       # padrao Nexus
$env:MOCK_FISCAL_RESPONSE_MODE="sefaz-json" # JSON com cStat/xMotivo/chNFe/nProt
$env:MOCK_FISCAL_RESPONSE_MODE="xml"        # XML nfeProc direto
```

Com o mock rodando, valide HEAD e POST diretamente:

```powershell
$env:MOCK_FISCAL_TOKEN="token-http"
npm run test:fiscal-provider
```

Para validar rejeicao:

```powershell
npm run test:fiscal-provider -- -StatusEsperado REJEITADO
```
- Status de servico consultado com sucesso.
- XML/JSON validado antes do envio.
- Nota autorizada em homologacao.
- Rejeicao registrada com codigo e mensagem legivel.
- Cancelamento homologado.
- Inutilizacao homologada para NF-e/NFC-e.
- DANFE/DANFCE/DANFSe gerado e conferido.
- Pedido no Nexus One reflete chave, protocolo e status fiscal.
- Relatorios/exportacoes mostram status fiscal real.

Registre a homologacao no arquivo:

- `docs/EVIDENCIA_HOMOLOGACAO_FISCAL_REAL.md`

Ou gere uma copia para cliente/filial/modelo:

```powershell
.\scripts\gerar-evidencia-fiscal.ps1 `
  -Cliente "Nome do cliente" `
  -Filial "Matriz" `
  -Modelo "NFE" `
  -Ambiente "Homologacao oficial" `
  -Provedor "Nome do provedor"
```

## 9. Decisao de implementacao

Antes de codificar o emissor real, escolher uma rota:

- Integracao direta com SEFAZ/NFS-e: mais controle, mais manutencao.
- Provedor fiscal terceiro: menor tempo de homologacao, custo recorrente e dependencia externa.

Recomendacao pratica: iniciar com uma filial piloto, um modelo fiscal por vez e ambiente de homologacao.
