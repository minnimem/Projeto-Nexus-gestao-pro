param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [ValidateSet("Basico", "Medio", "Avancado", "Starter", "Business", "Enterprise")]
    [string]$Plano = "Business",

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
$planoNormalizado = switch ($Plano) {
    "Starter" { "Basico" }
    "Business" { "Medio" }
    "Enterprise" { "Avancado" }
    default { $Plano }
}

$nomeComercial = switch ($planoNormalizado) {
    "Basico" { "Starter" }
    "Medio" { "Business" }
    "Avancado" { "Enterprise" }
}

$arquivo = Join-Path $resolvedOutput "escopo-plano-$($nomeComercial.ToLowerInvariant())-$slug-$timestamp.txt"

$planos = @{
    Basico = @{
        Mensalidade = "R$ 179,00"
        Implantacao = "R$ 300,00 a R$ 600,00"
        Codigo = "STARTER"
        Limites = @("1 empresa", "1 filial", "1 caixa/PDV", "Ate 3 usuarios", "Ate 500 produtos sugeridos", "Fiscal real como adicional ou limite controlado")
        Inclui = @("Vendas e pedidos", "Caixa basico", "Clientes", "Produtos", "Estoque simples", "Financeiro basico", "Relatorios basicos", "Perfis simples")
        Fora = @("Multiplas filiais", "Logistica completa", "Fiscal real ilimitado", "Integracoes externas reais", "Relatorios avancados", "Auditoria detalhada")
        Adicionais = @("Usuario extra", "Caixa extra", "Filial extra exige upgrade", "Pacote fiscal", "Importacao de dados complexa", "Backup premium")
    }
    Medio = @{
        Mensalidade = "R$ 349,00"
        Implantacao = "R$ 800,00 a R$ 1.500,00"
        Codigo = "BUSINESS"
        Limites = @("1 empresa", "Ate 3 filiais", "Ate 3 caixas/PDV", "Ate 8 usuarios", "Ate 5.000 produtos sugeridos", "Fiscal real conforme homologacao e limite contratado")
        Inclui = @("Todos os recursos do Basico", "PDV completo", "Orcamentos/propostas", "CRM/follow-up", "Estoque com compras e fornecedores", "Financeiro gerencial", "DRE/fluxo/conciliacao", "Separacao", "Entrega basica", "Relatorios gerenciais", "Suporte prioritario em horario comercial")
        Fora = @("Multiempresa completa", "Logistica avancada ilimitada", "Relatorios customizados sob demanda", "Suporte fora do horario comercial", "Integracoes reais sem homologacao")
        Adicionais = @("Usuario extra", "Caixa extra", "Filial extra", "Integracao WhatsApp/API", "Pacote fiscal adicional", "Relatorio customizado", "Treinamento extra")
    }
    Avancado = @{
        Mensalidade = "R$ 699,00"
        Implantacao = "R$ 2.000,00 a R$ 5.000,00"
        Codigo = "ENTERPRISE"
        Limites = @("Multiempresa/filiais conforme contrato", "Usuarios ampliados", "Caixas ampliados", "Produtos conforme contrato", "Fiscal conforme contrato e homologacao", "Escopo operacional definido em proposta")
        Inclui = @("Todos os recursos do Medio", "Logistica completa conforme escopo", "Servicos/OS se contratado", "Relatorios avancados", "Auditoria/governanca ampliada", "Implantacao acompanhada", "Operacao assistida com evidencias")
        Fora = @("Fiscal real sem homologacao oficial", "Pix/boleto sem provedor do cliente", "Notificacoes sem canal real", "Customizacoes fora de proposta")
        Adicionais = @("SLA especial", "Customizacao", "Integracao externa avancada", "Treinamento por unidade", "Operacao assistida ampliada", "Relatorios sob demanda")
    }
}

$dados = $planos[$planoNormalizado]

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("ESCOPO DE PLANO COMERCIAL - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Plano comercial: $nomeComercial")
$linhas.Add("Plano tecnico: $planoNormalizado")
$linhas.Add("Codigo de liberacao sugerido: $($dados.Codigo)")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("VALORES SUGERIDOS")
$linhas.Add("- Mensalidade: $($dados.Mensalidade)")
$linhas.Add("- Implantacao: $($dados.Implantacao)")
$linhas.Add("")
$linhas.Add("LIMITES DO PLANO")
foreach ($item in $dados.Limites) {
    $linhas.Add("- $item")
}
$linhas.Add("")
$linhas.Add("COMO A LIBERACAO DEVE FUNCIONAR")
$linhas.Add("- O plano contratado libera direito comercial de uso.")
$linhas.Add("- Recursos reais como fiscal, Pix, boleto, notificacoes e integracoes dependem de homologacao.")
$linhas.Add("- Upgrade libera novos limites apos aceite comercial e revisao de implantacao.")
$linhas.Add("- Downgrade mantem historico, mas bloqueia novos cadastros acima do limite contratado.")
$linhas.Add("- Dados existentes nao devem ser apagados sem aceite formal do cliente.")
$linhas.Add("")
$linhas.Add("RECURSOS INCLUIDOS")
foreach ($item in $dados.Inclui) {
    $linhas.Add("- $item")
}
$linhas.Add("")
$linhas.Add("FORA DO ESCOPO INICIAL")
foreach ($item in $dados.Fora) {
    $linhas.Add("- $item")
}
$linhas.Add("")
$linhas.Add("ADICIONAIS POSSIVEIS")
foreach ($item in $dados.Adicionais) {
    $linhas.Add("- $item")
}
$linhas.Add("")
$linhas.Add("ADICIONAIS QUE DEVEM SER CONTRATADOS OU HOMOLOGADOS")
$linhas.Add("- Homologacao fiscal real por cliente/filial/modelo.")
$linhas.Add("- Pix/boleto real com provedor do cliente.")
$linhas.Add("- Notificacoes externas em canal real.")
$linhas.Add("- Carga de dados complexa.")
$linhas.Add("- Relatorios customizados.")
$linhas.Add("- Suporte fora do horario comercial.")
$linhas.Add("")
$linhas.Add("CONDICOES PARA PRODUCAO CONTROLADA")
$linhas.Add("- Deploy definitivo validado.")
$linhas.Add("- Banco provisionado.")
$linhas.Add("- Backup e restauracao testados.")
$linhas.Add("- Monitoramento ativo.")
$linhas.Add("- Smoke test aprovado.")
$linhas.Add("- Go/No-Go sem pendencia bloqueante.")
$linhas.Add("- Termo de aceite assinado.")
$linhas.Add("")
$linhas.Add("REFERENCIAS")
$linhas.Add("- docs\MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md")
$linhas.Add("- docs\MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\POLITICA_SLA_SUPORTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Escopo do plano comercial gerado: $arquivo"
