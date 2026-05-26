param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [ValidateRange(0, 10)]
    [int]$NotaNps = 8,

    [string]$Momento = "D30 pos-implantacao",

    [string]$PrincipalGanho = "Ganho ainda nao informado.",

    [string]$MaiorDificuldade = "Dificuldade ainda nao informada.",

    [string]$ModuloMaisValor = "Nao informado",

    [string]$ModuloMaisAtencao = "Nao informado",

    [ValidateSet("Baixo", "Medio", "Alto")]
    [string]$RiscoCancelamento = "Baixo",

    [ValidateSet("Nenhuma", "Upgrade", "Modulo adicional", "Referencia comercial", "Treinamento extra", "Retencao")]
    [string]$Oportunidade = "Nenhuma",

    [ValidateSet("Produto", "Suporte", "Implantacao", "Comercial", "Treinamento", "Financeiro")]
    [string]$AreaResponsavel = "Suporte",

    [string]$ProximaAcao = "Registrar retorno e acompanhar na proxima revisao.",

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
$arquivo = Join-Path $resolvedOutput "feedback-nps-$slug-$timestamp.txt"

if ($NotaNps -le 6) {
    $classificacao = "Detrator"
    $decisao = "Abrir plano de acao e revisar causa do risco antes de pedir referencia ou upgrade."
    $prazoRetorno = if ($RiscoCancelamento -eq "Alto") { "Ate 24h uteis" } else { "Ate 3 dias uteis" }
} elseif ($NotaNps -le 8) {
    $classificacao = "Neutro"
    $decisao = "Melhorar adocao, treinamento e valor percebido antes de expandir."
    $prazoRetorno = if ($RiscoCancelamento -eq "Alto") { "Ate 48h uteis" } else { "Ate 7 dias" }
} else {
    $classificacao = "Promotor"
    $decisao = "Avaliar referencia comercial, caso de sucesso ou expansao, se houver autorizacao."
    $prazoRetorno = if ($RiscoCancelamento -eq "Baixo") { "Ate 7 dias" } else { "Ate 3 dias uteis, resolver risco antes de pedir referencia" }
}

$alertas = New-Object System.Collections.Generic.List[string]
if ($RiscoCancelamento -eq "Alto") {
    $alertas.Add("Risco alto de cancelamento: abrir retencao e plano de acao.")
}
if ($classificacao -eq "Detrator" -and $Oportunidade -in @("Upgrade", "Referencia comercial")) {
    $alertas.Add("Cliente detrator nao deve receber pedido de referencia/upgrade antes de estabilizar.")
}
if ($Oportunidade -eq "Referencia comercial") {
    $alertas.Add("Referencia comercial exige autorizacao formal do cliente.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("FEEDBACK E NPS DO CLIENTE - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Momento: $Momento")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("RESULTADO")
$linhas.Add("============================================================")
$linhas.Add("- Nota NPS: $NotaNps / 10")
$linhas.Add("- Classificacao: $classificacao")
$linhas.Add("- Risco de cancelamento: $RiscoCancelamento")
$linhas.Add("- Oportunidade: $Oportunidade")
$linhas.Add("- Area responsavel: $AreaResponsavel")
$linhas.Add("- Decisao recomendada: $decisao")
$linhas.Add("- Prazo de retorno sugerido: $prazoRetorno")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("FEEDBACK")
$linhas.Add("============================================================")
$linhas.Add("- Principal ganho: $PrincipalGanho")
$linhas.Add("- Maior dificuldade: $MaiorDificuldade")
$linhas.Add("- Modulo com mais valor: $ModuloMaisValor")
$linhas.Add("- Modulo que precisa de atencao: $ModuloMaisAtencao")
$linhas.Add("- Proxima acao: $ProximaAcao")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("MATRIZ DE ACAO")
$linhas.Add("============================================================")
$linhas.Add("- Classificacao NPS: $classificacao")
$linhas.Add("- Risco de cancelamento: $RiscoCancelamento")
$linhas.Add("- Acao obrigatoria: $decisao")
$linhas.Add("- Prazo de retorno: $prazoRetorno")
$linhas.Add("")
$linhas.Add("SAIDAS POSSIVEIS")
$linhas.Add("- [ ] Plano de acao de suporte/implantacao")
$linhas.Add("- [ ] Atualizacao da saude do cliente")
$linhas.Add("- [ ] Artigo de base de conhecimento ou reforco de treinamento")
$linhas.Add("- [ ] Priorizacao de roadmap")
$linhas.Add("- [ ] Registro de retencao/renovacao")
$linhas.Add("- [ ] Autorizacao de referencia comercial")
$linhas.Add("- [ ] Oportunidade de upgrade/modulo adicional")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CHECKLIST")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Separar bug, duvida, melhoria, risco e oportunidade comercial.")
$linhas.Add("- [ ] Abrir risco/pendencia quando houver bloqueio.")
$linhas.Add("- [ ] Gerar artigo de base de conhecimento quando for duvida recorrente.")
$linhas.Add("- [ ] Atualizar saude do cliente quando houver risco.")
$linhas.Add("- [ ] Pedir autorizacao antes de usar referencia comercial.")
$linhas.Add("- [ ] Definir responsavel e data de retorno para feedback negativo.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("FOLLOW-UP OBRIGATORIO")
$linhas.Add("============================================================")
$linhas.Add("- Responsavel pelo retorno: $Responsavel")
$linhas.Add("- Data prometida:")
$linhas.Add("- Canal do retorno:")
$linhas.Add("- Acao combinada: $ProximaAcao")
$linhas.Add("- Evidencia esperada:")
$linhas.Add("- Nova coleta agendada: sim / nao")
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
$linhas.Add("- docs\PROCESSO_FEEDBACK_NPS_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md")
$linhas.Add("- docs\BASE_CONHECIMENTO_SUPORTE_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\AUTORIZACAO_REFERENCIA_COMERCIAL_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Feedback/NPS do cliente gerado: $arquivo"
