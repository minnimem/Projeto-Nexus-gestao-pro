param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [ValidateSet("Renovar", "Reajustar", "Upgrade", "Downgrade", "Pausar", "Retencao", "Cancelar")]
    [string]$Decisao = "Renovar",

    [ValidateSet("Basico", "Medio", "Avancado", "Personalizado")]
    [string]$PlanoAtual = "Medio",

    [ValidateSet("Basico", "Medio", "Avancado", "Personalizado")]
    [string]$NovoPlano = "Medio",

    [ValidateRange(0, 999999)]
    [decimal]$ValorAtual = 349,

    [ValidateRange(0, 999999)]
    [decimal]$NovoValor = 349,

    [ValidateSet("Verde", "Amarelo", "Vermelho")]
    [string]$SaudeCliente = "Verde",

    [ValidateSet("Em dia", "Atraso pontual", "Inadimplencia recorrente")]
    [string]$StatusFinanceiro = "Em dia",

    [ValidateSet("Alto", "Parcial", "Baixo")]
    [string]$UsoSistema = "Alto",

    [string]$Motivo = "Uso dentro do esperado e continuidade aprovada",

    [string]$PrazoRevisao = "30 dias",

    [string]$Responsavel = "Nexus One",

    [string]$OutputDir = "reports\sucesso-cliente"
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
$arquivo = Join-Path $resolvedOutput "renovacao-retencao-$slug-$timestamp.txt"
$culture = [System.Globalization.CultureInfo]::GetCultureInfo("pt-BR")
$valorAtualFormatado = $ValorAtual.ToString("C", $culture)
$novoValorFormatado = $NovoValor.ToString("C", $culture)

switch ($Decisao) {
    "Renovar" {
        $acao = "Renovar contrato/plano mantendo acompanhamento normal."
        $evidenciaCritica = "Aceite de continuidade e status financeiro em dia."
    }
    "Reajustar" {
        $acao = "Comunicar reajuste antes da cobranca reajustada e arquivar aceite/condicao contratual."
        $evidenciaCritica = "Base de reajuste, data de vigencia e comunicacao ao cliente."
    }
    "Upgrade" {
        $acao = "Gerar novo escopo/plano, atualizar faturamento e comunicar novos limites."
        $evidenciaCritica = "Nova proposta, novo faturamento e data de vigencia."
    }
    "Downgrade" {
        $acao = "Reduzir plano sem manter recursos do plano superior fora do escopo."
        $evidenciaCritica = "Recursos removidos, novo valor e aceite do decisor."
    }
    "Pausar" {
        $acao = "Formalizar pausa, data de retorno/revisao e impacto em suporte/acesso."
        $evidenciaCritica = "Termo ou comunicacao de pausa com data de revisao."
    }
    "Cancelar" {
        $acao = "Registrar motivo, exportacao de dados quando aplicavel, encerramento de acessos e baixa financeira."
        $evidenciaCritica = "Motivo do cancelamento, pendencias finais e confirmacao de encerramento."
    }
    default {
        $acao = "Executar plano de retencao com responsaveis, prazo e criterio de sucesso."
        $evidenciaCritica = "Causa do risco, plano de acao e nova revisao marcada."
    }
}

if ($SaudeCliente -eq "Verde" -and $StatusFinanceiro -eq "Em dia" -and $UsoSistema -eq "Alto") {
    $riscoReceita = "Baixo"
} elseif ($SaudeCliente -eq "Vermelho" -or $StatusFinanceiro -eq "Inadimplencia recorrente" -or $UsoSistema -eq "Baixo") {
    $riscoReceita = "Alto"
} else {
    $riscoReceita = "Medio"
}

$evidenciaDecisao = switch ($Decisao) {
    "Renovar" { "Aceite de continuidade ou contrato vigente." }
    "Reajustar" { "Comunicacao previa, regra contratual e aceite/registro." }
    "Upgrade" { "Nova proposta/escopo, novo faturamento e aceite." }
    "Downgrade" { "Novo escopo, recursos removidos e aceite." }
    "Pausar" { "Termo/comunicacao de pausa, data de revisao e regra de acesso." }
    "Cancelar" { "Offboarding, exportacao/retencao de dados e encerramento de acessos." }
    default { "Plano de acao, responsaveis, prazo e criterio de sucesso." }
}

$alertas = New-Object System.Collections.Generic.List[string]
if ($SaudeCliente -eq "Vermelho" -and $Decisao -in @("Renovar", "Reajustar", "Upgrade")) {
    $alertas.Add("Cliente vermelho: estabilizar pendencias antes de renovar, reajustar ou vender upgrade.")
}
if ($Decisao -eq "Downgrade" -and $NovoValor -gt $ValorAtual) {
    $alertas.Add("Downgrade com novo valor maior que o atual: revisar decisao ou valores.")
}
if ($Decisao -eq "Upgrade" -and $NovoValor -le $ValorAtual) {
    $alertas.Add("Upgrade sem aumento de valor: confirmar desconto ou condicao especial aprovada.")
}
if ($Decisao -eq "Cancelar" -and $SaudeCliente -eq "Verde") {
    $alertas.Add("Cancelamento de cliente verde: revisar motivo para aprender sobre preco, concorrencia ou mudanca operacional.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("RENOVACAO, RETENCAO E MUDANCA DE PLANO - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("DECISAO")
$linhas.Add("============================================================")
$linhas.Add("- Decisao: $Decisao")
$linhas.Add("- Saude do cliente: $SaudeCliente")
$linhas.Add("- Status financeiro: $StatusFinanceiro")
$linhas.Add("- Uso do sistema: $UsoSistema")
$linhas.Add("- Risco de receita: $riscoReceita")
$linhas.Add("- Plano atual: $PlanoAtual")
$linhas.Add("- Novo plano: $NovoPlano")
$linhas.Add("- Valor atual: $valorAtualFormatado")
$linhas.Add("- Novo valor: $novoValorFormatado")
$linhas.Add("- Motivo: $Motivo")
$linhas.Add("- Prazo de revisao: $PrazoRevisao")
$linhas.Add("- Acao recomendada: $acao")
$linhas.Add("- Evidencia critica: $evidenciaCritica")
$linhas.Add("- Evidencia minima da decisao: $evidenciaDecisao")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("MATRIZ DE DECISAO")
$linhas.Add("============================================================")
$linhas.Add("- Verde + em dia + uso alto: renovar, avaliar upgrade ou referencia.")
$linhas.Add("- Amarelo + uso parcial: retencao leve, treinamento ou ajuste de escopo.")
$linhas.Add("- Vermelho ou inadimplencia recorrente ou baixo uso: retencao critica ou cancelamento/offboarding.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CHECKLIST")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Saude do cliente revisada.")
$linhas.Add("- [ ] Faturamento e vencimento revisados.")
$linhas.Add("- [ ] Uso real dos modulos conferido.")
$linhas.Add("- [ ] Pendencias e incidentes revisados.")
$linhas.Add("- [ ] Escopo atual comparado com nova decisao.")
$linhas.Add("- [ ] Decisor do cliente envolvido.")
$linhas.Add("- [ ] Comunicacao enviada e arquivada.")
$linhas.Add("- [ ] Aceite ou registro formal anexado.")
$linhas.Add("- [ ] Faturamento e limites do plano atualizados quando houver mudanca.")
$linhas.Add("- [ ] Offboarding gerado quando a decisao for cancelamento.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PLANO DE RETENCAO / TRANSICAO")
$linhas.Add("============================================================")
$linhas.Add("- Causa principal:")
$linhas.Add("- Acao proposta:")
$linhas.Add("- Responsavel Nexus One: $Responsavel")
$linhas.Add("- Responsavel do cliente:")
$linhas.Add("- Prazo de revisao: $PrazoRevisao")
$linhas.Add("- Criterio de sucesso:")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("ALERTAS")
$linhas.Add("============================================================")
if ($alertas.Count -eq 0) {
    $linhas.Add("- Nenhum alerta automatico.")
} else {
    foreach ($alerta in $alertas) {
        $linhas.Add("- $alerta")
    }
}
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\PROCESSO_RENOVACAO_RETENCAO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_FATURAMENTO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Renovacao/retencao do cliente gerada: $arquivo"
