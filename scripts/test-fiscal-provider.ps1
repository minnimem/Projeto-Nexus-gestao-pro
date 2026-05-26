param(
    [string]$BaseUrl = "http://localhost:8098/fiscal/homologacao",

    [string]$Token = $env:MOCK_FISCAL_TOKEN,

    [string]$Modelo = "NFE",

    [string]$Ambiente = "HOMOLOGACAO",

    [string]$Serie = "1",

    [long]$Numero = 10,

    [string]$StatusEsperado = "AUTORIZADO"
)

$headers = @{
    "Content-Type" = "application/json"
}

if (-not [string]::IsNullOrWhiteSpace($Token)) {
    $headers["Authorization"] = "Bearer $Token"
}

try {
    $statusResponse = Invoke-WebRequest `
        -UseBasicParsing `
        -Method HEAD `
        -Uri $BaseUrl `
        -Headers $headers

    Write-Host "Status fiscal disponivel."
    Write-Host "HEAD HTTP: $($statusResponse.StatusCode)"
} catch {
    Write-Error "Falha ao consultar status do provedor fiscal em $BaseUrl"
    Write-Error $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Error "HTTP: $($_.Exception.Response.StatusCode.value__)"
    }
    exit 1
}

$body = @{
    documentoId = "00000000-0000-0000-0000-000000000010"
    pedidoId = "00000000-0000-0000-0000-000000000020"
    modelo = $Modelo
    ambiente = $Ambiente
    serie = $Serie
    numero = $Numero
    empresaId = "00000000-0000-0000-0000-000000000030"
    provedor = "MOCK"
    xmlEnvio = "<NFeHomologacao><Serie>$Serie</Serie><Numero>$Numero</Numero></NFeHomologacao>"
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod `
        -Method POST `
        -Uri $BaseUrl `
        -Headers $headers `
        -Body $body

    $statusRetornado = $response.status
    $autorizado = $response.autorizado
    $chave = $response.chaveAcesso
    $protocolo = $response.protocolo
    $mensagem = $response.mensagem

    if ($response.nfeProc -and -not ($response.nfeProc -is [string])) {
        $cStat = [string]$response.nfeProc.protNFe.infProt.cStat
        $statusRetornado = if ($cStat -eq "100") { "AUTORIZADO" } else { "REJEITADO" }
        $autorizado = $cStat -eq "100"
        $chave = [string]$response.nfeProc.protNFe.infProt.chNFe
        $protocolo = [string]$response.nfeProc.protNFe.infProt.nProt
        $mensagem = [string]$response.nfeProc.protNFe.infProt.xMotivo
    } elseif ($response.PSObject.Properties.Name -contains "cStat") {
        $cStat = [string]$response.PSObject.Properties["cStat"].Value
        $statusRetornado = if ($cStat -eq "100") { "AUTORIZADO" } else { "REJEITADO" }
        $autorizado = $cStat -eq "100"
        $chave = $response.PSObject.Properties["chNFe"].Value
        $protocolo = $response.PSObject.Properties["nProt"].Value
        $mensagem = $response.PSObject.Properties["xMotivo"].Value
    }

    Write-Host "Transmissao fiscal enviada com sucesso."
    Write-Host "URL: $BaseUrl"
    Write-Host "Status retornado: $statusRetornado"
    Write-Host "Autorizado: $autorizado"
    Write-Host "Chave: $chave"
    Write-Host "Protocolo: $protocolo"
    Write-Host "Mensagem: $mensagem"

    if ($statusRetornado -ne $StatusEsperado) {
        Write-Error "Status retornado diferente do esperado. Esperado: $StatusEsperado | Recebido: $statusRetornado"
        exit 1
    }
} catch {
    Write-Error "Falha ao transmitir XML para o provedor fiscal em $BaseUrl"
    Write-Error $_.Exception.Message
    if ($_.Exception.Response) {
        Write-Error "HTTP: $($_.Exception.Response.StatusCode.value__)"
    }
    exit 1
}
