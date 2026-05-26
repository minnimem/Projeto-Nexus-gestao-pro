param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Ambiente = "producao controlada",

    [string]$Responsavel = "Nexus One",

    [string]$OutputDir = "reports\entrega"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$resolvedOutput = if ([System.IO.Path]::IsPathRooted($OutputDir)) {
    $OutputDir
} else {
    Join-Path $root $OutputDir
}

New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$slug = ($Cliente -replace '[^a-zA-Z0-9_-]+', '-').Trim('-').ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($slug)) {
    $slug = "cliente"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$arquivo = Join-Path $resolvedOutput "pacote-entrega-$slug-$timestamp.txt"

$itens = @(
    @{ Grupo = "Comercial"; Caminho = "docs\FICHA_PRONTIDAO_COMERCIAL_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\PLANO_LIBERACAO_COMERCIAL_AMPLA_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\PLAYBOOK_COMERCIAL_QUALIFICACAO_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\MATRIZ_SELECAO_CLIENTE_PILOTO_REAL_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\PLANO_EXECUCAO_PRIMEIRO_CLIENTE_REAL_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\AUDITORIA_EVIDENCIAS_CLIENTE_REAL_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\PLANO_LANCAMENTO_COMERCIAL_CONTROLADO_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\RELATORIO_RESULTADO_LOTE_COMERCIAL_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\DECISAO_EXPANSAO_COMERCIAL_POS_LOTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\MATRIZ_CAPACIDADE_OPERACIONAL_ESCALA_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\MATRIZ_VIABILIDADE_FINANCEIRA_ESCALA_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\MATRIZ_POSICIONAMENTO_COMPETITIVO_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\ONE_PAGE_COMERCIAL_DECISOR_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\FICHA_ROI_VALOR_PERCEBIDO_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\ATA_FECHAMENTO_COMERCIAL_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\FICHA_DIAGNOSTICO_COLETA_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\CHECKLIST_CONTRATO_TERMOS_COMERCIAIS_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\PROCESSO_FATURAMENTO_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\PROCESSO_RENOVACAO_RETENCAO_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\PROCESSO_OFFBOARDING_ENCERRAMENTO_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\AUTORIZACAO_REFERENCIA_COMERCIAL_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $false },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-selecao-cliente-piloto-real.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-plano-primeiro-cliente-real.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-auditoria-evidencias-cliente-real.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-plano-lancamento-comercial.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-resultado-lote-comercial.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-decisao-expansao-comercial.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-capacidade-operacional-escala.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-viabilidade-financeira-escala.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-escopo-plano-comercial.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-qualificacao-oportunidade.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-posicionamento-competitivo.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-onepage-comercial-decisor.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-roi-valor-percebido.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-ata-fechamento-comercial.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-checklist-contrato-comercial.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-faturamento-cliente.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-renovacao-retencao-cliente.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-offboarding-cliente.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-ficha-diagnostico-cliente.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-autorizacao-referencia-comercial.ps1"; Obrigatorio = $false },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-decisao-liberacao-comercial.ps1"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\REGISTRO_RISCOS_PENDENCIAS_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "docs\TERMO_ACEITE_IMPLANTACAO_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Comercial"; Caminho = "scripts\gerar-termo-aceite-implantacao.ps1"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "docs\GUIA_PRODUCAO_TECNICA_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "docs\GUIA_DEPLOY_SERVIDOR_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "docs\GUIA_AMBIENTE_HOMOLOGACAO_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "docs\GUIA_PROVISIONAMENTO_BANCO_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "docs\ROTINA_MONITORAMENTO_BACKUP_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "docs\PROCESSO_RELEASE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "docs\PROCESSO_NOTAS_VERSAO_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "docs\ROTEIRO_SMOKE_TEST_OPERACIONAL_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "scripts\verificar-predeploy.ps1"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "scripts\verificar-producao.ps1"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "scripts\gerar-manifesto-release.ps1"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "scripts\gerar-nota-versao-cliente.ps1"; Obrigatorio = $true },
    @{ Grupo = "Tecnico"; Caminho = "scripts\smoke-test-operacional.ps1"; Obrigatorio = $true },
    @{ Grupo = "Backup"; Caminho = "scripts\backup-postgres.ps1"; Obrigatorio = $true },
    @{ Grupo = "Backup"; Caminho = "scripts\restaurar-backup-postgres.ps1"; Obrigatorio = $true },
    @{ Grupo = "Backup"; Caminho = "scripts\gerar-evidencia-restauracao.ps1"; Obrigatorio = $true },
    @{ Grupo = "Seguranca"; Caminho = "docs\POLITICA_SEGREDOS_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Seguranca"; Caminho = "docs\INVENTARIO_SEGREDOS_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Seguranca"; Caminho = "scripts\verificar-segredos.ps1"; Obrigatorio = $true },
    @{ Grupo = "Seguranca"; Caminho = "scripts\auditar-segredos.ps1"; Obrigatorio = $true },
    @{ Grupo = "LGPD"; Caminho = "docs\POLITICA_PRIVACIDADE_LGPD_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "LGPD"; Caminho = "scripts\gerar-solicitacao-lgpd.ps1"; Obrigatorio = $false },
    @{ Grupo = "Dados"; Caminho = "docs\ROTEIRO_CARGA_INICIAL_DADOS_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Dados"; Caminho = "scripts\verificar-carga-inicial.ps1"; Obrigatorio = $true },
    @{ Grupo = "Dados"; Caminho = "templates\carga-inicial\clientes.csv"; Obrigatorio = $true },
    @{ Grupo = "Dados"; Caminho = "templates\carga-inicial\produtos.csv"; Obrigatorio = $true },
    @{ Grupo = "Dados"; Caminho = "templates\carga-inicial\usuarios.csv"; Obrigatorio = $true },
    @{ Grupo = "Dados"; Caminho = "templates\carga-inicial\estoque-inicial.csv"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "docs\PROCESSO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "docs\CHECKLIST_HANDOFF_COMERCIAL_IMPLANTACAO_SUPORTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "docs\ROTEIRO_KICKOFF_CLIENTE_REAL_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "docs\CRONOGRAMA_IMPLANTACAO_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "docs\MODELOS_COMUNICACAO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "docs\PLANO_PILOTO_ASSISTIDO_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "docs\CHECKLIST_CLIENTE_PILOTO_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "scripts\gerar-registro-riscos-pendencias.ps1"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "scripts\gerar-handoff-comercial-implantacao-suporte.ps1"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "scripts\gerar-kickoff-cliente-real.ps1"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "scripts\gerar-cronograma-implantacao-cliente.ps1"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "scripts\gerar-comunicacao-implantacao.ps1"; Obrigatorio = $true },
    @{ Grupo = "Operacao"; Caminho = "scripts\gerar-diario-piloto.ps1"; Obrigatorio = $true },
    @{ Grupo = "Treinamento"; Caminho = "docs\ROTEIRO_TREINAMENTO_POR_PERFIL_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Treinamento"; Caminho = "scripts\gerar-evidencia-treinamento.ps1"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "docs\ROTEIRO_SUPORTE_OPERACIONAL_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "docs\BASE_CONHECIMENTO_SUPORTE_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "docs\POLITICA_SLA_SUPORTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "docs\PLAYBOOK_COMUNICACAO_INCIDENTE_STATUS_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "docs\ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "docs\PROCESSO_FEEDBACK_NPS_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "docs\PROCESSO_PRIORIZACAO_ROADMAP_CLIENTE_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "scripts\gerar-incidente-suporte.ps1"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "scripts\gerar-comunicado-incidente-status.ps1"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "scripts\gerar-artigo-base-conhecimento.ps1"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "scripts\gerar-saude-cliente-pos-implantacao.ps1"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "scripts\gerar-feedback-nps-cliente.ps1"; Obrigatorio = $true },
    @{ Grupo = "Suporte"; Caminho = "scripts\gerar-priorizacao-roadmap.ps1"; Obrigatorio = $true },
    @{ Grupo = "Integracoes"; Caminho = "docs\MATRIZ_HOMOLOGACAO_INTEGRACOES_EXTERNAS_NEXUS_ONE.md"; Obrigatorio = $true },
    @{ Grupo = "Integracoes"; Caminho = "scripts\verificar-integracoes-externas.ps1"; Obrigatorio = $true },
    @{ Grupo = "Integracoes"; Caminho = "docs\EVIDENCIA_HOMOLOGACAO_PAGAMENTOS_ASAAS.md"; Obrigatorio = $false },
    @{ Grupo = "Integracoes"; Caminho = "docs\EVIDENCIA_HOMOLOGACAO_NOTIFICACOES.md"; Obrigatorio = $false },
    @{ Grupo = "Integracoes"; Caminho = "docs\EVIDENCIA_HOMOLOGACAO_FISCAL_REAL.md"; Obrigatorio = $false }
)

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("PACOTE DE ENTREGA DO CLIENTE - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Ambiente: $Ambiente")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("Este relatorio confere a existencia dos artefatos de entrega. Ele nao copia arquivos e nao deve conter senhas, tokens ou certificados.")
$linhas.Add("")
$linhas.Add("NIVEIS DE EVIDENCIA")
$linhas.Add("- Artefato criado: modelo, roteiro, checklist ou relatorio gerado.")
$linhas.Add("- Evidencia executada: prova de procedimento realizado, como smoke test, diario, backup ou treinamento.")
$linhas.Add("- Evidencia aceita: cliente ou responsavel confirmou validacao, como termo de aceite e Go/No-Go.")
$linhas.Add("- Evidencia de escala: cliente real saudavel sustenta ampliacao comercial.")
$linhas.Add("")

$faltantesObrigatorios = 0
$grupos = $itens | Group-Object { $_["Grupo"] }

foreach ($grupo in $grupos) {
    $linhas.Add("============================================================")
    $linhas.Add($grupo.Name.ToUpperInvariant())
    $linhas.Add("============================================================")

    foreach ($item in $grupo.Group) {
        $fullPath = Join-Path $root $item["Caminho"]
        $existe = Test-Path -LiteralPath $fullPath
        $status = if ($existe) { "OK" } elseif ($item["Obrigatorio"]) { "FALTANDO" } else { "OPCIONAL/NAO LOCALIZADO" }

        if (-not $existe -and $item["Obrigatorio"]) {
            $faltantesObrigatorios++
        }

        $marcador = if ($item["Obrigatorio"]) { "obrigatorio" } else { "opcional conforme escopo" }
        $linhas.Add("- [$status] $($item["Caminho"]) ($marcador)")
    }

    $linhas.Add("")
}

$linhas.Add("============================================================")
$linhas.Add("EVIDENCIAS A ANEXAR POR CLIENTE")
$linhas.Add("============================================================")
$linhas.Add("- Proposta/contrato/escopo aprovado.")
$linhas.Add("- Selecao do cliente piloto real, antes de usar cliente como primeiro caso com dados reais.")
$linhas.Add("- Plano do primeiro cliente real, quando a entrega for usada para validar producao controlada ou comercializacao ampla.")
$linhas.Add("- Auditoria de evidencias do cliente real, antes de liberar comercializacao ampla.")
$linhas.Add("- Plano de lancamento comercial controlado, quando houver abertura de novo lote de vendas.")
$linhas.Add("- Resultado do lote comercial, antes de aumentar escala.")
$linhas.Add("- Decisao de expansao comercial pos-lote, antes de mudar volume de vendas.")
$linhas.Add("- Capacidade operacional para escala, antes de assumir novo lote ou mais implantacoes.")
$linhas.Add("- Viabilidade financeira para escala, antes de ampliar lote, desconto ou suporte.")
$linhas.Add("- Qualificacao comercial da oportunidade, quando a entrega vier de venda consultiva.")
$linhas.Add("- Posicionamento competitivo, quando a venda envolver comparacao com alternativa ou concorrente.")
$linhas.Add("- One-page comercial para decisor, quando a proposta depender de dono, diretoria ou aprovador financeiro.")
$linhas.Add("- ROI/valor percebido, quando usado na proposta, renovacao ou defesa de preco.")
$linhas.Add("- Ata de fechamento comercial, antes de implantacao, faturamento, piloto pago ou producao controlada.")
$linhas.Add("- Checklist contratual, quando houver contrato pago, SLA especial, plano personalizado ou integracao externa.")
$linhas.Add("- Faturamento do cliente, quando houver contrato pago, piloto pago ou producao controlada paga.")
$linhas.Add("- Renovacao/retencao, quando houver mudanca de plano, reajuste, pausa ou cancelamento.")
$linhas.Add("- Offboarding, quando houver cancelamento, fim de piloto nao convertido ou encerramento de ambiente com dados reais.")
$linhas.Add("- Relatorio de pre-deploy.")
$linhas.Add("- Manifesto de release.")
$linhas.Add("- Nota de versao para cliente, quando houver mudanca visivel, impacto ou acao necessaria.")
$linhas.Add("- Smoke test operacional.")
$linhas.Add("- Backup e evidencia de restauracao.")
$linhas.Add("- Monitoramento/alerta testado.")
$linhas.Add("- Verificacao de carga inicial, quando houver dados importados.")
$linhas.Add("- Kick-off do cliente real, antes de publicar D1 com dados reais.")
$linhas.Add("- Evidencia de treinamento.")
$linhas.Add("- Evidencias de integracoes externas contratadas.")
$linhas.Add("- Matriz Go/No-Go preenchida.")
$linhas.Add("- Termo de aceite assinado.")
$linhas.Add("- Pendencias nao bloqueantes aceitas e com plano de acao, quando existirem.")
$linhas.Add("")

$linhas.Add("============================================================")
$linhas.Add("DECISAO")
$linhas.Add("============================================================")
if ($faltantesObrigatorios -eq 0) {
    $linhas.Add("Status: PACOTE BASE COMPLETO.")
    $linhas.Add("Proximo passo: anexar evidencias reais do cliente, revisar riscos, preencher Go/No-Go e assinar termo de aceite.")
} else {
    $linhas.Add("Status: PACOTE INCOMPLETO.")
    $linhas.Add("Faltantes obrigatorios: $faltantesObrigatorios.")
    $linhas.Add("Proximo passo: corrigir artefatos ausentes antes de liberar producao controlada.")
}
$linhas.Add("")
$linhas.Add("BLOQUEIOS DE ENTREGA A REVISAR")
$linhas.Add("- Backup sem restauracao testada.")
$linhas.Add("- Smoke test com falha em login, venda, caixa, financeiro ou cadastro base.")
$linhas.Add("- Integracao prometida comercialmente sem homologacao ou restricao documentada.")
$linhas.Add("- Go/No-Go com pendencia bloqueante aberta.")
$linhas.Add("- Termo de aceite ausente ou com pendencia bloqueante aberta.")
$linhas.Add("- Evidencia real prometida sem arquivo, log, relatorio, aceite ou comprovacao equivalente.")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Pacote de entrega gerado: $arquivo"
