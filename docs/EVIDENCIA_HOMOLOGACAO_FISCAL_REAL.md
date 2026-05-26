# Evidencia de Homologacao Fiscal - Nexus One

Use este arquivo para registrar a homologacao fiscal por cliente, filial e modelo antes de liberar emissao real.

## Identificacao

- Cliente:
- Empresa/filial:
- Modelo fiscal: NF-e / NFC-e / NFS-e
- Ambiente: Mock local / Homologacao oficial / Producao restrita
- Data:
- Responsavel tecnico:
- Contador/responsavel fiscal:
- Provedor fiscal/SEFAZ/municipio:
- Certificado A1 valido ate:

## Configuracao Validada

- Empresa/filial com CNPJ e dados fiscais conferidos.
- Configuracao fiscal em `HOMOLOGACAO`.
- Serie e proximo numero aprovados pelo contador.
- Certificado configurado por variavel de ambiente, sem senha no Git.
- Provedor/token configurado fora do Git.
- Backup executado antes dos testes fiscais.

## Matriz de Testes

| Teste | Resultado | Evidencia | Observacao |
| --- | --- | --- | --- |
| Status fiscal sem pendencias | Pendente |  |  |
| Pedido preparado para homologacao | Pendente |  |  |
| XML gerado e persistido | Pendente |  |  |
| XML validado internamente | Pendente |  |  |
| XML baixado e conferido | Pendente |  |  |
| Payload JSON baixado e conferido | Pendente |  |  |
| Transmissao de homologacao enviada | Pendente |  |  |
| Retorno autorizado registrado | Pendente |  |  |
| Retorno rejeitado tratado com mensagem legivel | Pendente |  |  |
| DANFE/DANFCE/DANFSe gerado | Pendente |  |  |
| Cancelamento homologado quando aplicavel | Pendente |  |  |
| Inutilizacao homologada quando aplicavel | Pendente |  |  |
| Auditoria fiscal registrada | Pendente |  |  |
| Pacote real baixado para conferencia | Pendente |  |  |
| Contador aprovou emissao real | Pendente |  |  |

## Comandos de Apoio

Mock local autorizado:

```powershell
$env:MOCK_FISCAL_TOKEN="token-http"
npm run mock:fiscal
npm run test:fiscal-provider
```

Mock local rejeitado:

```powershell
$env:MOCK_FISCAL_STATUS="REJEITADO"
npm run mock:fiscal
npm run test:fiscal-provider -- -StatusEsperado REJEITADO
```

## Criterio de Aprovacao

- Todos os testes obrigatorios com resultado `Aprovado`.
- Contador aprovou dados fiscais, serie, numeracao e ambiente.
- Certificado valido e protegido.
- XML e documento auxiliar conferidos.
- Retorno autorizado/rejeitado testado.
- Producao somente liberada por modelo fiscal e filial homologados.

## Decisao

- [ ] Aprovado para producao restrita
- [ ] Aprovado apenas para homologacao
- [ ] Reprovado, manter mock/local

Pendencias:
-

Assinatura tecnica:
-

Assinatura contador/responsavel fiscal:
-

Assinatura do cliente:
-
