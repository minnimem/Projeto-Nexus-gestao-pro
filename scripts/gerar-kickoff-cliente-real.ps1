param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Responsavel = "Nexus One",

    [string]$DataD1 = "",

    [switch]$DecisorConfirmado,

    [switch]$ResponsavelOperacionalConfirmado,

    [switch]$DadosMinimosConfirmados,

    [switch]$AcessosConfirmados,

    [switch]$AmbienteConfirmado,

    [switch]$SuporteConfirmado,

    [switch]$TreinamentoAgendado,

    [string]$Riscos = "Sem riscos adicionais registrados.",

    [string]$OutputDir = "reports\implantacao"
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
$arquivo = Join-Path $resolvedOutput "kickoff-cliente-real-$slug-$timestamp.txt"

$checks = @(
    @{ Nome = "Decisor confirmado"; Ok = [bool]$DecisorConfirmado; Critico = $true },
    @{ Nome = "Responsavel operacional confirmado"; Ok = [bool]$ResponsavelOperacionalConfirmado; Critico = $true },
    @{ Nome = "Dados minimos confirmados"; Ok = [bool]$DadosMinimosConfirmados; Critico = $true },
    @{ Nome = "Acessos confirmados"; Ok = [bool]$AcessosConfirmados; Critico = $true },
    @{ Nome = "Ambiente confirmado"; Ok = [bool]$AmbienteConfirmado; Critico = $true },
    @{ Nome = "Suporte e SLA confirmados"; Ok = [bool]$SuporteConfirmado; Critico = $true },
    @{ Nome = "Treinamento agendado"; Ok = [bool]$TreinamentoAgendado; Critico = $false }
)

$bloqueiosCriticos = @($checks | Where-Object { $_["Critico"] -and -not $_["Ok"] })
$pendenciasNaoCriticas = @($checks | Where-Object { -not $_["Critico"] -and -not $_["Ok"] })

if ($bloqueiosCriticos.Count -eq 0 -and $pendenciasNaoCriticas.Count -eq 0) {
    $decisao = "APTO PARA PUBLICAR D1"
    $proximoPasso = "Publicar cronograma final, executar preparacao D-5 a D-1 e iniciar operacao assistida na data prevista."
} elseif ($bloqueiosCriticos.Count -eq 0) {
    $decisao = "PREPARAR ANTES DO D1"
    $proximoPasso = "Agendar treinamento e confirmar evidencia antes do inicio da operacao assistida."
} else {
    $decisao = "NAO PUBLICAR D1"
    $proximoPasso = "Resolver bloqueios criticos, atualizar cronograma e repetir validacao de kick-off."
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("KICK-OFF DO CLIENTE REAL - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Responsavel Nexus One: $Responsavel")
$linhas.Add("Data prevista D1: $(if ([string]::IsNullOrWhiteSpace($DataD1)) { 'Nao informada' } else { $DataD1 })")
$linhas.Add("")
$linhas.Add("OBJETIVO")
$linhas.Add("- Confirmar decisor, responsavel operacional, dados, acessos, ambiente, suporte, treinamento e agenda D1-D10.")
$linhas.Add("- Evitar inicio de operacao assistida com pendencia critica aberta.")
$linhas.Add("")
$linhas.Add("CHECKLIST")
foreach ($check in $checks) {
    $status = if ($check["Ok"]) { "OK" } else { "PENDENTE" }
    $tipo = if ($check["Critico"]) { "critico" } else { "operacional" }
    $linhas.Add("- [$status] $($check["Nome"]) ($tipo)")
}
$linhas.Add("")
$linhas.Add("AGENDA MINIMA DA REUNIAO")
$linhas.Add("- Contexto, problema principal e resultado esperado.")
$linhas.Add("- Escopo contratado, modulos, usuarios, filiais, limites e exclusoes.")
$linhas.Add("- Dados, acessos, privacidade e responsavel por conferencia.")
$linhas.Add("- Ambiente, backup, restauracao, monitoramento, smoke test e integracoes.")
$linhas.Add("- Treinamento, canal de suporte, SLA e rotina D1-D10.")
$linhas.Add("- Riscos, pendencias, responsaveis, prazos e decisao de entrada.")
$linhas.Add("")
$linhas.Add("RISCOS INFORMADOS")
$linhas.Add($Riscos)
$linhas.Add("")
$linhas.Add("BLOQUEIOS CRITICOS")
if ($bloqueiosCriticos.Count -eq 0) {
    $linhas.Add("- Nenhum bloqueio critico informado.")
} else {
    foreach ($bloqueio in $bloqueiosCriticos) {
        $linhas.Add("- $($bloqueio["Nome"])")
    }
}
$linhas.Add("")
$linhas.Add("PENDENCIAS OPERACIONAIS")
if ($pendenciasNaoCriticas.Count -eq 0) {
    $linhas.Add("- Nenhuma pendencia operacional informada.")
} else {
    foreach ($pendencia in $pendenciasNaoCriticas) {
        $linhas.Add("- $($pendencia["Nome"])")
    }
}
$linhas.Add("")
$linhas.Add("DECISAO")
$linhas.Add($decisao)
$linhas.Add("")
$linhas.Add("PROXIMO PASSO")
$linhas.Add($proximoPasso)
$linhas.Add("")
$linhas.Add("REFERENCIAS")
$linhas.Add("- docs\ROTEIRO_KICKOFF_CLIENTE_REAL_NEXUS_ONE.md")
$linhas.Add("- docs\CRONOGRAMA_IMPLANTACAO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\CHECKLIST_HANDOFF_COMERCIAL_IMPLANTACAO_SUPORTE_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_EXECUCAO_PRIMEIRO_CLIENTE_REAL_NEXUS_ONE.md")
$linhas.Add("- docs\PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Kick-off do cliente real gerado: $arquivo"
