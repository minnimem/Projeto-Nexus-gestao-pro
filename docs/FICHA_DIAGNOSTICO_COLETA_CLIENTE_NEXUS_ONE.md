# Ficha de Diagnostico e Coleta Inicial do Cliente - Nexus One

Data de referencia: 10/05/2026

Use esta ficha antes de proposta final, piloto assistido ou implantacao. Ela evita iniciar o projeto sem dados minimos sobre operacao, responsaveis, modulos, integracoes, fiscal, pagamentos, carga inicial e riscos.

## Objetivo da Reuniao

- Confirmar se a oportunidade pode receber proposta controlada.
- Separar o que entra no primeiro ciclo do que fica para fase 2.
- Identificar dependencias do cliente antes de prometer prazo.
- Definir se o caminho correto e demonstracao, piloto assistido ou producao controlada.

## Identificacao do Cliente

- Cliente:
- CNPJ:
- Segmento:
- Cidade/UF:
- Responsavel comercial:
- Responsavel operacional:
- Responsavel tecnico/TI:
- Responsavel financeiro:
- Responsavel fiscal/contador:
- Responsavel por privacidade/LGPD:

## Operacao Atual

- Quantidade de filiais:
- Quantidade de usuarios:
- Quantidade de caixas/PDV:
- Media de vendas por dia:
- Possui estoque fisico: sim / nao
- Possui entregas/logistica propria: sim / nao
- Possui ordem de servico/servicos: sim / nao
- Sistema atual:
- Principais dores:
- Dor prioritaria para resolver primeiro:
- Impacto atual da dor: tempo perdido / perda financeira / risco operacional / falta de controle / outro
- Urgencia: baixa / media / alta
- Orcamento estimado ou faixa aceita:

## Escopo Desejado

Marcar o que entra no primeiro ciclo:

- [ ] Vendas/pedidos.
- [ ] Orcamentos/propostas.
- [ ] CRM/follow-up.
- [ ] Caixa/PDV.
- [ ] Estoque/compras/inventario.
- [ ] Financeiro/contas/DRE/conciliacao.
- [ ] Fiscal.
- [ ] Logistica/entregas.
- [ ] Servicos/OS.
- [ ] Relatorios/BI.
- [ ] Usuarios/permissoes/auditoria.

Fase 2 ou fora do primeiro ciclo:

- 

## Dados para Carga Inicial

- Clientes:
- Produtos:
- Estoque inicial:
- Usuarios/perfis:
- Fornecedores:
- Contas a receber:
- Contas a pagar:
- Rotas/veiculos/entregadores:
- Dados fiscais:

Arquivos recebidos:

- [ ] clientes.csv
- [ ] produtos.csv
- [ ] usuarios.csv
- [ ] estoque-inicial.csv
- [ ] outros:

Qualidade dos dados:

- Origem dos dados:
- Responsavel pela conferencia:
- Dados sensiveis/LGPD envolvidos: sim / nao
- Necessita limpeza/tratamento antes da carga: sim / nao

## Fiscal, Pagamentos e Integracoes

- Precisa emitir nota fiscal pelo Nexus One: sim / nao
- Modelos fiscais: NF-e / NFC-e / NFS-e / outros
- Certificado A1 disponivel: sim / nao
- Contador definido: sim / nao
- Provedor fiscal definido: sim / nao
- Pix/boleto real no escopo: sim / nao
- Provedor de pagamento:
- WhatsApp/e-mail/webhook no escopo: sim / nao
- Canal de notificacao:

Classificacao das integracoes:

- Obrigatorias para iniciar:
- Desejaveis para fase 2:
- Fora do escopo inicial:

## Infraestrutura e Acesso

- Ambiente desejado: homologacao / producao controlada / producao
- Servidor/hosting definido: sim / nao
- Dominio/subdominio:
- Responsavel por DNS:
- Responsavel por backup:
- Canal de alerta/monitoramento:
- Janela preferida de implantacao:

## Treinamento e Suporte

- Usuarios-chave por perfil:
- Horario de atendimento do cliente:
- Canal de suporte preferido:
- Data sugerida de treinamento:
- Data sugerida para operacao assistida:

## Riscos Iniciais

| Risco | Status | Impacto | Responsavel | Acao |
| --- | --- | --- | --- | --- |
| Dados incompletos | Aberto / controlado / resolvido | Baixo / medio / alto |  |  |
| Fiscal sem contador/provedor | Aberto / controlado / resolvido | Baixo / medio / alto |  |  |
| Pagamento sem provedor | Aberto / controlado / resolvido | Baixo / medio / alto |  |  |
| Notificacao sem canal | Aberto / controlado / resolvido | Baixo / medio / alto |  |  |
| Usuario-chave indisponivel | Aberto / controlado / resolvido | Baixo / medio / alto |  |  |
| Servidor indefinido | Aberto / controlado / resolvido | Baixo / medio / alto |  |  |
| LGPD/responsavel de dados indefinido | Aberto / controlado / resolvido | Baixo / medio / alto |  |  |

## Minimo Para Proposta Controlada

- [ ] Dor prioritaria registrada.
- [ ] Decisor e responsavel operacional definidos.
- [ ] Plano ou faixa de plano provavel definida.
- [ ] Usuarios, filiais e caixas estimados.
- [ ] Modulos do primeiro ciclo separados de fase 2.
- [ ] Integracoes obrigatorias classificadas.
- [ ] Dependencias do cliente comunicadas.
- [ ] Cliente aceita piloto assistido ou producao controlada.

## Minimo Para Implantacao

- [ ] Proposta/aceite aprovado.
- [ ] Handoff comercial concluido.
- [ ] Responsaveis do cliente confirmados.
- [ ] Dados minimos recebidos ou plano de carga aprovado.
- [ ] Ambiente definido.
- [ ] Canais de suporte e treinamento definidos.
- [ ] Riscos bloqueantes sem pendencia aberta.

## Decisao de Qualificacao

- [ ] Pronto para proposta controlada.
- [ ] Pronto para piloto assistido.
- [ ] Precisa de homologacao tecnica antes da proposta.
- [ ] Precisa completar dados antes de avancar.
- [ ] Nao aderente ao momento atual.

Observacao:

## Proximos Passos

- Gerar plano de demo/prova de valor.
- Gerar escopo do plano comercial.
- Gerar proposta controlada.
- Solicitar arquivos de carga inicial.
- Agendar homologacao de integracoes.
- Agendar treinamento.
- Abrir registro de riscos/pendencias.

## Gerador

Use:

```powershell
.\scripts\gerar-ficha-diagnostico-cliente.ps1 -Cliente "Cliente" -Segmento "Comercio varejista" -Responsavel "Nexus One"
```

Arquive a ficha junto da proposta, do plano de demo e do pacote de entrega.
