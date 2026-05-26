# Nexus One - Gestao Pro

Sistema de gestao com frontend React/Vite e backend Spring Boot. O frontend oficial fica em `frontend/` e conecta no backend existente em `backend/projectoads/projectoads`.

## Estrutura do projeto

```text
nexus-gestao-pro/
  frontend/                    React + Vite + Nginx do frontend
    src/
    package.json
    vite.config.js
    Dockerfile
    nginx.conf
  backend/projectoads/projectoads/
    src/
    pom.xml
    Dockerfile
  docs/                        Documentacao operacional/comercial
  scripts/                     Automacoes, validacoes e geradores
  reports/                     Relatorios gerados localmente
```

Guia detalhado: `docs/GUIA_ESTRUTURA_PROJETO_NEXUS_ONE.md`.

Validador da estrutura:

```bash
powershell -ExecutionPolicy Bypass -File scripts/verificar-estrutura-projeto.ps1 -SkipBuild
```

## API conectada

- Backend: `http://localhost:8081`
- Login: `POST /auth/login`
- Payload: `{ "login": "...", "senha": "..." }`
- Token: armazenado em `sessionStorage` e enviado como `Authorization: Bearer <token>`

## Fluxo local sem Docker

Use este caminho enquanto o Docker nao estiver em uso:

1. Suba um PostgreSQL local com o banco `TB_ADS`.
2. Configure as variaveis do backend no terminal.
3. Rode o backend com Maven.
4. Rode o frontend pela raiz do projeto.

Exemplo PowerShell para o backend:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/TB_ADS"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="sua-senha-local"
$env:JWT_SECRET="trocar_por_uma_chave_local_com_32_ou_mais_caracteres"
$env:NEXUS_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
cd backend/projectoads/projectoads
mvn spring-boot:run
```

Em outro terminal, rode o frontend:

```powershell
npm run dev
```

Ou use o atalho local, que define `VITE_API_URL` para `http://localhost:8081`:

```powershell
npm run dev:frontend:local
```

Depois de gerar `.env.local`, o backend tambem pode ser iniciado por atalho:

```powershell
npm run dev:backend:local
```

Se Java/Maven nao estiverem no `PATH`, use o script diretamente com `-JavaHome` e `-MavenPath`.

Para validar antes de testar manualmente:

```powershell
npm run build
cd backend/projectoads/projectoads
mvn test
```

Ou use o verificador local sem Docker:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verificar-local-sem-docker.ps1
```

Para apenas checar estrutura e ferramentas, sem rodar build/testes:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verificar-local-sem-docker.ps1 -SkipFrontendBuild -SkipBackendTests
```

Se Java ou Maven nao estiverem no `PATH`, informe os caminhos diretamente:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verificar-local-sem-docker.ps1 `
  -JavaHome "C:\Users\LENOVO\.jdks\ms-21.0.10" `
  -MavenPath "C:\Users\LENOVO\.m2\wrapper\dists\apache-maven-3.9.14-bin\1cb7fhup6b5n3bed6kckbrnspv\apache-maven-3.9.14\bin\mvn.cmd"
```

Para validar somente o arquivo `.env` real:

```powershell
npm run check:env
```

Para gerar auditoria sem expor os valores sensiveis:

```powershell
npm run audit:env
```

Para gerar um `.env.local` ignorado pelo Git:

```powershell
npm run init:env:local
```

Depois edite a senha do banco em `.env.local` e valide:

```powershell
npm run check:env:local
npm run audit:env:local
```

## Rodar frontend

1. Abra a pasta `nexus-gestao-pro` no IntelliJ ou VS Code.
2. Crie um arquivo `.env` copiando `.env.example`.
3. Rode:

```bash
npm --prefix frontend install
npm run dev
```

4. Acesse `http://localhost:5173`.

Opcao direta dentro da pasta do frontend:

```bash
cd frontend
npm install
npm run dev
```

## Rodar backend

O backend deve estar rodando em `http://localhost:8081`.

Requisitos:

- Java 21
- Maven
- PostgreSQL local com banco `TB_ADS`

Backend local:

```text
backend/projectoads/projectoads
```

Comando:

```bash
mvn spring-boot:run
```

Configuracao principal:

- Arquivo: `backend/projectoads/projectoads/src/main/resources/application.yml`
- Banco: `jdbc:postgresql://localhost:5432/TB_ADS`
- Porta: `8081`

Variaveis recomendadas para rodar o backend:

```bash
DB_URL=jdbc:postgresql://localhost:5432/TB_ADS
DB_USERNAME=postgres
DB_PASSWORD=sua-senha-local
JWT_SECRET=trocar_por_uma_chave_local_com_32_ou_mais_caracteres
NEXUS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Se `DB_URL` e `DB_USERNAME` nao forem informadas, o backend usa os valores locais acima. A senha do banco deve ser informada por `DB_PASSWORD`. O `JWT_SECRET` e obrigatorio e deve ter pelo menos 32 caracteres. Existe um modelo completo em `.env.backend.example`.

## Modulos ja mapeados

- `/auth/login`
- `/clientes`
- `/produtos`
- `/estoque`
- `/pedidos`
- `/caixas`
- `/financeiro`
- `/financeiro/follow-ups`
- `/configuracoes-fiscais`
- `/logistica`
- `/notificacoes/estoque-baixo/enviar`
- `/notificacoes/follow-ups/enviar`
- `/notificacoes/resumo-diario/enviar`
- `/ordens-servico`
- `/rotas-entrega`
- `/pedidos/follow-ups`
- `/usuarios`

## Notificacoes externas

O backend pode enviar follow-ups de cobranca e comerciais vencidos/para hoje para um webhook externo.
Por padrao fica desligado. Para ativar:

```bash
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_WEBHOOK_URL=https://seu-webhook.com/endpoint
NOTIFICATIONS_TOKEN=token-opcional
NOTIFICATIONS_FOLLOW_UP_CRON="0 0 8 * * *"
NOTIFICATIONS_STOCK_CRON="0 15 8 * * *"
NOTIFICATIONS_DAILY_SUMMARY_CRON="0 0 18 * * *"
```

O envio marca o follow-up como notificado para evitar repeticao automatica.
Para testar sem aguardar o agendamento, use `POST /notificacoes/follow-ups/enviar` com usuario `ADMIN` ou `GERENTE`.
No frontend, o mesmo disparo aparece no Financeiro em `Agenda de cobranca` e em Vendas no bloco `Follow-up comercial`, quando houver follow-up vencido ou de hoje.
Alertas de estoque baixo tambem podem ser enviados automaticamente pelo agendamento, manualmente por `POST /notificacoes/estoque-baixo/enviar`, ou pelo botao `Notificar` na aba Estoque.
Resumo diario pode ser enviado automaticamente pelo agendamento ou manualmente por `POST /notificacoes/resumo-diario/enviar`.

## Homologacao Asaas

O roteiro de sandbox para Pix, boleto e webhook esta em `docs/HOMOLOGACAO_ASAAS.md`.
O script `scripts/test-asaas-webhook.ps1` simula eventos do Asaas contra o backend local.

## Homologacao de notificacoes externas

O roteiro para follow-ups, estoque baixo e resumo diario esta em `docs/HOMOLOGACAO_NOTIFICACOES.md`.
O script `scripts/mock-notification-webhook.js` sobe um receptor local para conferir os payloads enviados pelo backend.

## Homologacao de etiquetas

O roteiro para impressao/leitura de etiquetas Code128 esta em `docs/HOMOLOGACAO_ETIQUETAS_CODE128.md`.
O script `scripts/generate-code128-label-calibration.js` gera uma folha HTML de calibracao.

## Ordem de servico

O backend possui a base de Ordem de Servico em `GET/POST/PUT /ordens-servico`.
O endpoint `PATCH /ordens-servico/{id}/status` permite acompanhar o fluxo operacional da OS entre `ABERTA`, `EM_ANALISE`, `APROVADA`, `EM_EXECUCAO`, `CONCLUIDA`, `FATURADA` e `CANCELADA`.
A OS vincula empresa, filial opcional, cliente, tecnico opcional, titulo, descricao, checklist, prazo e valor estimado.
O frontend possui o modulo `Servicos` no menu principal para abrir OS, acompanhar KPIs, filtrar status, exportar CSV/PDF e mover a OS no fluxo operacional.

## Homologacao fiscal real

O roteiro tecnico para evoluir NF-e, NFC-e e NFS-e reais esta em `docs/HOMOLOGACAO_FISCAL_REAL.md`.
O passo a passo curto para testar a homologacao fiscal local com mock esta em `docs/GUIA_HOMOLOGACAO_FISCAL_LOCAL.md`.
O modulo fiscal esta aproximadamente 98% concluido para homologacao controlada e preparacao tecnica de emissao real; os 2% finais dependem de certificado real, credenciamento, schemas oficiais, QR Code oficial da NFC-e e validacao tributaria do contador.
O backend ja possui a base administrativa `GET/POST/PUT /configuracoes-fiscais` para cadastrar configuracoes por empresa/filial/modelo fiscal sem versionar segredos de certificado ou CSC.
O endpoint `GET /configuracoes-fiscais/{id}/status` valida a prontidao minima de homologacao antes de iniciar emissao real.
O endpoint `GET /configuracoes-fiscais/{id}/status-servico` tambem valida se as variaveis de ambiente de arquivo/senha do certificado e CSC existem, sem expor os valores sensiveis.
Configuracoes fiscais tambem registram a validade do certificado A1 e bloqueiam prontidao quando o certificado estiver vencido ou vencendo em ate 30 dias; o checklist/status/pacote de emissao real tambem sinalizam essa pendencia.
O endpoint `POST /documentos-fiscais/homologacao` prepara um documento fiscal de homologacao vinculado ao pedido, consome a numeracao da configuracao e persiste o payload JSON base antes de qualquer transmissao externa.
O fluxo de homologacao bloqueia configuracoes fiscais em `PRODUCAO`, evitando consumo acidental de numeracao real antes da emissao oficial estar homologada.
O endpoint `PATCH /documentos-fiscais/{id}/gerar-xml-homologacao` gera e persiste o XML de envio interno por modelo (`NFE`, `NFCE` ou `NFSE`), movendo o documento para `EM_PROCESSAMENTO`.
O cadastro da empresa aceita dados fiscais do emitente como inscricao estadual, inscricao municipal, regime tributario, CRT, CEP e codigo IBGE do municipio.
O cadastro de clientes aceita endereco fiscal estruturado do destinatario: numero, bairro, cidade, UF, CEP, codigo IBGE do municipio e inscricao estadual opcional.
O cadastro de produtos aceita dados fiscais opcionais como NCM, CFOP, CEST, origem fiscal, unidade comercial, CST/CSOSN, aliquotas basicas de ICMS, PIS, COFINS e IPI, alem de codigo de servico municipal/nacional e aliquota ISS para NFS-e.
O payload JSON e o XML de homologacao incluem blocos de emitente, destinatario, itens fiscais, codigo de barras, NCM, CFOP, CEST, origem, unidade, tributacao, dados de servico, total por item e pendencias fiscais como CNPJ, IE, IM, CRT, CEP, codigo municipio, CPF, UF, endereco do destinatario e CSC, aproximando a conferencia da emissao real.
As pendencias fiscais tambem validam formato de CNPJ, CPF, UF, CEP, codigo IBGE do municipio, NCM, CFOP, CEST, origem fiscal, CST/CSOSN, aliquotas, codigo de servico e ISS, evitando homologar dados preenchidos de forma incompleta.
As pendencias fiscais tambem ficam persistidas no DocumentoFiscal e aparecem no resumo da fila fiscal para sinalizar cadastro fiscal pendente.
Documentos com pendencias fiscais persistidas ficam bloqueados para transmissao, regularizacao de contingencia e retorno manual ate o cadastro ser corrigido.
Na fila fiscal, a acao `Pendencias` baixa um TXT com a lista de ajustes cadastrais necessarios antes da emissao real, e a acao `Revalidar` recalcula as pendencias apos a correcao dos cadastros.
O XML de homologacao recebe um bloco `AssinaturaHomologacao` com digest SHA-256 e referencias ao certificado, preparando a troca por assinatura A1 real.
Para usar assinatura XML criptografica com certificado PKCS12/A1, configure `NEXUS_FISCAL_XML_SIGNER=pkcs12` e informe as variaveis cadastradas em `certificadoArquivoEnv` e `certificadoSenhaEnv`.
Para transmitir para um emissor fiscal HTTP externo, configure `NEXUS_FISCAL_PROVIDER=http`; o sistema enviara `xmlEnvio`, modelo, ambiente, serie, numero, pedido e empresa para o endpoint fiscal do ambiente configurado.
Quando `provedorTokenEnv` estiver preenchido na configuracao fiscal, o provedor HTTP resolve essa variavel de ambiente e envia `Authorization: Bearer <token>` sem persistir o token real.
O provedor HTTP interpreta retornos de emissores externos com campos padrao, aliases e campos SEFAZ (`chaveAcesso`/`chave`/`chNFe`, `protocolo`/`protocoloAutorizacao`/`nProt`, `xmlRetorno`/`nfeProc`, `cStat`, `xMotivo`), inclusive quando o JSON vem aninhado em `data`, `result`, `resultado`, `documento` ou `retorno`, aceita XML direto com namespace fiscal no corpo da resposta e persiste `danfeHtml` quando o emissor devolver o documento auxiliar.
O contrato do provedor HTTP esta coberto por teste unitario para envio, autorizacao, rejeicao, aliases de retorno, DANFE retornado e falta de segredos fiscais.
Para homologacao local sem emissor externo, use `npm run mock:fiscal`, opcionalmente varie `MOCK_FISCAL_RESPONSE_MODE=json|sefaz-json|xml`, valide com `npm run test:fiscal-provider` e configure `endpointHomologacao=http://localhost:8098/fiscal/homologacao`.
Quando `NEXUS_FISCAL_PROVIDER=http`, o status de servico fiscal consulta o endpoint com `HEAD` e informa disponibilidade HTTP real ou falha de resposta.
Os timeouts HTTP fiscais sao configuraveis por `NEXUS_FISCAL_HTTP_CONNECT_TIMEOUT_MS`, `NEXUS_FISCAL_HTTP_READ_TIMEOUT_MS` e `NEXUS_FISCAL_HTTP_STATUS_READ_TIMEOUT_MS`.
O endpoint `PATCH /documentos-fiscais/{id}/validar-xml-homologacao` valida a estrutura minima do XML gerado antes da transmissao externa, incluindo itens, totais e bloco de tributacao, e move o documento para `XML_VALIDADO`.
O endpoint `PATCH /documentos-fiscais/{id}/revalidar-pendencias-homologacao` recalcula pendencias fiscais, payload e XML apos ajustes cadastrais, retornando o documento para `EM_PROCESSAMENTO`.
O endpoint `PATCH /documentos-fiscais/{id}/reprocessar-rejeicao-homologacao` reprocessa documento `REJEITADO` apos correcao, mantendo numero/documento e regenerando payload/XML para nova validacao interna.
O endpoint `PATCH /documentos-fiscais/{id}/transmitir-homologacao` e os retornos manuais de autorizacao/rejeicao executam somente apos `XML_VALIDADO`, mantendo o encaixe preparado para substituir pelo provedor fiscal real.
O endpoint `PATCH /documentos-fiscais/{id}/contingencia-homologacao` registra contingencia controlada quando o XML esta em processamento e o provedor fiscal esta indisponivel, mantendo XML de retorno, mensagem e auditoria para regularizacao posterior.
O endpoint `PATCH /documentos-fiscais/{id}/regularizar-contingencia-homologacao` retransmite o XML de documento em contingencia pelo provedor configurado e move o documento para autorizado ou rejeitado conforme retorno.
O endpoint `PATCH /documentos-fiscais/{id}/gerar-danfe-homologacao` gera um HTML auxiliar de conferencia para documento autorizado ou em contingencia de homologacao.
O endpoint `PATCH /documentos-fiscais/{id}/carta-correcao-homologacao` registra CC-e controlada para NF-e autorizada, gerando XML de evento separado com texto, sequencia, chave e protocolo de autorizacao.
O endpoint `GET /documentos-fiscais/{id}/consulta-homologacao` retorna um diagnostico operacional do documento fiscal com status, chave, protocolo, totalizadores de arquivos/pendencias/acoes, pendencias, arquivos disponiveis e proxima acao recomendada.
O endpoint `GET /documentos-fiscais/{id}/dossie-homologacao` gera um TXT consolidado de conferencia com status, chave, protocolo, resumo de arquivos/pendencias/acoes, arquivos disponiveis, pendencias, CC-e e proxima acao operacional.
O endpoint `GET /documentos-fiscais/{id}/checklist-emissao-real` gera um TXT de prontidao real com itens prontos, totalizadores, pendencias, percentual e proxima acao para producao, certificado, endpoint, token e CSC quando aplicavel.
O endpoint `GET /documentos-fiscais/{id}/status-emissao-real` retorna a prontidao real em JSON, com percentual, itens prontos, totalizadores, pendencias internas, pendencias externas/oficiais e proxima acao.
O endpoint `GET /documentos-fiscais/{id}/pacote-emissao-real` exporta um JSON operacional com metadados, XML, payload, hashes SHA-256, referencia tecnica, aliases de certificado/provedor, checklist estruturado, totalizadores, pendencias externas/oficiais e proxima acao para apoio ao provedor/contador.
O endpoint `GET /documentos-fiscais/{id}/manifesto-pacote-emissao-real` gera um TXT curto com referencia do pacote, hashes, status, prontidao, totalizadores, pendencias e proxima acao para conferencia de integridade.
O endpoint `GET /documentos-fiscais/{id}/validar-integridade-pacote-emissao-real` retorna se o pacote real esta integro, com hashes, referencia, itens prontos, total de pendencias, percentual de prontidao, pendencias de payload/XML/checklist real e proxima acao.
Para NFC-e, o XML e o DANFCE de homologacao incluem um QR Code interno com hash de conferencia; o QR Code oficial ainda depende da autorizacao fiscal real.
Para NFS-e, o XML de homologacao inclui bloco de servico com codigo municipal/nacional, municipio de incidencia, aliquota ISS e discriminacao inicial.
Os endpoints `PATCH /documentos-fiscais/{id}/autorizar-homologacao` e `PATCH /documentos-fiscais/{id}/rejeitar-homologacao` registram retorno controlado de homologacao com protocolo, chave e mensagem.
O endpoint `PATCH /documentos-fiscais/{id}/cancelar-homologacao` registra cancelamento controlado de documento autorizado em homologacao.
O endpoint `PATCH /documentos-fiscais/{id}/inutilizar-homologacao` registra inutilizacao controlada de numeracao apos rejeicao em homologacao.
O endpoint `GET /documentos-fiscais/pedidos?ids=...` carrega documentos fiscais em lote para a tela `Vendas > Nota fiscal`, incluindo totais de arquivos disponiveis e pendencias fiscais.
O endpoint `GET /documentos-fiscais/{id}` retorna o documento fiscal completo, incluindo XML/payload, para consultas pontuais.
O endpoint `GET /configuracoes-fiscais/{id}/status-servico` consulta a disponibilidade controlada do servico fiscal configurado.
Na tela `Vendas > Nota fiscal`, a acao `Homologar` prepara o documento fiscal do pedido usando a configuracao NFE ativa da filial ou da empresa.
Quando o documento esta `EM_PROCESSAMENTO`, a tela `Vendas > Nota fiscal` mostra a acao `Validar`; depois de `XML_VALIDADO`, mostra `Transmitir`, `Contingencia`, `Autorizar` e `Rejeitar`; quando esta em `CONTINGENCIA`, mostra `Regularizar` para reenviar ao provedor.
Na fila fiscal, a acao `Consulta` mostra a situacao atual da homologacao, totais de arquivos/pendencias, chave/protocolo quando existirem e proxima acao operacional.
Quando o documento esta `REJEITADO`, a tela mostra `Reprocessar` para corrigir/revalidar antes de inutilizar a numeracao.
Quando `xmlEnvio` existe, a tela `Vendas > Nota fiscal` permite baixar o XML de homologacao do pedido.
Quando `payloadJson` existe, a tela `Vendas > Nota fiscal` tambem permite baixar o JSON fiscal preparado.
Os retornos controlados de homologacao geram `xmlRetorno` padrao, baixavel pela tela `Vendas > Nota fiscal`.
Quando `danfeHtml` existe, a tela `Vendas > Nota fiscal` permite baixar o documento auxiliar fiscal em HTML para conferencia/impressao.
Quando a NF-e autorizada possui CC-e controlada, a tela `Vendas > Nota fiscal` permite baixar o XML CC-e sem substituir XML de envio ou retorno.
O bloco `Conclusao fiscal real` resume pacotes prontos, pendencias cadastrais, configuracoes prontas, pedidos ainda em homologacao e a proxima acao da fila fiscal.
Cada pedido fiscal exibe marcador operacional: `Corrigir cadastro`, `Gerar pacote base`, `Concluir homologacao`, `Aguardando homologacao` ou `Pacote real pronto`.
Quando ha cadastro fiscal pendente, a fila mostra tambem a quantidade de pendencias fiscais no marcador.
Na fila fiscal, a acao `Dossie` baixa um TXT consolidado para conferencia operacional com contador/provedor.
Na fila fiscal, a acao `Checklist real` baixa os bloqueios que ainda separam a homologacao controlada da emissao oficial.
Na fila fiscal, a acao `Status real` consulta o percentual de prontidao, quantidade de pendencias e resumo dos primeiros bloqueios sem baixar arquivo.
Na fila fiscal, a acao `Pacote real` baixa o JSON consolidado de transicao para emissao real, sem transmitir ou autorizar a nota, e avisa na tela quando o pacote ainda possui pendencias.
Na fila fiscal, a acao `Manifesto` baixa o comprovante de integridade do pacote real.
Na fila fiscal, a acao `Validar pacote` confere integridade do pacote real antes do envio externo e mostra a proxima acao quando houver bloqueio.
As transicoes fiscais de homologacao registram auditoria administrativa no modulo Fiscal.
No frontend, a tela `Admin > Configuracao fiscal` permite cadastrar, editar e exportar essas configuracoes por unidade.

## Validacao rapida

```bash
npm run build
```

```bash
cd backend/projectoads/projectoads
mvn -DskipTests compile
```

```bash
cd backend/projectoads/projectoads
mvn test
```

Os testes Spring/repository usam H2 em memoria via `src/test/resources/application.yml`, entao a suite local nao depende da senha do PostgreSQL. A aplicacao em execucao continua usando PostgreSQL conforme `src/main/resources/application.yml`.
Validacao mais recente em 21/05/2026: `mvn test` com 122 testes sem falhas.
Validacao frontend mais recente em 08/05/2026: `npm run build` aprovado apos a rodada de polimento premium, exportacao unificada, status visuais, central de alertas e ajuste do Caixa/PDV para formato POS em duas colunas, com total destacado e identidade por forma de pagamento. O Vite segue avisando que o bundle JS passa de 500 kB porque o `App.jsx` concentra muitos modulos; isso nao bloqueia o build, mas recomenda code splitting/refatoracao futura.

## Caixa / PDV

- `ADMIN`, `GERENTE` e `OPERADOR_CAIXA` podem abrir e operar caixa.
- `FINANCEIRO` pode acompanhar indicadores e relatorios sem operar recebimento direto quando o perfil estiver restrito.
- `VENDEDOR` nao acessa Caixa; vendas seguem para recebimento pelo operador autorizado.
- Follow-up comercial usa permissao propria de vendas: `ADMIN`, `GERENTE` e `VENDEDOR` podem criar, concluir e cancelar follow-ups sem liberar acesso ao Caixa.
- Mesmo com permissao extra manual, `VENDEDOR` nao consegue liberar `module:caixa` nem `action:operateCash`; Caixa e uma regra protegida.
- `OPERADOR_CAIXA` acessa apenas o modulo Caixa.
- Movimentacoes manuais incluem `PAGAMENTO_RECEBIDO`, `SUPRIMENTO` e `SANGRIA`.
- Vendas finalizadas registram movimento `VENDA` automaticamente no caixa aberto do operador.
- Se nao houver caixa aberto, a finalizacao da venda e bloqueada ate abrir caixa.
