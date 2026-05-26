param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Cnpj = "Nao informado",

    [ValidateSet("Basico", "Medio", "Avancado", "Personalizado")]
    [string]$Plano = "Medio",

    [ValidateRange(0, 999999)]
    [decimal]$Mensalidade = 349,

    [ValidateRange(0, 999999)]
    [decimal]$Implantacao = 1200,

    [ValidateRange(1, 31)]
    [int]$DiaVencimento = 10,

    [ValidateSet("Pix", "Boleto", "Transferencia", "Cartao", "Outro")]
    [string]$FormaPagamento = "Pix",

    [ValidateSet("Mensal", "Trimestral", "Semestral", "Anual")]
    [string]$Periodicidade = "Mensal",

    [string]$DataInicioCobranca = (Get-Date -Format "dd/MM/yyyy"),

    [string]$DataFimPilotoGratuito = "",

    [string]$Status = "Aguardando primeira cobranca",

    [string]$Adicionais = "Nenhum adicional informado",

    [string]$CondicoesEspeciais = "Sem desconto ou cortesia registrada",

    [string]$ResponsavelCondicaoEspecial = "",

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
$arquivo = Join-Path $resolvedOutput "faturamento-cliente-$slug-$timestamp.txt"
$culture = [System.Globalization.CultureInfo]::GetCultureInfo("pt-BR")
$mensalidadeFormatada = $Mensalidade.ToString("C", $culture)
$implantacaoFormatada = $Implantacao.ToString("C", $culture)

$alertas = New-Object System.Collections.Generic.List[string]
if ($Mensalidade -eq 0 -and $Status -ne "Piloto gratuito") {
    $alertas.Add("Mensalidade zerada fora de piloto gratuito: revisar aprovacao comercial.")
}
if ($Implantacao -eq 0) {
    $alertas.Add("Taxa de implantacao zerada: confirmar se houve cortesia aprovada.")
}
if ($Plano -eq "Personalizado") {
    $alertas.Add("Plano personalizado exige escopo e limites anexados.")
}
if ($FormaPagamento -in @("Pix", "Boleto") -and $Status -eq "Mensalidade ativa") {
    $alertas.Add("Confirmar homologacao do provedor/canal de pagamento antes de automatizar baixa.")
}
if ($Status -eq "Piloto gratuito" -and [string]::IsNullOrWhiteSpace($DataFimPilotoGratuito)) {
    $alertas.Add("Piloto gratuito sem data final: registrar criterio de conversao ou encerramento.")
}
if ($CondicoesEspeciais -ne "Sem desconto ou cortesia registrada" -and [string]::IsNullOrWhiteSpace($ResponsavelCondicaoEspecial)) {
    $alertas.Add("Condicao especial sem responsavel aprovador.")
}

if ($Status -in @("Suspenso financeiro", "Cancelado")) {
    $riscoFinanceiro = "Alto"
} elseif ($Mensalidade -eq 0 -or $Status -eq "Piloto gratuito" -or $CondicoesEspeciais -ne "Sem desconto ou cortesia registrada") {
    $riscoFinanceiro = "Medio"
} else {
    $riscoFinanceiro = "Baixo"
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("FATURAMENTO DO CLIENTE - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("CNPJ/identificacao: $Cnpj")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("PLANO E COBRANCA")
$linhas.Add("============================================================")
$linhas.Add("- Plano contratado: $Plano")
$linhas.Add("- Mensalidade: $mensalidadeFormatada")
$linhas.Add("- Implantacao: $implantacaoFormatada")
$linhas.Add("- Dia de vencimento: $DiaVencimento")
$linhas.Add("- Forma de pagamento: $FormaPagamento")
$linhas.Add("- Periodicidade: $Periodicidade")
$linhas.Add("- Inicio da cobranca: $DataInicioCobranca")
$linhas.Add("- Fim do piloto gratuito: $DataFimPilotoGratuito")
$linhas.Add("- Status: $Status")
$linhas.Add("- Risco financeiro: $riscoFinanceiro")
$linhas.Add("- Adicionais: $Adicionais")
$linhas.Add("- Condicoes especiais: $CondicoesEspeciais")
$linhas.Add("- Responsavel pela condicao especial: $ResponsavelCondicaoEspecial")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("CONTROLE DE VENCIMENTO")
$linhas.Add("============================================================")
$linhas.Add("- [ ] D-7: cobranca emitida ou programada.")
$linhas.Add("- [ ] D-3: lembrete enviado quando aplicavel.")
$linhas.Add("- [ ] D0: pagamento ou baixa conferidos.")
$linhas.Add("- [ ] D+3: atraso pontual registrado e financeiro acionado.")
$linhas.Add("- [ ] D+7: risco financeiro revisado e comercial comunicado.")
$linhas.Add("- [ ] D+15: suspensao/renegociacao avaliada conforme contrato.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("DESCONTO, CORTESIA OU CONDICAO ESPECIAL")
$linhas.Add("============================================================")
$linhas.Add("- Motivo:")
$linhas.Add("- Responsavel que aprovou: $ResponsavelCondicaoEspecial")
$linhas.Add("- Prazo final:")
$linhas.Add("- Valor cheio: $mensalidadeFormatada")
$linhas.Add("- Valor com desconto/cortesia:")
$linhas.Add("- Regra de retorno ao valor normal:")
$linhas.Add("- Afeta: implantacao / mensalidade / adicional / suporte")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("EVIDENCIAS A ANEXAR")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Proposta/contrato/aceite comercial aprovado.")
$linhas.Add("- [ ] Escopo do plano anexado.")
$linhas.Add("- [ ] Qualificacao comercial anexada quando aplicavel.")
$linhas.Add("- [ ] Primeira cobranca emitida ou registrada.")
$linhas.Add("- [ ] Condicoes especiais aprovadas por responsavel.")
$linhas.Add("- [ ] Cliente comunicado sobre vencimento, forma de pagamento e inicio da recorrencia.")
$linhas.Add("- [ ] Registro de atraso, renegociacao, suspensao ou baixa quando houver.")
$linhas.Add("")
$linhas.Add("============================================================")
$linhas.Add("BLOQUEIOS FINANCEIROS")
$linhas.Add("============================================================")
$linhas.Add("- [ ] Plano sem valor, vencimento ou forma de pagamento.")
$linhas.Add("- [ ] Desconto/cortesia sem responsavel e prazo.")
$linhas.Add("- [ ] Piloto gratuito sem data de fim.")
$linhas.Add("- [ ] Status financeiro desconhecido.")
$linhas.Add("- [ ] Integracao de Pix/boleto real prometida sem homologacao.")
$linhas.Add("- [ ] Faturamento divergente do escopo contratado.")
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
$linhas.Add("- docs\PROCESSO_FATURAMENTO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md")
$linhas.Add("- docs\MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md")
$linhas.Add("- docs\PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Faturamento do cliente gerado: $arquivo"
