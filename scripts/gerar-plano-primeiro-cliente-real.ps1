param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Ambiente = "producao controlada",

    [string]$Responsavel = "Nexus One",

    [string]$DataInicio = "",

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
$arquivo = Join-Path $resolvedOutput "plano-primeiro-cliente-real-$slug-$timestamp.txt"

$inicio = if ([string]::IsNullOrWhiteSpace($DataInicio)) {
    Get-Date
} else {
    [datetime]::Parse($DataInicio)
}

$marcos = @(
    @{ Dia = 0; Fase = "F0"; Atividade = "Fechamento comercial"; Evidencia = "Ata, proposta, faturamento" },
    @{ Dia = 1; Fase = "F1"; Atividade = "Diagnostico, handoff e cronograma"; Evidencia = "Diagnostico, handoff, cronograma" },
    @{ Dia = 2; Fase = "F2"; Atividade = "Deploy, banco, segredos e pre-deploy"; Evidencia = "Pre-deploy, auditoria de segredos" },
    @{ Dia = 3; Fase = "F3"; Atividade = "Carga inicial, LGPD e smoke test"; Evidencia = "Carga validada, responsavel LGPD, smoke" },
    @{ Dia = 4; Fase = "F4"; Atividade = "Operacao assistida - ciclo 1"; Evidencia = "Diario do piloto e incidentes" },
    @{ Dia = 7; Fase = "F4"; Atividade = "Operacao assistida - ciclo 2"; Evidencia = "Pendencias classificadas" },
    @{ Dia = 9; Fase = "F5"; Atividade = "Go/No-Go e aceite"; Evidencia = "Matriz Go/No-Go e termo de aceite" },
    @{ Dia = 14; Fase = "F6"; Atividade = "Saude do cliente e NPS"; Evidencia = "Relatorio de saude e feedback" },
    @{ Dia = 15; Fase = "F7"; Atividade = "Decisao de liberacao comercial"; Evidencia = "Decisao de liberacao" }
)

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("PLANO DE EXECUCAO DO PRIMEIRO CLIENTE REAL - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Ambiente: $Ambiente")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("Data de inicio: $($inicio.ToString('dd/MM/yyyy'))")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("OBJETIVO")
$linhas.Add("============================================================")
$linhas.Add("Executar o primeiro cliente real de forma controlada, reunindo evidencias para reduzir risco antes de comercializacao ampla.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("MARCOS")
$linhas.Add("============================================================")
foreach ($marco in $marcos) {
    $dataMarco = $inicio.AddDays($marco.Dia).ToString("dd/MM/yyyy")
    $linhas.Add("- $dataMarco | $($marco.Fase) | $($marco.Atividade) | Evidencia: $($marco.Evidencia)")
}
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CHECKLIST CRITICO")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Ata de fechamento comercial gerada.")
$linhas.Add("- [ ] Faturamento/contrato registrado quando aplicavel.")
$linhas.Add("- [ ] Diagnostico, handoff e cronograma concluidos.")
$linhas.Add("- [ ] Deploy, banco real, segredos, backup, restauracao e monitoramento validados.")
$linhas.Add("- [ ] Smoke test operacional aprovado.")
$linhas.Add("- [ ] Integracoes reais classificadas como homologadas, sandbox ou fora do escopo.")
$linhas.Add("- [ ] Usuarios-chave treinados.")
$linhas.Add("- [ ] Diario de piloto/operacao assistida preenchido.")
$linhas.Add("- [ ] Go/No-Go sem pendencia bloqueante.")
$linhas.Add("- [ ] Termo de aceite assinado.")
$linhas.Add("- [ ] Saude do cliente Verde antes de liberar escala ampla.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("BLOQUEIOS")
$linhas.Add("============================================================")
$linhas.Add("- Pendencia bloqueante aberta.")
$linhas.Add("- Backup sem restauracao testada.")
$linhas.Add("- Monitoramento externo sem alerta validado.")
$linhas.Add("- Integracao real prometida sem homologacao.")
$linhas.Add("- Cliente sem responsavel operacional.")
$linhas.Add("- Suporte sem canal e SLA comunicados.")
$linhas.Add("- Cliente Amarelo ou Vermelho na rotina de sucesso.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PROXIMA DECISAO")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Manter producao controlada.")
$linhas.Add("- [ ] Prorrogar operacao assistida.")
$linhas.Add("- [ ] Voltar para correcao de pendencias.")
$linhas.Add("- [ ] Liberar comercializacao ampla com restricoes.")
$linhas.Add("- [ ] Liberar comercializacao ampla.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("REFERENCIAS")
$linhas.Add("============================================================")
$linhas.Add("- docs\PLANO_EXECUCAO_PRIMEIRO_CLIENTE_REAL_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_LIBERACAO_COMERCIAL_AMPLA_NEXUS_ONE.md")
$linhas.Add("- docs\PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Plano do primeiro cliente real gerado: $arquivo"
