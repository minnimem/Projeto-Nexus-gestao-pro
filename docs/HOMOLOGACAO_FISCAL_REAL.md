# Homologacao Fiscal Real

Este roteiro organiza o caminho para evoluir o controle fiscal interno do Nexus One para emissao real de documentos fiscais.

> Importante: regras tributarias, enquadramento fiscal, CFOP, CST/CSOSN, aliquotas, series e obrigatoriedades devem ser validadas com contador e com a SEFAZ/municipio do contribuinte. Este documento e um roteiro tecnico de integracao.

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

- Certificado carregado sem expor senha no Git.
- Empresa/filial credenciada no ambiente correto.
- Status de servico consultado com sucesso.
- XML/JSON validado antes do envio.
- Nota autorizada em homologacao.
- Rejeicao registrada com codigo e mensagem legivel.
- Cancelamento homologado.
- Inutilizacao homologada para NF-e/NFC-e.
- DANFE/DANFCE/DANFSe gerado e conferido.
- Pedido no Nexus One reflete chave, protocolo e status fiscal.
- Relatorios/exportacoes mostram status fiscal real.

## 9. Decisao de implementacao

Antes de codificar o emissor real, escolher uma rota:

- Integracao direta com SEFAZ/NFS-e: mais controle, mais manutencao.
- Provedor fiscal terceiro: menor tempo de homologacao, custo recorrente e dependencia externa.

Recomendacao pratica: iniciar com uma filial piloto, um modelo fiscal por vez e ambiente de homologacao.
