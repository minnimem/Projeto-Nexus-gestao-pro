param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Responsavel = "Nexus One",

    [ValidateRange(0, 15)]
    [int]$DorClara = 0,

    [ValidateRange(0, 15)]
    [int]$Decisor = 0,

    [ValidateRange(0, 15)]
    [int]$EscopoSimples = 0,

    [ValidateRange(0, 15)]
    [int]$DadosResponsaveis = 0,

    [ValidateRange(0, 15)]
    [int]$IntegracoesNaoBloqueantes = 0,

    [ValidateRange(0, 10)]
    [int]$AceitaPiloto = 0,

    [ValidateRange(0, 10)]
    [int]$BaixaComplexidade = 0,

    [ValidateRange(0, 5)]
    [int]$PotencialReferencia = 0,

    [string]$Riscos = "Sem riscos adicionais registrados.",

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

$slug = ($Cliente -replace '[^a-zA-Z0-9_-]+', '-').Trim('-').ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($slug)) {
    $slug = "cliente"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$arquivo = Join-Path $resolvedOutput "selecao-cliente-piloto-real-$slug-$timestamp.txt"

$score = $DorClara + $Decisor + $EscopoSimples + $DadosResponsaveis + $IntegracoesNaoBloqueantes + $AceitaPiloto + $BaixaComplexidade + $PotencialReferencia

$alertas = New-Object System.Collections.Generic.List[string]
if ($Decisor -lt 10) {
    $alertas.Add("Decisor fraco ou ausente. Nao recomendado para primeiro cliente real.")
}
if ($AceitaPiloto -lt 7) {
    $alertas.Add("Cliente nao demonstrou aceite claro para piloto/producao controlada.")
}
if ($IntegracoesNaoBloqueantes -lt 8) {
    $alertas.Add("Integracoes podem bloquear o primeiro ciclo real.")
}
if ($EscopoSimples -lt 8) {
    $alertas.Add("Escopo inicial parece complexo demais para primeiro cliente real.")
}

if ($score -ge 85 -and $alertas.Count -eq 0) {
    $decisao = "CLIENTE IDEAL PARA PRIMEIRO CASO REAL"
    $proximaAcao = "Gerar pacote comercial completo e plano do primeiro cliente real."
} elseif ($score -ge 70) {
    $decisao = "PODE SEGUIR COM RISCOS CONTROLADOS"
    $proximaAcao = "Reduzir riscos, registrar limites e gerar diagnostico antes de fechar."
} elseif ($score -ge 50) {
    $decisao = "DIAGNOSTICAR E REDUZIR ESCOPO ANTES"
    $proximaAcao = "Nao usar ainda como primeiro caso real sem simplificar escopo."
} else {
    $decisao = "NAO USAR COMO PRIMEIRO CLIENTE REAL"
    $proximaAcao = "Selecionar outro cliente ou manter apenas demo/proposta futura."
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("SELECAO DO CLIENTE PILOTO REAL - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PONTUACAO")
$linhas.Add("============================================================")
$linhas.Add("- Dor operacional clara: $DorClara/15")
$linhas.Add("- Decisor presente: $Decisor/15")
$linhas.Add("- Escopo inicial simples: $EscopoSimples/15")
$linhas.Add("- Dados e responsaveis disponiveis: $DadosResponsaveis/15")
$linhas.Add("- Integracoes nao bloqueantes: $IntegracoesNaoBloqueantes/15")
$linhas.Add("- Aceita piloto/aceite formal: $AceitaPiloto/10")
$linhas.Add("- Baixa complexidade fiscal/logistica: $BaixaComplexidade/10")
$linhas.Add("- Potencial de referencia: $PotencialReferencia/5")
$linhas.Add("- Score total: $score/100")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("DECISAO")
$linhas.Add("============================================================")
$linhas.Add("- Decisao: $decisao")
$linhas.Add("- Proxima acao: $proximaAcao")
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
$linhas.Add("RISCOS")
$linhas.Add("============================================================")
$linhas.Add($Riscos)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CHECKLIST")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Decisor confirmou participacao no processo.")
$linhas.Add("- [ ] Cliente aceita piloto assistido/producao controlada.")
$linhas.Add("- [ ] Escopo inicial foi reduzido ao essencial.")
$linhas.Add("- [ ] Integracoes reais estao homologadas, sandbox ou fora do escopo.")
$linhas.Add("- [ ] Responsaveis por dados, treinamento, fiscal e aceite foram definidos.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\MATRIZ_SELECAO_CLIENTE_PILOTO_REAL_NEXUS_ONE.md")
$linhas.Add("- docs\PLAYBOOK_COMERCIAL_QUALIFICACAO_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_EXECUCAO_PRIMEIRO_CLIENTE_REAL_NEXUS_ONE.md")
$linhas.Add("- docs\CHECKLIST_CLIENTE_PILOTO_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Selecao de cliente piloto real gerada: $arquivo"
