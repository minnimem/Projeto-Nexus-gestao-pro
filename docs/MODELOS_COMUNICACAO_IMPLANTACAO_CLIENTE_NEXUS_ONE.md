# Modelos de Comunicacao de Implantacao - Nexus One

Data de referencia: 10/05/2026

Use estes modelos para padronizar comunicacoes com o cliente durante proposta, handoff, coleta de dados, cronograma, treinamento, operacao assistida, pendencias e aceite.

## Regras de Comunicacao

- Nao prometer producao ampla antes de Go/No-Go, homologacoes reais e aceite.
- Sempre informar proximos passos, responsaveis e prazo.
- Separar pendencia bloqueante de pendencia nao bloqueante.
- Registrar dependencias externas: fiscal, pagamento, notificacao, dados, servidor e responsaveis.
- Nao enviar senhas, tokens, certificados ou dados sensiveis por mensagem aberta.
- Antes de publicar D1 com dados reais, confirmar kick-off com decisor, responsavel operacional, dados, acessos, ambiente, suporte e treinamento.

## 1. Inicio de Implantacao

Assunto: Inicio da implantacao Nexus One - [Cliente]

Ola, [Nome].

Vamos iniciar a implantacao do Nexus One conforme escopo aprovado. Nesta etapa vamos confirmar dados, responsaveis, modulos contratados, ambiente, cronograma e criterios de aceite.

Proximos passos:
- confirmar ficha de diagnostico/coleta;
- validar cronograma de implantacao;
- alinhar usuarios-chave e treinamento;
- revisar integracoes e dependencias externas;
- iniciar preparacao tecnica.

Responsavel Nexus One: [Responsavel]
Responsavel do cliente: [Responsavel cliente]

## 2. Solicitacao de Dados

Assunto: Dados iniciais para implantacao Nexus One - [Cliente]

Ola, [Nome].

Para preparar o ambiente e evitar retrabalho, precisamos receber/conferir os dados iniciais do escopo contratado:

- usuarios e perfis;
- clientes principais;
- produtos e estoque inicial;
- filiais e caixas;
- formas de pagamento;
- dados fiscais, quando aplicavel;
- fornecedores, rotas ou entregadores, quando estiverem no escopo.

Os arquivos devem seguir os modelos de carga inicial quando houver importacao. Antes de usar dados reais, precisamos confirmar responsavel de privacidade/LGPD.

## 3. Convite de Kick-off

Assunto: Kick-off da implantacao Nexus One - [Cliente]

Ola, [Nome].

Para preparar o D1 com seguranca, vamos realizar uma reuniao curta de kick-off da implantacao.

Objetivos:
- confirmar decisor e responsavel operacional;
- revisar escopo, usuarios, filiais, dados e acessos;
- classificar ambiente e integracoes;
- alinhar treinamento, suporte e agenda D1-D10;
- registrar bloqueios antes de iniciar operacao assistida.

Participantes sugeridos:
- decisor do cliente;
- responsavel operacional do cliente;
- responsavel Nexus One;
- suporte Nexus One;
- tecnico/infra, quando houver ambiente ou integracao real.

Se algum item critico ainda nao estiver pronto, ajustaremos o cronograma antes de publicar D1.

## 4. Confirmacao de Cronograma

Assunto: Cronograma de implantacao Nexus One - [Cliente]

Ola, [Nome].

Segue o cronograma proposto para implantacao e operacao assistida. O D1 so deve iniciar quando handoff, diagnostico, escopo, dados minimos, responsaveis, ambiente e treinamento estiverem prontos.

Pontos de controle:
- preparacao tecnica;
- carga inicial;
- treinamento;
- operacao assistida;
- revisao de riscos/pendencias;
- Go/No-Go e aceite.

Caso alguma dependencia nao esteja pronta, o cronograma pode ser ajustado antes do inicio da operacao assistida.

## 5. Confirmacao de Treinamento

Assunto: Treinamento operacional Nexus One - [Cliente]

Ola, [Nome].

Vamos realizar o treinamento dos usuarios-chave conforme os perfis contratados. O objetivo e validar que o usuario consegue executar o fluxo principal sem suporte direto.

Perfis previstos:
- Admin/gestor;
- Vendas;
- Caixa;
- Estoque;
- Financeiro;
- Fiscal;
- Logistica/servicos, quando aplicavel.

Ao final, registraremos evidencia de treinamento e eventuais pendencias.

## 6. Pendencia Bloqueante

Assunto: Pendencia bloqueante na implantacao Nexus One - [Cliente]

Ola, [Nome].

Identificamos uma pendencia bloqueante que impede avancar para producao controlada neste momento.

Pendencia:
[Descrever]

Impacto:
[Descrever impacto]

Responsavel:
[Responsavel]

Prazo sugerido:
[Prazo]

Enquanto esta pendencia estiver aberta, a recomendacao e manter o ambiente em homologacao ou operacao assistida.

## 7. Pendencia Nao Bloqueante

Assunto: Pendencia nao bloqueante registrada - Nexus One - [Cliente]

Ola, [Nome].

Registramos uma pendencia nao bloqueante. Ela nao impede a continuidade do fluxo contratado, mas precisa ficar acompanhada no plano de acao.

Pendencia:
[Descrever]

Responsavel:
[Responsavel]

Prazo:
[Prazo]

Seguiremos com a operacao conforme escopo aprovado.

## 8. Go/No-Go

Assunto: Decisao Go/No-Go - Nexus One - [Cliente]

Ola, [Nome].

Concluimos a revisao de Go/No-Go da implantacao.

Decisao:
[Go demonstracao / Go piloto assistido / Go producao controlada / Go producao ampla / No-go]

Resumo:
- pendencias bloqueantes:
- pendencias nao bloqueantes:
- integracoes homologadas:
- integracoes pendentes/fora do escopo:

Quando aplicavel, seguiremos para assinatura do termo de aceite ou prorrogacao da operacao assistida.

## 9. Aceite

Assunto: Aceite da implantacao Nexus One - [Cliente]

Ola, [Nome].

Com os fluxos do escopo contratado apresentados, testados e validados, encaminhamos a etapa de aceite da implantacao.

O aceite confirma:
- escopo entregue;
- pendencias bloqueantes ausentes ou decisao formal registrada;
- pendencias nao bloqueantes aceitas, quando houver;
- criterios de suporte e SLA comunicados;
- proximos passos definidos.

## Gerador

Use:

```powershell
.\scripts\gerar-comunicacao-implantacao.ps1 -Cliente "Cliente" -Tipo "Inicio" -Responsavel "Nexus One"
```

Tipos aceitos: `Inicio`, `Dados`, `Cronograma`, `Treinamento`, `PendenciaBloqueante`, `PendenciaNaoBloqueante`, `GoNoGo`, `Aceite`.
