param(
    [string]$InputDir = "templates\carga-inicial",
    [string]$OutputDir = "reports"
)

$ErrorActionPreference = "Stop"

$expectedHeaders = @{
    "clientes.csv" = @("nome", "documento", "email", "telefone", "endereco", "cidade", "uf", "cep", "observacao")
    "produtos.csv" = @("codigo", "nome", "categoria", "preco", "custo", "estoqueInicial", "estoqueMinimo", "unidade", "ncm", "cfop", "observacao")
    "usuarios.csv" = @("nome", "login", "email", "perfil", "filial", "cargo", "ativo", "observacao")
    "estoque-inicial.csv" = @("codigoProduto", "localizacao", "quantidade", "custoUnitario", "observacao")
}

if (-not (Test-Path -LiteralPath $InputDir)) {
    Write-Error "Diretorio de carga inicial nao encontrado: $InputDir"
    exit 1
}

if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $OutputDir "verificacao-carga-inicial-$timestamp.txt"
$lines = New-Object System.Collections.Generic.List[string]
$errors = New-Object System.Collections.Generic.List[string]

$lines.Add("VERIFICACAO DE CARGA INICIAL - NEXUS ONE")
$lines.Add("Data: " + (Get-Date -Format "dd/MM/yyyy HH:mm:ss"))
$lines.Add("Diretorio: $InputDir")
$lines.Add("")

foreach ($fileName in $expectedHeaders.Keys) {
    $path = Join-Path $InputDir $fileName
    if (-not (Test-Path -LiteralPath $path)) {
        $errors.Add("Arquivo ausente: $fileName")
        $lines.Add("FALHA | $fileName | arquivo ausente")
        continue
    }

    $rows = @(Import-Csv -LiteralPath $path)
    $headerLine = (Get-Content -LiteralPath $path -TotalCount 1)
    $headers = $headerLine.Split(",") | ForEach-Object { $_.Trim() }
    $expected = $expectedHeaders[$fileName]
    $missing = $expected | Where-Object { $_ -notin $headers }
    $extra = $headers | Where-Object { $_ -notin $expected }

    if ($missing.Count -gt 0) {
        $errors.Add("$fileName sem colunas obrigatorias: $($missing -join ', ')")
    }

    $status = if ($missing.Count -eq 0) { "OK" } else { "FALHA" }
    $detail = "linhas=$($rows.Count); faltando=$($missing -join ', '); extras=$($extra -join ', ')"
    $lines.Add("$status | $fileName | $detail")
}

$lines.Add("")
$lines.Add("Regras:")
$lines.Add("- Conferir dados em homologacao antes de usar em producao.")
$lines.Add("- Nao importar dados fiscais sem validacao do contador.")
$lines.Add("- Gerar backup antes de qualquer carga em producao.")
$lines.Add("- Arquivar esta verificacao junto ao aceite de implantacao.")

Set-Content -LiteralPath $reportFile -Value $lines
Write-Host "Relatorio gerado em $reportFile"

if ($errors.Count -gt 0) {
    Write-Host "Falhas encontradas:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

Write-Host "Carga inicial verificada com sucesso."
