# Processo de Implantacao de Cliente - Nexus One

Este processo transforma o piloto em uma implantacao controlada, com responsaveis, evidencias e aceite formal.

## 1. Abertura

Objetivo: registrar o escopo inicial e evitar expectativa solta.

- Cliente:
- CNPJ:
- Responsavel do cliente:
- Responsavel Nexus One:
- Data de abertura:
- Ambiente: homologacao / producao controlada / producao
- Modulos contratados:
- Filiais incluidas:
- Usuarios estimados:
- Data prevista de entrada assistida:

Evidencias obrigatorias:

- Contrato, proposta assinada ou aceite comercial.
- Ficha de diagnostico/coleta inicial preenchida conforme `docs/FICHA_DIAGNOSTICO_COLETA_CLIENTE_NEXUS_ONE.md`.
- Handoff comercial/implantacao/suporte preenchido conforme `docs/CHECKLIST_HANDOFF_COMERCIAL_IMPLANTACAO_SUPORTE_NEXUS_ONE.md`.
- Cronograma de implantacao definido conforme `docs/CRONOGRAMA_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`.
- Comunicacao inicial enviada conforme `docs/MODELOS_COMUNICACAO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`.
- Escopo de modulos liberados.
- Lista de usuarios iniciais.
- Responsavel operacional nomeado pelo cliente.

## 2. Preparacao Tecnica

Objetivo: deixar ambiente, banco, backup e segredos prontos antes de dados reais.

- Criar `.env` fora do Git.
- Executar `scripts/verificar-segredos.ps1 -EnvFile .env`.
- Subir ambiente com `docker-compose.prod.yml`.
- Executar `scripts/verificar-producao.ps1`.
- Validar backup com `scripts/backup-postgres.ps1`.
- Validar restauracao em ambiente separado com `scripts/restaurar-backup-postgres.ps1`.
- Registrar URL, data, responsavel e versao implantada.

Criterios de bloqueio:

- Segredo fraco ou placeholder no `.env`.
- Backend ou frontend sem healthcheck.
- Banco sem persistencia.
- Backup sem arquivo localizado.
- Restauracao nunca testada.

## 3. Carga Inicial

Objetivo: cadastrar o minimo para operar sem improviso.

Roteiro de carga: `docs/ROTEIRO_CARGA_INICIAL_DADOS_NEXUS_ONE.md`.

- Empresa e filial.
- Usuarios e perfis.
- Clientes principais.
- Produtos e estoque inicial.
- Formas de pagamento.
- Regras fiscais e modelo de emissao.
- Regras comerciais e follow-up.
- Motoristas, veiculos e rotas, quando logistica estiver no escopo.

Evidencias obrigatorias:

- Exportacao ou print dos cadastros base.
- Registro de quem conferiu os dados.
- Pendencias classificadas como bloqueantes ou nao bloqueantes.
- Arquivos de carga inicial verificados com `scripts/verificar-carga-inicial.ps1`, quando houver planilhas.

## 4. Treinamento Operacional

Objetivo: confirmar que o usuario opera o fluxo principal sem suporte tecnico direto.

Roteiro por perfil: `docs/ROTEIRO_TREINAMENTO_POR_PERFIL_NEXUS_ONE.md`.

- Vendas: orcamento, pedido, proposta, separacao e follow-up.
- Caixa: abertura, recebimento, comprovante, sangria/suprimento e fechamento.
- Estoque: entrada, baixa por venda, alerta minimo e inventario.
- Financeiro: contas, cobranca, conciliacao, DRE e fluxo.
- Fiscal: configuracao, espelho, homologacao e emissao conforme escopo.
- Logistica: entrega, rota, romaneio e comprovante.
- Admin: usuario, perfil, permissao e auditoria.

Criterios de aceite do treinamento:

- Pelo menos um usuario-chave executou o fluxo principal.
- Duvidas criticas foram registradas.
- Pendencias bloqueantes possuem responsavel e prazo.
- Evidencia de treinamento gerada por perfil participante.
- Registro de riscos e pendencias atualizado em `docs/REGISTRO_RISCOS_PENDENCIAS_CLIENTE_NEXUS_ONE.md`.

## 5. Operacao Assistida

Objetivo: acompanhar os primeiros dias de uso real com controle de risco.

Periodo sugerido: 3 a 10 dias uteis.

Plano sugerido: `docs/PLANO_PILOTO_ASSISTIDO_NEXUS_ONE.md`.
Cronograma de implantacao: `docs/CRONOGRAMA_IMPLANTACAO_CLIENTE_NEXUS_ONE.md`.

Rotina diaria:

- Conferir pedidos criados.
- Conferir caixa e recebimentos.
- Conferir saldo de estoque.
- Conferir contas geradas.
- Conferir erros de notificacao, fiscal e integracoes.
- Gerar backup diario.
- Registrar incidentes e decisoes.
- Gerar diario com `scripts/gerar-diario-piloto.ps1`.

Indicadores minimos:

- Vendas concluidas sem retrabalho critico.
- Caixa fechado sem divergencia nao explicada.
- Estoque coerente com entradas e vendas.
- Financeiro coerente com caixa/vendas.
- Relatorios exportados pelo usuario.
- Suporte sem incidente bloqueante aberto.

## 6. Aceite Formal

Objetivo: encerrar a implantacao com decisao clara.

Antes do aceite, preencher `docs/MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md` e revisar `docs/REGISTRO_RISCOS_PENDENCIAS_CLIENTE_NEXUS_ONE.md`.

Tambem gerar e arquivar o pacote de entrega com `scripts/gerar-pacote-entrega.ps1`, usando `docs/PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md` como checklist consolidado de documentos, evidencias, treinamento, backup, LGPD, integracoes e suporte.

Quando houver Go/No-Go, pendencia bloqueante ou aceite, usar os modelos de `docs/MODELOS_COMUNICACAO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md` para comunicar a decisao ao cliente.

Classificacao:

- Aprovado para producao comercial.
- Aprovado com pendencias nao bloqueantes.
- Mantido em operacao assistida.
- Reprovado para producao, retorna para homologacao.

Pendencias bloqueantes:

-

Pendencias nao bloqueantes:

-

Decisao:

-

Responsavel do cliente:

Nome:

Data:

Assinatura:

Responsavel Nexus One:

Nome:

Data:

Assinatura:
