param(
    [ValidateSet("Demonstracao", "PilotoAssistido", "ProducaoControlada", "AmplaComRestricoes", "Ampla")]
    [string]$Status = "ProducaoControlada",

    [string]$Responsavel = "Nexus One",

    [ValidateSet("Sim", "Nao")]
    [string]$ClienteRealComAceite = "Nao",

    [ValidateSet("Verde", "Amarelo", "Vermelho", "NaoAvaliado")]
    [string]$SaudeCliente = "NaoAvaliado",

    [ValidateSet("Sim", "Nao")]
    [string]$OperacaoRepetivel = "Nao",

    [ValidateSet("Sim", "Nao")]
    [string]$BackupRestaurado = "Nao",

    [ValidateSet("Sim", "Nao")]
    [string]$MonitoramentoAtivo = "Nao",

    [ValidateSet("Sim", "Nao")]
    [string]$SuporteSlaDefinido = "Nao",

    [ValidateSet("Sim", "Nao")]
    [string]$CapacidadeEscalaAprovada = "Nao",

    [ValidateSet("Sim", "Nao")]
    [string]$ResultadoLoteAprovado = "Nao",

    [ValidateRange(0, 999)]
    [int]$PendenciasBloqueantes = 0,

    [ValidateRange(0, 999)]
    [int]$IncidentesCriticos = 0,

    [ValidateRange(0, 999)]
    [int]$PromessasForaEscopo = 0,

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

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$arquivo = Join-Path $resolvedOutput "decisao-liberacao-comercial-$($Status.ToLowerInvariant())-$timestamp.txt"

$descricoes = @{
    Demonstracao = "Liberado somente para demonstracao comercial com dados ficticios ou homologacao."
    PilotoAssistido = "Liberado para piloto assistido com escopo controlado e acompanhamento."
    ProducaoControlada = "Liberado para producao controlada por cliente, apos Go/No-Go e aceite."
    AmplaComRestricoes = "Liberado para comercializacao ampla com restricoes documentadas."
    Ampla = "Liberado para comercializacao ampla sem restricoes criticas conhecidas."
}

$scoreClienteReal = if ($ClienteRealComAceite -eq "Sim" -and $SaudeCliente -eq "Verde") { 25 } elseif ($ClienteRealComAceite -eq "Sim" -and $SaudeCliente -eq "Amarelo") { 12 } else { 0 }
$scoreOperacao = if ($OperacaoRepetivel -eq "Sim") { 20 } else { 5 }
$scoreTecnico = 0
if ($BackupRestaurado -eq "Sim") { $scoreTecnico += 8 }
if ($MonitoramentoAtivo -eq "Sim") { $scoreTecnico += 7 }
if ($IncidentesCriticos -eq 0 -and $PendenciasBloqueantes -eq 0) { $scoreTecnico += 5 }
$scoreCapacidade = if ($SuporteSlaDefinido -eq "Sim" -and $CapacidadeEscalaAprovada -eq "Sim" -and $ResultadoLoteAprovado -eq "Sim") { 20 } elseif ($SuporteSlaDefinido -eq "Sim" -or $CapacidadeEscalaAprovada -eq "Sim") { 10 } else { 0 }
$scoreComercial = if ($PromessasForaEscopo -eq 0) { 15 } elseif ($PromessasForaEscopo -le 1) { 7 } else { 0 }
$scoreF4 = $scoreClienteReal + $scoreOperacao + $scoreTecnico + $scoreCapacidade + $scoreComercial

$bloqueios = New-Object System.Collections.Generic.List[string]
if ($ClienteRealComAceite -ne "Sim") { $bloqueios.Add("Cliente real sem aceite registrado.") }
if ($SaudeCliente -ne "Verde") { $bloqueios.Add("Cliente real nao esta classificado como Verde.") }
if ($BackupRestaurado -ne "Sim") { $bloqueios.Add("Backup/restauracao sem evidencia aprovada.") }
if ($MonitoramentoAtivo -ne "Sim") { $bloqueios.Add("Monitoramento externo nao confirmado.") }
if ($SuporteSlaDefinido -ne "Sim") { $bloqueios.Add("Suporte/SLA sem definicao completa.") }
if ($CapacidadeEscalaAprovada -ne "Sim") { $bloqueios.Add("Matriz de capacidade de escala nao aprovada.") }
if ($ResultadoLoteAprovado -ne "Sim") { $bloqueios.Add("Resultado do lote comercial nao aprovado.") }
if ($PendenciasBloqueantes -gt 0) { $bloqueios.Add("Existem pendencias bloqueantes abertas.") }
if ($IncidentesCriticos -gt 0) { $bloqueios.Add("Existem incidentes P0/P1 abertos ou recorrentes.") }
if ($PromessasForaEscopo -gt 0) { $bloqueios.Add("Existem promessas comerciais fora do escopo.") }

$statusSugerido = if ($bloqueios.Count -eq 0 -and $scoreF4 -ge 90) {
    "Ampla"
} elseif ($scoreF4 -ge 80 -and $PendenciasBloqueantes -eq 0 -and $IncidentesCriticos -eq 0 -and $ClienteRealComAceite -eq "Sim") {
    "AmplaComRestricoes"
} elseif ($scoreF4 -ge 65 -and $ClienteRealComAceite -eq "Sim") {
    "ProducaoControlada"
} elseif ($scoreF4 -ge 40) {
    "PilotoAssistido"
} else {
    "Demonstracao"
}

$alertasStatus = New-Object System.Collections.Generic.List[string]
if ($Status -eq "Ampla" -and $statusSugerido -ne "Ampla") {
    $alertasStatus.Add("Status solicitado como Ampla, mas evidencias sugerem $statusSugerido.")
}
if ($Status -eq "AmplaComRestricoes" -and $statusSugerido -in @("ProducaoControlada", "PilotoAssistido", "Demonstracao")) {
    $alertasStatus.Add("Status solicitado como AmplaComRestricoes, mas evidencias ainda sugerem $statusSugerido.")
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("DECISAO DE LIBERACAO COMERCIAL - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Status recomendado: $Status")
$linhas.Add("Status sugerido pelas evidencias: $statusSugerido")
$linhas.Add("Descricao: $($descricoes[$Status])")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("SCORE F4")
$linhas.Add("- Score total: $scoreF4/100")
$linhas.Add("- Cliente real saudavel: $scoreClienteReal/25")
$linhas.Add("- Operacao repetivel: $scoreOperacao/20")
$linhas.Add("- Estabilidade tecnica: $scoreTecnico/20")
$linhas.Add("- Capacidade de escala: $scoreCapacidade/20")
$linhas.Add("- Disciplina comercial: $scoreComercial/15")
$linhas.Add("")
$linhas.Add("EVIDENCIAS F4 INFORMADAS")
$linhas.Add("- Cliente real com aceite: $ClienteRealComAceite")
$linhas.Add("- Saude do cliente: $SaudeCliente")
$linhas.Add("- Operacao repetivel: $OperacaoRepetivel")
$linhas.Add("- Backup restaurado: $BackupRestaurado")
$linhas.Add("- Monitoramento ativo: $MonitoramentoAtivo")
$linhas.Add("- Suporte/SLA definido: $SuporteSlaDefinido")
$linhas.Add("- Capacidade de escala aprovada: $CapacidadeEscalaAprovada")
$linhas.Add("- Resultado do lote aprovado: $ResultadoLoteAprovado")
$linhas.Add("- Pendencias bloqueantes: $PendenciasBloqueantes")
$linhas.Add("- Incidentes P0/P1: $IncidentesCriticos")
$linhas.Add("- Promessas fora do escopo: $PromessasForaEscopo")
$linhas.Add("")
$linhas.Add("BLOQUEIOS E ALERTAS")
if ($bloqueios.Count -eq 0 -and $alertasStatus.Count -eq 0) {
    $linhas.Add("- Nenhum bloqueio automatico.")
} else {
    foreach ($bloqueio in $bloqueios) {
        $linhas.Add("- $bloqueio")
    }
    foreach ($alerta in $alertasStatus) {
        $linhas.Add("- $alerta")
    }
}
$linhas.Add("")
$linhas.Add("PRE-CHECK DA DECISAO")
$linhas.Add("- [ ] Registro de riscos/pendencias revisado.")
$linhas.Add("- [ ] Cronograma de implantacao atualizado.")
$linhas.Add("- [ ] Diario do piloto ou evidencias operacionais revisadas.")
$linhas.Add("- [ ] Handoff comercial/implantacao/suporte concluido.")
$linhas.Add("- [ ] Dependencias externas classificadas.")
$linhas.Add("- [ ] Cliente ciente de pendencias nao bloqueantes.")
$linhas.Add("- [ ] Suporte, SLA, canal e responsavel definidos.")
$linhas.Add("- [ ] Termo de aceite preparado quando houver producao controlada.")
$linhas.Add("")
$linhas.Add("CRITERIOS BLOQUEANTES A CONFIRMAR")
$linhas.Add("- [ ] Nao ha pendencia bloqueante aberta.")
$linhas.Add("- [ ] Backup localizado e restauracao testada quando houver uso real.")
$linhas.Add("- [ ] Smoke test operacional sem falha critica.")
$linhas.Add("- [ ] Caixa/venda/estoque/financeiro funcionam no escopo contratado.")
$linhas.Add("- [ ] Fiscal real nao foi vendido sem homologacao oficial.")
$linhas.Add("- [ ] Pagamento real nao foi vendido sem homologacao ponta a ponta.")
$linhas.Add("- [ ] Dados reais possuem responsavel LGPD.")
$linhas.Add("- [ ] Usuario-chave treinado.")
$linhas.Add("")
$linhas.Add("CHECKLIST F4 - COMERCIALIZACAO AMPLA")
$linhas.Add("- [ ] Pelo menos um cliente real implantado com aceite.")
$linhas.Add("- [ ] Cliente classificado como Verde na rotina de sucesso.")
$linhas.Add("- [ ] Deploy definitivo validado.")
$linhas.Add("- [ ] Banco real provisionado.")
$linhas.Add("- [ ] Backup agendado e restauracao testada com evidencia.")
$linhas.Add("- [ ] Monitoramento externo testado.")
$linhas.Add("- [ ] Segredos auditados e primeira rotacao registrada.")
$linhas.Add("- [ ] Smoke test operacional aprovado apos deploy.")
$linhas.Add("- [ ] Go/No-Go sem pendencia bloqueante.")
$linhas.Add("- [ ] Integracoes reais classificadas como homologadas, sandbox ou fora do escopo.")
$linhas.Add("- [ ] Suporte/SLA funcionando com canal e responsavel.")
$linhas.Add("- [ ] Processo comercial/implantacao/sucesso aplicado de ponta a ponta.")
$linhas.Add("")
$linhas.Add("RESTRICOES")
$linhas.Add("- Fiscal real depende de homologacao por cliente/filial/modelo.")
$linhas.Add("- Pagamento real depende de provedor e conciliacao ponta a ponta.")
$linhas.Add("- Notificacoes reais dependem de canal/token/webhook do cliente.")
$linhas.Add("- Producao ampla nao deve ser prometida sem evidencias reais.")
$linhas.Add("")
$linhas.Add("EVIDENCIAS REVISADAS")
$linhas.Add("- [ ] Handoff.")
$linhas.Add("- [ ] Diagnostico.")
$linhas.Add("- [ ] Cronograma.")
$linhas.Add("- [ ] Diario do piloto.")
$linhas.Add("- [ ] Registro de riscos.")
$linhas.Add("- [ ] Smoke test.")
$linhas.Add("- [ ] Backup/restauracao.")
$linhas.Add("- [ ] Integracoes/homologacoes.")
$linhas.Add("- [ ] Treinamento.")
$linhas.Add("- [ ] Termo de aceite.")
$linhas.Add("")
$linhas.Add("PROXIMA ACAO")
if ($Status -eq "Ampla" -or $Status -eq "AmplaComRestricoes") {
    $linhas.Add("- Preparar campanha/comercializacao com limites e evidencias aprovadas.")
} elseif ($Status -eq "ProducaoControlada") {
    $linhas.Add("- Executar primeiro cliente real, coletar aceite e relatorio de saude Verde.")
} else {
    $linhas.Add("- Manter venda controlada e completar evidencias tecnicas/operacionais.")
}
$linhas.Add("")
$linhas.Add("AUTORIZACAO")
$linhas.Add("- Responsavel tecnico:")
$linhas.Add("- Responsavel comercial:")
$linhas.Add("- Responsavel suporte/implantacao:")
$linhas.Add("- Data da decisao:")
$linhas.Add("- Condicoes para seguir:")
$linhas.Add("")
$linhas.Add("REFERENCIAS")
$linhas.Add("- docs\PLANO_LIBERACAO_COMERCIAL_AMPLA_NEXUS_ONE.md")
$linhas.Add("- docs\FICHA_PRONTIDAO_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Decisao de liberacao comercial gerada: $arquivo"
