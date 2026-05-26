param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [int]$DiasDesdeInicio = 15,

    [ValidateSet("Verde", "Amarelo", "Vermelho")]
    [string]$Classificacao = "Amarelo",

    [ValidateRange(0, 100)]
    [int]$Pontuacao = 70,

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
$arquivo = Join-Path $resolvedOutput "saude-cliente-$slug-$timestamp.txt"

switch ($Classificacao) {
    "Verde" {
        $decisao = "Cliente saudavel. Pode reduzir acompanhamento intensivo e avaliar uso como referencia comercial, se houver autorizacao."
        $acoes = @("Registrar caso de sucesso interno.", "Avaliar upgrade/modulo adicional conforme necessidade real.", "Manter acompanhamento mensal.")
    }
    "Vermelho" {
        $decisao = "Cliente em risco alto. Manter operacao assistida, abrir plano de acao e nao usar como referencia comercial."
        $acoes = @("Abrir incidente ou plano de acao.", "Revisar escopo, dados, treinamento e integracoes.", "Definir responsaveis e prazos para bloqueios.")
    }
    default {
        $decisao = "Cliente em atencao. Manter acompanhamento semanal ate estabilizar uso e pendencias."
        $acoes = @("Agendar revisao com usuarios-chave.", "Reforcar treinamento no modulo com maior dificuldade.", "Atualizar registro de riscos/pendencias.")
    }
}

if ($Pontuacao -ge 85) {
    $leituraScore = "Score compativel com Verde, desde que nao exista bloqueante."
} elseif ($Pontuacao -ge 65) {
    $leituraScore = "Score compativel com Amarelo. Manter acompanhamento e plano de melhoria."
} else {
    $leituraScore = "Score compativel com Vermelho. Abrir plano de acao."
}

$impactoComercial = switch ($Classificacao) {
    "Verde" { "Pode avaliar referencia comercial com autorizacao formal e auditoria de evidencias aprovada." }
    "Vermelho" { "Nao usar como referencia nem evidencia de escala. Priorizar retencao e correcao." }
    default { "Nao usar como referencia ainda. Corrigir adocao, treinamento, pendencias ou expectativa." }
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("RELATORIO DE SAUDE DO CLIENTE POS-IMPLANTACAO - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Dias desde inicio assistido: $DiasDesdeInicio")
$linhas.Add("Classificacao: $Classificacao")
$linhas.Add("Pontuacao de saude: $Pontuacao / 100")
$linhas.Add("Leitura do score: $leituraScore")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("PONTUACAO DE SAUDE")
$linhas.Add("Area | Peso | Nota 0-5 | Evidencia")
$linhas.Add("--- | --- | --- | ---")
$linhas.Add("Uso do fluxo principal | 20 |  | Diario, log, relato do usuario-chave")
$linhas.Add("Vendas/caixa | 15 |  | Fechamento, comprovantes, conciliacao")
$linhas.Add("Estoque/financeiro | 15 |  | Saldos, contas, relatorios")
$linhas.Add("Suporte e incidentes | 15 |  | Chamados, P0/P1, SLA")
$linhas.Add("Pendencias e riscos | 15 |  | Registro de riscos atualizado")
$linhas.Add("Integracoes | 10 |  | Homologadas, sandbox ou fora do escopo")
$linhas.Add("Satisfacao/NPS | 10 |  | Feedback ou NPS")
$linhas.Add("")
$linhas.Add("CHECKLIST")
$linhas.Add("- [ ] Cliente operou pelo menos um fluxo principal do escopo.")
$linhas.Add("- [ ] Vendas/pedidos foram registrados sem retrabalho critico.")
$linhas.Add("- [ ] Caixa/recebimentos foram conferidos.")
$linhas.Add("- [ ] Estoque/financeiro refletem a operacao principal.")
$linhas.Add("- [ ] Relatorios/exportacoes foram usados pelo cliente.")
$linhas.Add("- [ ] Suporte nao possui P0/P1 bloqueante aberto.")
$linhas.Add("- [ ] Registro de riscos/pendencias foi revisado.")
$linhas.Add("- [ ] Integracoes reais foram homologadas, adiadas ou marcadas fora do escopo.")
$linhas.Add("- [ ] Cliente confirma que os usuarios-chave conseguem operar.")
$linhas.Add("- [ ] Melhorias futuras foram separadas de pendencias de implantacao.")
$linhas.Add("- [ ] Feedback/NPS coletado quando houver marco D7, D15, D30, release ou incidente relevante.")
$linhas.Add("")
$linhas.Add("DECISAO")
$linhas.Add($decisao)
$linhas.Add("Impacto comercial: $impactoComercial")
$linhas.Add("")
$linhas.Add("ACOES RECOMENDADAS")
foreach ($acao in $acoes) {
    $linhas.Add("- $acao")
}
$linhas.Add("")
$linhas.Add("OBSERVACOES")
$linhas.Add("- Pendencias bloqueantes:")
$linhas.Add("- Pendencias altas:")
$linhas.Add("- Modulos com baixa adocao:")
$linhas.Add("- Oportunidades de evolucao:")
$linhas.Add("- Risco de renovacao/cancelamento:")
$linhas.Add("- Ultimo NPS/feedback:")
$linhas.Add("")
$linhas.Add("PLANO DE SAUDE")
$linhas.Add("Problema | Causa provavel | Acao | Responsavel | Prazo | Evidencia de melhora")
$linhas.Add("--- | --- | --- | --- | --- | ---")
$linhas.Add("Baixo uso | Treinamento / fit / dados |  |  |  | ")
$linhas.Add("Pendencia alta | Produto / integracao / cliente |  |  |  | ")
$linhas.Add("Valor pouco claro | Expectativa / relatorio / processo |  |  |  | ")
$linhas.Add("")
$linhas.Add("REFERENCIAS")
$linhas.Add("- docs\ROTINA_SUCESSO_CLIENTE_POS_IMPLANTACAO_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_RENOVACAO_RETENCAO_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\PROCESSO_FEEDBACK_NPS_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\REGISTRO_RISCOS_PENDENCIAS_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\POLITICA_SLA_SUPORTE_NEXUS_ONE.md")
$linhas.Add("- docs\PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Relatorio de saude do cliente gerado: $arquivo"
