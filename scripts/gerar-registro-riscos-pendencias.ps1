param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Ambiente = "producao controlada",

    [string]$Plano = "Medio",

    [string]$Responsavel = "Nexus One",

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
$arquivo = Join-Path $resolvedOutput "registro-riscos-pendencias-$slug-$timestamp.txt"

$riscosPadrao = @(
    @{ Id = "R001"; Area = "Deploy"; Severidade = "Bloqueante"; Descricao = "Servidor definitivo ainda nao validado"; Status = "Aberto" },
    @{ Id = "R002"; Area = "Backup"; Severidade = "Bloqueante"; Descricao = "Restauracao de backup ainda nao testada com evidencia"; Status = "Aberto" },
    @{ Id = "R003"; Area = "Monitoramento"; Severidade = "Alta"; Descricao = "Alerta externo ainda nao testado no ambiente do cliente"; Status = "Aberto" },
    @{ Id = "R004"; Area = "Seguranca"; Severidade = "Alta"; Descricao = "Primeira rotacao/cofre de segredos ainda nao registrada"; Status = "Aberto" },
    @{ Id = "R005"; Area = "Integracoes"; Severidade = "Alta"; Descricao = "Fiscal, pagamento ou notificacao real dependem de homologacao do cliente/provedor"; Status = "Aberto" },
    @{ Id = "R006"; Area = "Treinamento"; Severidade = "Media"; Descricao = "Usuario-chave precisa concluir validacao pratica do fluxo contratado"; Status = "Aberto" },
    @{ Id = "R007"; Area = "LGPD"; Severidade = "Media"; Descricao = "Responsavel de privacidade e aceite de uso de dados reais precisam estar registrados"; Status = "Aberto" }
)

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("REGISTRO DE RISCOS E PENDENCIAS - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Ambiente: $Ambiente")
$linhas.Add("Plano: $Plano")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("CRITERIO")
$linhas.Add("- Bloqueante: impede producao controlada/ampla ate correcao ou reclassificacao formal.")
$linhas.Add("- Alta: exige responsavel, prazo, contorno e ciencia do cliente.")
$linhas.Add("- Media/Baixa: pode seguir se registrada no plano de acao.")
$linhas.Add("")
$linhas.Add("CICLO DE TRATAMENTO")
$linhas.Add("- Abrir: registrar ID, area, severidade, responsavel e prazo.")
$linhas.Add("- Classificar: confirmar se bloqueia Go/No-Go ou aceite.")
$linhas.Add("- Definir contorno: documentar alternativa operacional quando nao houver correcao imediata.")
$linhas.Add("- Reclassificar: alterar severidade somente com motivo e evidencia.")
$linhas.Add("- Aceitar risco: usar apenas para pendencia nao bloqueante com ciencia do cliente.")
$linhas.Add("- Fechar: anexar evidencia ao pacote de entrega.")
$linhas.Add("")
$linhas.Add("RISCOS/PENDENCIAS PADRAO PARA REVISAO")
$linhas.Add("ID | Area | Severidade | Status | Descricao | Responsavel | Prazo | Contorno | Evidencia/observacao")
$linhas.Add("--- | --- | --- | --- | --- | --- | --- | --- | ---")

foreach ($risco in $riscosPadrao) {
    $linhas.Add("$($risco.Id) | $($risco.Area) | $($risco.Severidade) | $($risco.Status) | $($risco.Descricao) |  |  |  | ")
}

$bloqueantes = ($riscosPadrao | Where-Object { $_.Severidade -eq "Bloqueante" -and $_.Status -eq "Aberto" }).Count
$altas = ($riscosPadrao | Where-Object { $_.Severidade -eq "Alta" -and $_.Status -eq "Aberto" }).Count

$linhas.Add("")
$linhas.Add("RESUMO INICIAL")
$linhas.Add("- Pendencias bloqueantes abertas: $bloqueantes")
$linhas.Add("- Pendencias altas abertas: $altas")
$linhas.Add("- Decisao inicial sugerida: No-go para producao controlada ate revisar/corrigir bloqueantes.")
$linhas.Add("")
$linhas.Add("STATUS PERMITIDOS")
$linhas.Add("- Aberto")
$linhas.Add("- Em tratamento")
$linhas.Add("- Aguardando cliente")
$linhas.Add("- Aguardando terceiro")
$linhas.Add("- Reclassificado")
$linhas.Add("- Aceito pelo cliente")
$linhas.Add("- Resolvido")
$linhas.Add("- Cancelado")
$linhas.Add("")
$linhas.Add("CHECKLIST ANTES DO GO/NO-GO")
$linhas.Add("- [ ] Nao ha pendencia bloqueante aberta.")
$linhas.Add("- [ ] Pendencias altas possuem responsavel e prazo.")
$linhas.Add("- [ ] Dependencias externas foram classificadas como homologadas, sandbox ou fora do escopo.")
$linhas.Add("- [ ] Cliente aceitou formalmente pendencias nao bloqueantes.")
$linhas.Add("- [ ] Evidencias obrigatorias foram anexadas ao pacote de entrega.")
$linhas.Add("")
$linhas.Add("PLANO DE ACAO")
$linhas.Add("Prioridade | Acao | Responsavel | Prazo | Evidencia esperada")
$linhas.Add("--- | --- | --- | --- | ---")
$linhas.Add("P0 | Corrigir pendencia bloqueante |  |  | ")
$linhas.Add("P1 | Definir contorno para pendencia alta |  |  | ")
$linhas.Add("P2 | Planejar pendencias medias/baixas |  |  | ")
$linhas.Add("")
$linhas.Add("ACEITE DE PENDENCIA NAO BLOQUEANTE")
$linhas.Add("- Pendencia:")
$linhas.Add("- Severidade:")
$linhas.Add("- Contorno:")
$linhas.Add("- Prazo:")
$linhas.Add("- Impacto comunicado ao cliente:")
$linhas.Add("- Cliente aceita seguir: sim / nao")
$linhas.Add("- Registrar no termo de aceite: sim / nao")
$linhas.Add("")
$linhas.Add("REFERENCIAS")
$linhas.Add("- docs\REGISTRO_RISCOS_PENDENCIAS_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Registro de riscos e pendencias gerado: $arquivo"
