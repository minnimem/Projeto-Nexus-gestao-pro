param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Responsavel = "Nexus One",

    [switch]$PropostaOk,
    [switch]$PlanoPrimeiroClienteOk,
    [switch]$DeployOk,
    [switch]$BancoOk,
    [switch]$BackupOk,
    [switch]$MonitoramentoOk,
    [switch]$SegredosOk,
    [switch]$DadosLgpdOk,
    [switch]$OperacaoAssistidaOk,
    [switch]$IntegracoesOk,
    [switch]$GoNoGoOk,
    [switch]$AceiteOk,

    [ValidateSet("Verde", "Amarelo", "Vermelho", "Nao avaliado")]
    [string]$SaudeCliente = "Nao avaliado",

    [string]$Observacoes = "Sem observacoes adicionais.",

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
$arquivo = Join-Path $resolvedOutput "auditoria-evidencias-cliente-real-$slug-$timestamp.txt"

$itens = @(
    @{ Nome = "Proposta, contrato, ata e faturamento"; Ok = [bool]$PropostaOk; Bloqueante = $true },
    @{ Nome = "Plano do primeiro cliente real executado"; Ok = [bool]$PlanoPrimeiroClienteOk; Bloqueante = $true },
    @{ Nome = "Deploy definitivo validado"; Ok = [bool]$DeployOk; Bloqueante = $true },
    @{ Nome = "Banco real provisionado"; Ok = [bool]$BancoOk; Bloqueante = $true },
    @{ Nome = "Backup agendado e restauracao testada"; Ok = [bool]$BackupOk; Bloqueante = $true },
    @{ Nome = "Monitoramento externo testado"; Ok = [bool]$MonitoramentoOk; Bloqueante = $true },
    @{ Nome = "Segredos auditados e rotacao registrada"; Ok = [bool]$SegredosOk; Bloqueante = $true },
    @{ Nome = "Dados iniciais e LGPD validados"; Ok = [bool]$DadosLgpdOk; Bloqueante = $true },
    @{ Nome = "Operacao assistida, treinamento e suporte evidenciados"; Ok = [bool]$OperacaoAssistidaOk; Bloqueante = $true },
    @{ Nome = "Integracoes reais homologadas, sandbox ou fora do escopo"; Ok = [bool]$IntegracoesOk; Bloqueante = $true },
    @{ Nome = "Go/No-Go sem pendencia bloqueante"; Ok = [bool]$GoNoGoOk; Bloqueante = $true },
    @{ Nome = "Termo de aceite assinado"; Ok = [bool]$AceiteOk; Bloqueante = $true }
)

$total = $itens.Count
$okCount = ($itens | Where-Object { $_.Ok }).Count
$percentual = [math]::Round(($okCount / $total) * 100, 0)
$bloqueios = $itens | Where-Object { -not $_.Ok -and $_.Bloqueante }
$bloqueioSaude = $SaudeCliente -ne "Verde"

if ($bloqueios.Count -gt 0 -or $bloqueioSaude) {
    $decisao = "NO-GO PARA PRODUCAO AMPLA"
    $proximaAcao = "Manter venda controlada, corrigir bloqueios e repetir auditoria."
} elseif ($percentual -ge 90) {
    $decisao = "APTO A AVALIAR COMERCIALIZACAO AMPLA"
    $proximaAcao = "Gerar decisao de liberacao comercial e revisar restricoes finais."
} elseif ($percentual -ge 75) {
    $decisao = "MANTER PRODUCAO CONTROLADA COM RESTRICOES"
    $proximaAcao = "Completar evidencias faltantes antes de ampliar vendas."
} else {
    $decisao = "NAO USAR COMO EVIDENCIA DE ESCALA"
    $proximaAcao = "Executar novo ciclo assistido com evidencias completas."
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("AUDITORIA DE EVIDENCIAS DO CLIENTE REAL - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("Saude do cliente: $SaudeCliente")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("NIVEIS DE EVIDENCIA AUDITADA")
$linhas.Add("============================================================")
$linhas.Add("- Ausente: nao ha arquivo, registro, assinatura, log ou relatorio.")
$linhas.Add("- Artefato criado: documento existe, mas ainda nao prova execucao real.")
$linhas.Add("- Executada: procedimento realizado com registro verificavel.")
$linhas.Add("- Aceita: cliente/responsavel confirmou validacao formal.")
$linhas.Add("- Recorrente: evidencia repetida em rotina, release ou ciclo mensal.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("RESULTADO")
$linhas.Add("============================================================")
$linhas.Add("- Evidencias concluidas: $okCount de $total")
$linhas.Add("- Percentual de evidencias: $percentual%")
$linhas.Add("- Decisao: $decisao")
$linhas.Add("- Proxima acao: $proximaAcao")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CHECKLIST AUDITADO")
$linhas.Add("============================================================")
foreach ($item in $itens) {
    $status = if ($item.Ok) { "OK" } else { "PENDENTE" }
    $tipo = if ($item.Bloqueante) { "bloqueante" } else { "nao bloqueante" }
    $linhas.Add("- [$status] $($item.Nome) ($tipo)")
}
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("BLOQUEIOS")
$linhas.Add("============================================================")
if ($bloqueios.Count -eq 0 -and -not $bloqueioSaude) {
    $linhas.Add("- Nenhum bloqueio automatico.")
} else {
    foreach ($bloqueio in $bloqueios) {
        $linhas.Add("- $($bloqueio.Nome)")
    }
    if ($bloqueioSaude) {
        $linhas.Add("- Saude do cliente nao esta Verde.")
    }
}
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PLANO DE CORRECAO")
$linhas.Add("============================================================")
if ($bloqueios.Count -eq 0 -and -not $bloqueioSaude) {
    $linhas.Add("- Nenhuma correcao automatica obrigatoria.")
} else {
    foreach ($bloqueio in $bloqueios) {
        $linhas.Add("- Bloqueio: $($bloqueio.Nome)")
        $linhas.Add("  Acao corretiva:")
        $linhas.Add("  Responsavel:")
        $linhas.Add("  Prazo:")
        $linhas.Add("  Evidencia esperada:")
    }
    if ($bloqueioSaude) {
        $linhas.Add("- Bloqueio: Saude do cliente nao esta Verde")
        $linhas.Add("  Acao corretiva: executar rotina de sucesso, plano de correcao e nova revisao.")
        $linhas.Add("  Responsavel:")
        $linhas.Add("  Prazo:")
        $linhas.Add("  Evidencia esperada: relatorio de saude Verde ou plano formal aprovado.")
    }
}
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REQUISITOS PARA USAR COMO REFERENCIA COMERCIAL")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Termo de aceite assinado.")
$linhas.Add("- [ ] Saude do cliente Verde.")
$linhas.Add("- [ ] Pendencias bloqueantes zeradas.")
$linhas.Add("- [ ] Pendencias altas com prazo e ciencia do cliente.")
$linhas.Add("- [ ] Integracoes reais prometidas homologadas ou formalmente fora do escopo.")
$linhas.Add("- [ ] Autorizacao de referencia comercial assinada quando usar nome, logo, depoimento ou resultado.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("OBSERVACOES")
$linhas.Add("============================================================")
$linhas.Add($Observacoes)
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\AUDITORIA_EVIDENCIAS_CLIENTE_REAL_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_EXECUCAO_PRIMEIRO_CLIENTE_REAL_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_LIBERACAO_COMERCIAL_AMPLA_NEXUS_ONE.md")
$linhas.Add("- docs\PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Auditoria de evidencias gerada: $arquivo"
