param(
    [string]$Lote = "Lote 1",

    [ValidateSet("Aumentar escala", "Manter escala", "Pausar vendas", "Corrigir processo", "Reposicionar oferta")]
    [string]$Decisao = "Manter escala",

    [ValidateRange(1, 100)]
    [int]$LimiteProximoLote = 5,

    [ValidateRange(1, 10)]
    [int]$MaxImplantacoesSimultaneas = 2,

    [ValidateRange(0, 100)]
    [int]$PontuacaoLote = 70,

    [ValidateSet("Sim", "Nao")]
    [string]$CapacidadeOperacionalConfirmada = "Nao",

    [ValidateSet("Sim", "Nao")]
    [string]$PacoteEntregaCompleto = "Nao",

    [ValidateSet("Sim", "Nao")]
    [string]$AceitesRegistrados = "Nao",

    [string]$Justificativa = "Decisao baseada no resultado do lote comercial e na capacidade de implantacao/suporte.",

    [string]$Riscos = "Revisar incidentes, clientes Amarelo/Vermelho, pendencias bloqueantes, suporte e promessas comerciais antes de ampliar.",

    [string]$Responsavel = "Nexus One",

    [string]$Autorizador = "Direcao",

    [string]$PrazoRevisao = "",

    [string]$OutputDir = "reports\comercial"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$resolvedOutput = if ([System.IO.Path]::IsPathRooted($OutputDir)) {
    $OutputDir
} else {
    Join-Path $root $OutputDir
}

New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$slug = ($Lote -replace '[^a-zA-Z0-9_-]+', '-').Trim('-').ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($slug)) {
    $slug = "lote"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$arquivo = Join-Path $resolvedOutput "decisao-expansao-comercial-$slug-$timestamp.txt"

$prazo = if ([string]::IsNullOrWhiteSpace($PrazoRevisao)) {
    (Get-Date).AddDays(14).ToString("dd/MM/yyyy")
} else {
    ([datetime]::Parse($PrazoRevisao)).ToString("dd/MM/yyyy")
}

$alertas = New-Object System.Collections.Generic.List[string]
if ($Decisao -eq "Aumentar escala" -and $PontuacaoLote -lt 85) {
    $alertas.Add("Pontuacao do lote abaixo de 85. Aumentar escala exige aprovacao executiva explicita e plano de contorno.")
}
if ($Decisao -eq "Aumentar escala" -and $CapacidadeOperacionalConfirmada -ne "Sim") {
    $alertas.Add("Capacidade operacional nao confirmada. Nao aumentar escala sem matriz aprovada.")
}
if ($Decisao -eq "Aumentar escala" -and $PacoteEntregaCompleto -ne "Sim") {
    $alertas.Add("Pacote de entrega incompleto. Corrigir antes de abrir novo lote maior.")
}
if ($Decisao -eq "Aumentar escala" -and $AceitesRegistrados -ne "Sim") {
    $alertas.Add("Aceites nao registrados. Formalizar entrega antes de aumentar escala.")
}
if ($Decisao -eq "Aumentar escala" -and $LimiteProximoLote -gt 10) {
    $alertas.Add("Limite do proximo lote alto. Confirmar capacidade comercial, implantacao e suporte.")
}
if ($Decisao -eq "Aumentar escala" -and $MaxImplantacoesSimultaneas -gt 2) {
    $alertas.Add("Mais de 2 implantacoes simultaneas exige capacidade operacional comprovada.")
}
if ($Decisao -in @("Pausar vendas", "Corrigir processo", "Reposicionar oferta") -and $LimiteProximoLote -gt 1) {
    $alertas.Add("Decisao restritiva com limite de lote acima de 1. Revisar coerencia.")
}

$nivelLiberacao = if ($alertas.Count -eq 0 -and $Decisao -eq "Aumentar escala") {
    "LIBERADO COM CONTROLE"
} elseif ($Decisao -eq "Manter escala" -or ($Decisao -eq "Aumentar escala" -and $alertas.Count -gt 0)) {
    "LIBERACAO CONDICIONADA"
} else {
    "NAO LIBERADO PARA EXPANSAO"
}

$acao = switch ($Decisao) {
    "Aumentar escala" { "Abrir proximo lote com limites definidos e revisao obrigatoria." }
    "Manter escala" { "Continuar no mesmo volume ate nova revisao." }
    "Pausar vendas" { "Suspender novas vendas ate resolver bloqueios." }
    "Corrigir processo" { "Corrigir implantacao, suporte, pacote ou promessa comercial antes de vender mais." }
    "Reposicionar oferta" { "Revisar perfil ideal, canais, mensagem, demo, proposta e preco." }
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("DECISAO DE EXPANSAO COMERCIAL POS-LOTE - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Lote avaliado: $Lote")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("Autorizador: $Autorizador")
$linhas.Add("Prazo de revisao: $prazo")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("DECISAO")
$linhas.Add("============================================================")
$linhas.Add("- Decisao: $Decisao")
$linhas.Add("- Nivel de liberacao: $nivelLiberacao")
$linhas.Add("- Acao: $acao")
$linhas.Add("- Pontuacao do lote: $PontuacaoLote/100")
$linhas.Add("- Limite do proximo lote: $LimiteProximoLote oportunidade(s)")
$linhas.Add("- Maximo de implantacoes simultaneas: $MaxImplantacoesSimultaneas")
$linhas.Add("- Capacidade operacional confirmada: $CapacidadeOperacionalConfirmada")
$linhas.Add("- Pacote de entrega completo: $PacoteEntregaCompleto")
$linhas.Add("- Aceites registrados: $AceitesRegistrados")
$linhas.Add("")
$linhas.Add("Leitura da pontuacao:")
if ($PontuacaoLote -ge 85) {
    $linhas.Add("- Pontuacao compativel com aumento gradual de escala.")
} elseif ($PontuacaoLote -ge 70) {
    $linhas.Add("- Pontuacao compativel com manutencao de escala e melhorias.")
} elseif ($PontuacaoLote -ge 50) {
    $linhas.Add("- Pontuacao exige correcao de processo antes do proximo lote.")
} else {
    $linhas.Add("- Pontuacao exige pausa, reposicionamento ou reducao da oferta.")
}
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("JUSTIFICATIVA")
$linhas.Add("============================================================")
$linhas.Add($Justificativa)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("RISCOS E CONDICOES")
$linhas.Add("============================================================")
$linhas.Add($Riscos)
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
$linhas.Add("CHECKLIST")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Resultado do lote comercial foi revisado.")
$linhas.Add("- [ ] Pontuacao do lote foi conferida.")
$linhas.Add("- [ ] Suporte confirmou capacidade para o proximo ciclo.")
$linhas.Add("- [ ] Implantacao confirmou capacidade para o proximo ciclo.")
$linhas.Add("- [ ] Promessas comerciais foram revisadas.")
$linhas.Add("- [ ] Pacote de entrega sera mantido por cliente.")
$linhas.Add("- [ ] Aceites dos clientes fechados foram arquivados.")
$linhas.Add("- [ ] Limite do proximo lote foi comunicado ao comercial.")
$linhas.Add("- [ ] Revisao na data definida foi agendada.")
$linhas.Add("- [ ] Autorizador validou a decisao.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\DECISAO_EXPANSAO_COMERCIAL_POS_LOTE_NEXUS_ONE.md")
$linhas.Add("- docs\RELATORIO_RESULTADO_LOTE_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_LANCAMENTO_COMERCIAL_CONTROLADO_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_LIBERACAO_COMERCIAL_AMPLA_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Decisao de expansao comercial gerada: $arquivo"
