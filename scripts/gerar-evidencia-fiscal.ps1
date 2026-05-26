param(
    [string]$OutputDir = "docs",
    [string]$Cliente = "Cliente piloto",
    [string]$Filial = "Matriz",
    [string]$Modelo = "NFE",
    [string]$Ambiente = "Homologacao",
    [string]$Provedor = "Mock local"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$safeCliente = ($Cliente -replace '[^a-zA-Z0-9_-]', '-').ToLowerInvariant()
$safeModelo = ($Modelo -replace '[^a-zA-Z0-9_-]', '-').ToLowerInvariant()
$output = Join-Path $OutputDir "evidencia-fiscal-$safeCliente-$safeModelo.md"

$content = @"
# Evidencia Fiscal - $Cliente

- Cliente: $Cliente
- Filial: $Filial
- Modelo fiscal: $Modelo
- Ambiente: $Ambiente
- Provedor: $Provedor
- Data: $date

## Checklist

| Teste | Resultado | Evidencia | Observacao |
| --- | --- | --- | --- |
| Configuracao fiscal sem pendencias | Pendente |  |  |
| Pedido preparado para homologacao | Pendente |  |  |
| XML gerado | Pendente |  |  |
| XML validado | Pendente |  |  |
| Transmissao homologada | Pendente |  |  |
| Retorno autorizado registrado | Pendente |  |  |
| Retorno rejeitado tratado | Pendente |  |  |
| Documento auxiliar gerado | Pendente |  |  |
| Auditoria fiscal registrada | Pendente |  |  |
| Contador aprovou emissao real | Pendente |  |  |

## Observacoes

-

## Decisao

- [ ] Aprovado para producao restrita
- [ ] Aprovado apenas para homologacao
- [ ] Reprovado
"@

Set-Content -LiteralPath $output -Value $content -Encoding UTF8
Write-Host "Evidencia criada em $output"
