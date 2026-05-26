param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [ValidateSet("Planilhas", "PDV simples", "ERP local antigo", "Sistema fiscal isolado", "ERP grande", "Sistema barato", "Outro")]
    [string]$Alternativa = "Planilhas",

    [string]$DorPrincipal = "Controle operacional e reducao de retrabalho",

    [string]$DiferencialPrincipal = "Fluxo integrado de vendas, caixa, estoque, financeiro e suporte documentado",

    [string]$RiscoComparacao = "Nao prometer integracoes ou fiscal real sem homologacao",

    [ValidateSet("Basico", "Medio", "Avancado", "Personalizado")]
    [string]$PlanoSugerido = "Medio",

    [string]$ProximoPasso = "Conduzir demo focada na dor principal e proposta controlada",

    [string]$Responsavel = "Nexus One",

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
$arquivo = Join-Path $resolvedOutput "posicionamento-competitivo-$slug-$timestamp.txt"

switch ($Alternativa) {
    "Planilhas" {
        $posicionamento = "Destacar rastreabilidade, permissoes, historico, relatorios e reducao de retrabalho manual."
        $cuidado = "Nao prometer migracao perfeita sem conferencia de dados."
    }
    "PDV simples" {
        $posicionamento = "Mostrar que o Nexus One conecta recebimento com estoque, vendas, financeiro e gestao."
        $cuidado = "Nao competir apenas por velocidade de balcão; mostrar operacao completa."
    }
    "ERP local antigo" {
        $posicionamento = "Destacar visual mais atual, suporte, release, backup, LGPD e implantacao assistida."
        $cuidado = "Validar dados legados e habitos operacionais antes de prometer transicao."
    }
    "Sistema fiscal isolado" {
        $posicionamento = "Explicar que fiscal deve entrar no fluxo operacional quando homologado."
        $cuidado = "Nao prometer emissao oficial sem certificado, contador, credenciamento e provedor."
    }
    "ERP grande" {
        $posicionamento = "Destacar proximidade, implantacao mais leve, custo inicial menor e foco no essencial."
        $cuidado = "Nao prometer profundidade enterprise ilimitada."
    }
    "Sistema barato" {
        $posicionamento = "Defender valor por processo, suporte, evidencias e reducao de retrabalho."
        $cuidado = "Evitar disputa puramente por preco."
    }
    default {
        $posicionamento = "Comparar escopo, suporte, implantacao, riscos e dependencias antes de falar em preco."
        $cuidado = "Registrar criterios de decisao do cliente."
    }
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("POSICIONAMENTO COMPETITIVO - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CENARIO")
$linhas.Add("============================================================")
$linhas.Add("- Alternativa comparada: $Alternativa")
$linhas.Add("- Dor principal: $DorPrincipal")
$linhas.Add("- Plano sugerido: $PlanoSugerido")
$linhas.Add("- Diferencial principal: $DiferencialPrincipal")
$linhas.Add("- Risco da comparacao: $RiscoComparacao")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("POSICIONAMENTO RECOMENDADO")
$linhas.Add("============================================================")
$linhas.Add($posicionamento)
$linhas.Add("")
$linhas.Add("Cuidado comercial:")
$linhas.Add($cuidado)
$linhas.Add("")
$linhas.Add("Proximo passo:")
$linhas.Add($ProximoPasso)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CHECKLIST")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Concorrente/alternativa foi citado pelo cliente.")
$linhas.Add("- [ ] Dor principal foi confirmada.")
$linhas.Add("- [ ] Diferencial foi conectado a um fluxo demonstravel.")
$linhas.Add("- [ ] Dependencias externas foram comunicadas.")
$linhas.Add("- [ ] Limites de plano e adicionais foram registrados.")
$linhas.Add("- [ ] Proxima acao ficou clara: demo, diagnostico, proposta, piloto ou pausa.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\MATRIZ_POSICIONAMENTO_COMPETITIVO_NEXUS_ONE.md")
$linhas.Add("- docs\PLAYBOOK_COMERCIAL_QUALIFICACAO_NEXUS_ONE.md")
$linhas.Add("- docs\ROTEIRO_DEMONSTRACAO_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Posicionamento competitivo gerado: $arquivo"
