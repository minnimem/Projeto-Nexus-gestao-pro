param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Plano = "Medio",

    [string]$Ambiente = "piloto assistido",

    [datetime]$DataInicio = (Get-Date),

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
$arquivo = Join-Path $resolvedOutput "cronograma-implantacao-$slug-$timestamp.txt"

function Add-BusinessDays {
    param(
        [datetime]$Date,
        [int]$Days
    )

    $current = $Date
    $remaining = [Math]::Abs($Days)
    $direction = if ($Days -lt 0) { -1 } else { 1 }

    while ($remaining -gt 0) {
        $current = $current.AddDays($direction)
        if ($current.DayOfWeek -ne [DayOfWeek]::Saturday -and $current.DayOfWeek -ne [DayOfWeek]::Sunday) {
            $remaining--
        }
    }

    return $current
}

$atividades = @(
    @{ Offset = -5; Marco = "D-5"; Atividade = "Handoff comercial, diagnostico e plano contratado"; Entregavel = "Handoff + ficha de diagnostico" },
    @{ Offset = -4; Marco = "D-4"; Atividade = "Conferencia de dados, usuarios, filiais e modulos"; Entregavel = "Lista de dados/usuarios" },
    @{ Offset = -3; Marco = "D-3"; Atividade = "Preparacao de ambiente, segredos e banco"; Entregavel = "Pre-deploy e verificacao" },
    @{ Offset = -2; Marco = "D-2"; Atividade = "Backup, restauracao, monitoramento e smoke test"; Entregavel = "Evidencias tecnicas" },
    @{ Offset = -1; Marco = "D-1"; Atividade = "Carga inicial, treinamento e checklist de entrada"; Entregavel = "Verificacao de carga + treinamento" },
    @{ Offset = 0; Marco = "D1"; Atividade = "Inicio da operacao assistida"; Entregavel = "Diario D1" },
    @{ Offset = 1; Marco = "D2"; Atividade = "Vendas, caixa e estoque acompanhados"; Entregavel = "Diario D2" },
    @{ Offset = 2; Marco = "D3"; Atividade = "Financeiro, fiscal/integracoes conforme escopo"; Entregavel = "Diario D3" },
    @{ Offset = 3; Marco = "D4"; Atividade = "Relatorios, suporte e ajustes nao bloqueantes"; Entregavel = "Diario D4" },
    @{ Offset = 4; Marco = "D5"; Atividade = "Revisao intermediaria de riscos e pendencias"; Entregavel = "Registro de riscos atualizado" },
    @{ Offset = 8; Marco = "D9"; Atividade = "Simulacao de suporte/incidente e consolidacao"; Entregavel = "Ficha de incidente + riscos" },
    @{ Offset = 9; Marco = "D10"; Atividade = "Go/No-Go, aceite ou prorrogacao"; Entregavel = "Matriz + termo de aceite" }
)

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("CRONOGRAMA DE IMPLANTACAO - NEXUS ONE")
$linhas.Add("Gerado em: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Plano: $Plano")
$linhas.Add("Ambiente: $Ambiente")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("Data prevista de inicio assistido: $($DataInicio.ToString('dd/MM/yyyy'))")
$linhas.Add("")
$linhas.Add("PRE-REQUISITOS PARA PUBLICAR CRONOGRAMA")
$linhas.Add("- [ ] Proposta/aceite aprovado ou piloto autorizado.")
$linhas.Add("- [ ] Handoff comercial, implantacao e suporte concluido.")
$linhas.Add("- [ ] Responsavel operacional do cliente definido.")
$linhas.Add("- [ ] Modulos, usuarios, filiais, caixas e limites do plano confirmados.")
$linhas.Add("- [ ] Dependencias externas classificadas: fiscal, pagamento, notificacoes e integracoes.")
$linhas.Add("- [ ] Dados para carga inicial recebidos ou prazo formal definido.")
$linhas.Add("- [ ] Ambiente alvo definido.")
$linhas.Add("- [ ] Canal de suporte e treinamento alinhado com o cliente.")
$linhas.Add("")
$linhas.Add("CRONOGRAMA")
$linhas.Add("Marco | Data | Atividade | Entregavel | Status")
$linhas.Add("--- | --- | --- | --- | ---")

foreach ($item in $atividades) {
    $data = Add-BusinessDays -Date $DataInicio -Days $item.Offset
    $linhas.Add("$($item.Marco) | $($data.ToString('dd/MM/yyyy')) | $($item.Atividade) | $($item.Entregavel) | Pendente")
}

$linhas.Add("")
$linhas.Add("DEPENDENCIAS POR MARCO")
$linhas.Add("Marco | Depende de | Se atrasar")
$linhas.Add("--- | --- | ---")
$linhas.Add("D-5 | Proposta, handoff e diagnostico | Nao publicar data D1")
$linhas.Add("D-4 | Dados e usuarios do cliente | Reprogramar carga inicial")
$linhas.Add("D-3 | Ambiente, segredos e banco | Bloquear producao controlada")
$linhas.Add("D-2 | Backup, restauracao, monitoramento e smoke test | Nao iniciar operacao real")
$linhas.Add("D-1 | Carga inicial e treinamento | Iniciar apenas homologacao assistida")
$linhas.Add("D1 | Go de entrada sem bloqueantes | Prorrogar preparacao")
$linhas.Add("D5 | Riscos revisados | Ajustar escopo ou plano de acao")
$linhas.Add("D10 | Evidencias e aceite | Prorrogar piloto ou emitir No-Go")
$linhas.Add("")
$linhas.Add("REGRAS DE CONTROLE")
$linhas.Add("- Nao iniciar D1 sem handoff, diagnostico, escopo do plano, dados minimos e responsaveis definidos.")
$linhas.Add("- Nao iniciar producao controlada sem backup/restauracao, smoke test e monitoramento.")
$linhas.Add("- Nao encerrar operacao assistida com pendencia bloqueante aberta.")
$linhas.Add("- Mudanca de escopo deve voltar para proposta/plano comercial.")
$linhas.Add("- Atraso causado por dependencia do cliente deve ser registrado no cronograma e no registro de riscos.")
$linhas.Add("- Operacao assistida pode ser prorrogada quando houver valor demonstrado, mas aceite ainda estiver pendente.")
$linhas.Add("")
$linhas.Add("STATUS PERMITIDOS")
$linhas.Add("- Pendente")
$linhas.Add("- Em andamento")
$linhas.Add("- Concluido")
$linhas.Add("- Atrasado por Nexus One")
$linhas.Add("- Atrasado por cliente")
$linhas.Add("- Bloqueado")
$linhas.Add("- Reprogramado")
$linhas.Add("")
$linhas.Add("EVIDENCIAS")
$linhas.Add("- Handoff comercial/implantacao/suporte.")
$linhas.Add("- Ficha de diagnostico/coleta inicial.")
$linhas.Add("- Escopo do plano comercial.")
$linhas.Add("- Registro de riscos/pendencias.")
$linhas.Add("- Pre-deploy e verificacao de producao/homologacao.")
$linhas.Add("- Verificacao de carga inicial.")
$linhas.Add("- Evidencia de treinamento.")
$linhas.Add("- Diario operacional do piloto.")
$linhas.Add("- Matriz Go/No-Go.")
$linhas.Add("- Termo de aceite.")
$linhas.Add("- Pacote de entrega.")
$linhas.Add("")
$linhas.Add("REFERENCIAS")
$linhas.Add("- docs\CRONOGRAMA_IMPLANTACAO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_IMPLANTACAO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\PLANO_PILOTO_ASSISTIDO_NEXUS_ONE.md")
$linhas.Add("- docs\PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Cronograma de implantacao gerado: $arquivo"
