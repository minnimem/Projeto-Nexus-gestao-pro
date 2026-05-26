# Checklist de Cliente Piloto - Nexus One

Use este roteiro para implantar o Nexus One em cliente piloto sem confundir demonstracao com producao definitiva.

Plano de 10 dias: `docs/PLANO_PILOTO_ASSISTIDO_NEXUS_ONE.md`.

## Status Comercial do Piloto

- Status atual: demonstracao liberada, piloto assistido liberado e venda controlada condicionada ao Go/No-Go do cliente.
- Venda ampla em escala: nao liberar antes de evidencias reais, aceite e cliente em saude Verde.
- Promessa comercial permitida: ERP/PDV operacional para vendas, caixa, estoque, financeiro, clientes, servicos, logistica e relatorios em producao controlada.
- Promessa comercial condicionada: emissao fiscal real, pagamento real, notificacoes externas e automacoes criticas somente quando a homologacao do cliente estiver registrada.
- Escopo obrigatorio do piloto: limitar usuarios, filiais, caixas, modulos e integracoes antes de iniciar.

## Portoes de Decisao

### G0 - Pode Demonstrar

- [ ] Roteiro de demonstracao revisado.
- [ ] Ambiente visual e dados de exemplo estaveis.
- [ ] Fluxos principais navegaveis sem erro: venda, caixa, estoque, financeiro, clientes e relatorios.
- [ ] Limites da demonstracao comunicados: fiscal real, pagamentos reais e integracoes podem depender de homologacao.

### G1 - Pode Vender Piloto Controlado

- [ ] Cliente qualificado no perfil ideal.
- [ ] Dor operacional e ganho esperado registrados.
- [ ] Plano comercial, preco, vencimento e condicoes aprovados.
- [ ] Proposta/aceite deixam claro que e piloto assistido ou producao controlada.
- [ ] Itens fora do escopo e promessas condicionadas foram documentados.
- [ ] Responsavel operacional do cliente definido.

### G2 - Pode Implantar

- [ ] Handoff comercial, implantacao e suporte concluido.
- [ ] Diagnostico/coleta inicial preenchido.
- [ ] Cronograma enviado ao cliente.
- [ ] Dados iniciais recebidos ou plano de carga aprovado.
- [ ] Responsavel LGPD definido para uso de dados reais.
- [ ] Ambiente, backup, monitoramento e segredos validados.
- [ ] Canais de suporte e SLA comunicados.

### G3 - Pode Virar Producao Comercial

- [ ] Caixa fecha sem divergencia nao explicada.
- [ ] Vendas, estoque, financeiro e relatorios foram usados com dados reais.
- [ ] Fiscal/pagamento/notificacoes reais homologados quando vendidos.
- [ ] Usuarios-chave conseguem operar sem suporte tecnico constante.
- [ ] Pendencias bloqueantes zeradas.
- [ ] Termo de aceite assinado.
- [ ] Saude do cliente classificada como Verde ou Verde com pendencias nao bloqueantes.

## Dados do Piloto

- Cliente:
- Responsavel do cliente:
- Responsavel tecnico:
- Data de inicio:
- Data prevista de encerramento:
- Ambiente: homologacao / producao controlada
- Modulos liberados:
- Filiais participantes:
- Usuarios participantes:

## Criterios de Entrada

- G1 aprovado para piloto controlado.
- G2 aprovado para implantacao.
- Contrato ou aceite de piloto registrado.
- Ambiente separado configurado.
- Banco PostgreSQL persistente configurado.
- Backup manual testado antes do uso real.
- `.env` real criado fora do Git.
- Usuario ADMIN criado.
- Pelo menos um usuario operacional criado por perfil usado no piloto.
- Produtos principais cadastrados.
- Clientes de teste/cliente real cadastrados.
- Caixa e formas de pagamento validados.
- Fluxo fiscal definido: mock, homologacao ou emissao real.
- Canal de notificacao definido: webhook, WhatsApp, email ou desativado.

## Roteiro Funcional Minimo

### Vendas

- Criar orcamento.
- Converter orcamento em pedido.
- Aplicar desconto.
- Registrar cliente.
- Gerar proposta comercial.
- Validar follow-up comercial.
- Validar separacao de pedido.

### Caixa

- Abrir caixa.
- Receber pedido em dinheiro, Pix, cartao e pagamento misto.
- Gerar comprovante.
- Fechar caixa com conciliacao.

### Estoque

- Conferir saldo inicial.
- Registrar entrada.
- Registrar baixa por venda.
- Validar alerta de estoque minimo.

### Financeiro

- Registrar receita e despesa.
- Validar contas pendentes e inadimplencia.
- Exportar DRE/fluxo.
- Conferir conciliacao com caixa/vendas.

### Fiscal

- Conferir dados da empresa e filial.
- Validar configuracao fiscal.
- Gerar espelho fiscal.
- Executar homologacao local ou externa.

### Logistica

- Criar entrega e rota.
- Vincular motorista e veiculo.
- Imprimir romaneio e comprovante de entrega.
- Validar status de rota.

### Admin

- Criar usuario operacional.
- Alterar perfil.
- Revogar e liberar acesso.
- Configurar permissao manual.
- Conferir auditoria.

## Criterios de Aceite

- G3 aprovado para producao comercial controlada.
- Usuario consegue operar venda completa sem suporte tecnico.
- Caixa fecha sem divergencia nao explicada.
- Estoque reflete venda e entrada corretamente.
- Financeiro reflete contas e recebimentos principais.
- Relatorios exportam CSV/PDF.
- Auditoria registra acoes sensiveis.
- Backup foi gerado e localizado.
- Responsavel do cliente aprovou fluxo principal.
- Diario de piloto preenchido nos dias executados.

## Saida do Piloto

Classificacao:
- Aprovado para contrato comercial.
- Aprovado com pendencias.
- Reprovado para producao, manter homologacao.

Pendencias obrigatorias:
-

Pendencias desejaveis:
-

Decisao comercial:
-

## Formalizacao

- Processo completo: `docs/PROCESSO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`.
- Termo de aceite: `docs/TERMO_ACEITE_IMPLANTACAO_NEXUS_ONE.md`.
- O piloto so deve virar producao comercial quando nao houver pendencia bloqueante aberta.
- Pendencias nao bloqueantes devem ter responsavel, prazo e impacto registrado.

Responsavel do cliente:

Nome:

Data:

Assinatura:

Responsavel Nexus One:

Nome:

Data:

Assinatura:
