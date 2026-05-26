# Checklist de Handoff Comercial, Implantacao e Suporte - Nexus One

Data de referencia: 10/05/2026

Este checklist formaliza a passagem de bastao entre comercial, implantacao e suporte. Use depois da proposta aceita e antes de iniciar homologacao, piloto assistido ou producao controlada.

## Objetivo

- Evitar promessa comercial sem escopo tecnico.
- Garantir que implantacao recebeu dados, limites, plano, riscos e responsaveis.
- Garantir que suporte conhece SLA, canais, criticidade do cliente e modulos contratados.
- Registrar pendencias antes de iniciar o trabalho com o cliente.

## Identificacao

- Cliente:
- CNPJ:
- Plano contratado:
- Ambiente: homologacao / piloto assistido / producao controlada / producao
- Responsavel comercial:
- Responsavel implantacao:
- Responsavel suporte:
- Responsavel do cliente:
- Data do handoff:

## Comercial Entrega Para Implantacao

- [ ] Proposta/contrato/aceite comercial.
- [ ] Ata de fechamento comercial com decisao, objecoes, riscos, limites e proximo passo.
- [ ] Faturamento, vencimento e forma de pagamento registrados quando aplicavel.
- [ ] Escopo do plano comercial.
- [ ] Limites de usuarios, filiais, caixas e modulos.
- [ ] Adicionais vendidos separadamente.
- [ ] Itens fora do escopo comunicados.
- [ ] Roteiro ou plano de demonstracao/prova de valor.
- [ ] Ficha de diagnostico/coleta inicial.
- [ ] Riscos comerciais, objecoes e promessas feitas ao cliente.

## Mapa de Promessas Comerciais

Registrar literalmente o que foi prometido ao cliente para evitar interpretacao diferente entre venda, implantacao e suporte.

| Promessa | Tipo | Status | Responsavel | Observacao |
| --- | --- | --- | --- | --- |
| Modulos incluidos | Incluso / opcional / fase 2 | Validado / pendente |  |  |
| Fiscal real | Incluso / condicionado / fora do escopo | Validado / pendente |  |  |
| Pix/boleto real | Incluso / condicionado / fora do escopo | Validado / pendente |  |  |
| Notificacoes externas | Incluso / condicionado / fora do escopo | Validado / pendente |  |  |
| Carga de dados | Incluso / adicional / fase 2 | Validado / pendente |  |  |
| Treinamento | Incluso / adicional / fase 2 | Validado / pendente |  |  |
| Suporte/SLA | Incluso / especial / fora do padrao | Validado / pendente |  |  |
| Customizacao | Incluso / adicional / backlog | Validado / pendente |  |  |

## Dependencias do Cliente

- [ ] Responsavel operacional disponivel.
- [ ] Usuarios-chave indicados.
- [ ] Dados para carga inicial entregues ou prazo definido.
- [ ] Responsavel LGPD definido para dados reais.
- [ ] Contador/fiscal disponivel quando houver fiscal no escopo.
- [ ] Conta/provedor de pagamento definido quando houver Pix/boleto real.
- [ ] Canal/token/webhook definido quando houver notificacao externa.
- [ ] Janela de treinamento e operacao assistida alinhada.

## Implantacao Recebe e Confere

- [ ] Modulos contratados conferidos.
- [ ] Responsaveis do cliente definidos.
- [ ] Usuarios-chave identificados.
- [ ] Dados para carga inicial solicitados.
- [ ] Integracoes externas classificadas como homologadas, sandbox ou fora do escopo.
- [ ] Ambiente pretendido definido.
- [ ] Janela de implantacao alinhada.
- [ ] Registro de riscos/pendencias aberto.

## Implantacao Entrega Para Suporte

- [ ] Plano contratado e SLA aplicavel.
- [ ] Canais de suporte do cliente.
- [ ] Usuarios-chave e contatos de emergencia.
- [ ] Modulos em operacao.
- [ ] Integracoes reais no escopo.
- [ ] Pendencias nao bloqueantes aceitas.
- [ ] Riscos altos ainda abertos.
- [ ] Rotina de backup/monitoramento definida.
- [ ] Data de inicio da operacao assistida.

## Suporte Confere Antes da Operacao

- [ ] Politica de SLA comunicada.
- [ ] Canal de acionamento testado.
- [ ] Responsavel de suporte definido.
- [ ] Ficha de incidente disponivel.
- [ ] Procedimento de escalonamento conhecido.
- [ ] Acesso a evidencias do pacote de entrega.
- [ ] Registro de riscos/pendencias acessivel.
- [ ] Go/No-Go e aceite arquivados quando aplicavel.

## Riscos Aceitos Para Iniciar

Somente iniciar quando os riscos aceitos forem nao bloqueantes e estiverem documentados.

| Risco | Severidade | Contorno operacional | Responsavel | Prazo |
| --- | --- | --- | --- | --- |
|  | Baixa / Media / Alta |  |  |  |

## Bloqueios de Handoff

Nao iniciar implantacao quando houver:

- Escopo comercial indefinido.
- Plano contratado sem limites de usuarios, filiais, caixas ou modulos.
- Integracao real prometida sem homologacao ou restricao registrada.
- Dados reais sem responsavel LGPD.
- Responsavel operacional do cliente indefinido.
- Suporte/SLA sem canal ou responsavel.
- Pendencia bloqueante sem plano de acao.
- Promessa comercial nao documentada.
- Dependencia critica do cliente sem responsavel ou prazo.
- Escopo de integracao real tratado como incluso sem homologacao ou condicao formal.

## Decisao

- [ ] Handoff aprovado para homologacao.
- [ ] Handoff aprovado para piloto assistido.
- [ ] Handoff aprovado para producao controlada.
- [ ] Handoff reprovado, retorna para comercial/cliente completar informacoes.

## Saidas Obrigatorias do Handoff

- [ ] Implantacao sabe exatamente o que entregar primeiro.
- [ ] Suporte sabe plano, SLA, canal, criticidade e contatos.
- [ ] Cliente sabe dependencias, limites e proximos passos.
- [ ] Registro de riscos/pendencias foi aberto ou atualizado.
- [ ] Cronograma de implantacao pode ser gerado.

Observacoes:

## Gerador

Use:

```powershell
.\scripts\gerar-handoff-comercial-implantacao-suporte.ps1 -Cliente "Cliente" -Plano "Medio" -ResponsavelComercial "Comercial" -ResponsavelImplantacao "Implantacao" -ResponsavelSuporte "Suporte"
```

Arquive o handoff junto do pacote de entrega e do registro de riscos/pendencias.
