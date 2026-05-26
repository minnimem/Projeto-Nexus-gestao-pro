param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Motivo = "Cancelamento solicitado pelo cliente",

    [string]$DataEncerramento = (Get-Date -Format "dd/MM/yyyy"),

    [ValidateSet("Cancelamento voluntario", "Nao conversao de piloto", "Inadimplencia", "Migracao para outro sistema", "Pausa longa", "Outro")]
    [string]$TipoSaida = "Cancelamento voluntario",

    [ValidateSet("Nao solicitado", "Pendente", "Entregue", "Nao aplicavel")]
    [string]$ExportacaoDados = "Pendente",

    [ValidateSet("Manter conforme contrato", "Anonimizar", "Excluir quando permitido", "Aguardando validacao")]
    [string]$TratamentoDados = "Aguardando validacao",

    [ValidateSet("Pendente", "Concluido", "Nao aplicavel")]
    [string]$BloqueioAcessos = "Pendente",

    [ValidateSet("Pendente", "Concluido", "Nao aplicavel")]
    [string]$BaixaFinanceira = "Pendente",

    [string]$AprendizadoSaida = "Ainda nao registrado",

    [string]$ConcorrenteAlternativa = "Nao informado",

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
$arquivo = Join-Path $resolvedOutput "offboarding-cliente-$slug-$timestamp.txt"

$alertas = New-Object System.Collections.Generic.List[string]
if ($ExportacaoDados -eq "Pendente") {
    $alertas.Add("Exportacao de dados pendente: confirmar escopo, responsavel autorizado e prazo.")
}
if ($TratamentoDados -eq "Aguardando validacao") {
    $alertas.Add("Tratamento de dados aguardando validacao: conferir LGPD, contrato e obrigacoes fiscais/contabeis.")
}
if ($BloqueioAcessos -eq "Pendente") {
    $alertas.Add("Bloqueio de acessos pendente: nao concluir encerramento sem data e responsavel.")
}
if ($BaixaFinanceira -eq "Pendente") {
    $alertas.Add("Baixa financeira pendente: revisar saldo, credito, multa, inadimplencia ou ultima cobranca.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("OFFBOARDING E ENCERRAMENTO DE CLIENTE - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("DECISAO DE ENCERRAMENTO")
$linhas.Add("============================================================")
$linhas.Add("- Tipo de saida: $TipoSaida")
$linhas.Add("- Motivo: $Motivo")
$linhas.Add("- Data efetiva de encerramento: $DataEncerramento")
$linhas.Add("- Exportacao de dados: $ExportacaoDados")
$linhas.Add("- Tratamento de dados: $TratamentoDados")
$linhas.Add("- Bloqueio de acessos: $BloqueioAcessos")
$linhas.Add("- Baixa financeira: $BaixaFinanceira")
$linhas.Add("- Concorrente/alternativa: $ConcorrenteAlternativa")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("GO DE ENCERRAMENTO")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Decisor autorizado confirmou o encerramento.")
$linhas.Add("- [ ] Retencao, exportacao, anonimizacao ou exclusao de dados foi definida.")
$linhas.Add("- [ ] Obrigacoes fiscais/contabeis foram validadas com cliente/contador quando aplicavel.")
$linhas.Add("- [ ] Financeiro revisou saldo, credito, multa, inadimplencia ou ultima cobranca.")
$linhas.Add("- [ ] Acessos, tokens, webhooks, certificados e integracoes possuem data de bloqueio/remocao.")
$linhas.Add("- [ ] Base de conhecimento, suporte e incidentes foram encerrados ou transferidos.")
$linhas.Add("- [ ] Aprendizado comercial/produto foi registrado.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CHECKLIST")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Decisor do cliente confirmou o encerramento.")
$linhas.Add("- [ ] Faturamento final revisado.")
$linhas.Add("- [ ] Exportacao de dados entregue ou dispensada formalmente.")
$linhas.Add("- [ ] Retencao, exclusao ou anonimizacao validada.")
$linhas.Add("- [ ] Usuarios e acessos bloqueados.")
$linhas.Add("- [ ] Tokens, webhooks, certificados e integracoes desativados quando aplicavel.")
$linhas.Add("- [ ] Pendencias de suporte encerradas ou documentadas.")
$linhas.Add("- [ ] Uso de nome/logo/depoimento/caso revisado.")
$linhas.Add("- [ ] Comunicacao final enviada ao cliente.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PLANO DE DADOS")
$linhas.Add("============================================================")
$linhas.Add("Item | Decisao | Responsavel | Prazo | Evidencia")
$linhas.Add("--- | --- | --- | --- | ---")
$linhas.Add("Exportacao | $ExportacaoDados |  |  | ")
$linhas.Add("Retencao | $TratamentoDados |  |  | ")
$linhas.Add("Anonimizacao |  |  |  | ")
$linhas.Add("Exclusao |  |  |  | ")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("APRENDIZADO DE SAIDA")
$linhas.Add("============================================================")
$linhas.Add("- Motivo principal: $Motivo")
$linhas.Add("- Concorrente ou alternativa escolhida: $ConcorrenteAlternativa")
$linhas.Add("- Aprendizado: $AprendizadoSaida")
$linhas.Add("- Deve virar roadmap/base/treinamento/ajuste comercial:")
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
$linhas.Add("- docs\PROCESSO_OFFBOARDING_ENCERRAMENTO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_RENOVACAO_RETENCAO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_FATURAMENTO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\POLITICA_PRIVACIDADE_LGPD_NEXUS_ONE.md")
$linhas.Add("- docs\PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Offboarding do cliente gerado: $arquivo"
