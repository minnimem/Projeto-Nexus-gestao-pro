param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Cnpj = "",

    [string]$Ambiente = "producao controlada",

    [string]$Classificacao = "Go producao controlada",

    [string]$ResponsavelCliente = "",

    [string]$ResponsavelNexus = "Nexus One",

    [string]$Modulos = "Vendas, caixa, estoque, financeiro, relatorios e suporte",

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
$arquivo = Join-Path $resolvedOutput "termo-aceite-implantacao-$slug-$timestamp.txt"

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("TERMO DE ACEITE DE IMPLANTACAO - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("CNPJ: $Cnpj")
$linhas.Add("Responsavel do cliente: $ResponsavelCliente")
$linhas.Add("Responsavel Nexus One: $ResponsavelNexus")
$linhas.Add("Ambiente: $Ambiente")
$linhas.Add("Modulos implantados: $Modulos")
$linhas.Add("Classificacao Go/No-Go: $Classificacao")
$linhas.Add("")
$linhas.Add("ESCOPO APROVADO")
$linhas.Add("-")
$linhas.Add("")
$linhas.Add("CLASSIFICACAO DA ENTREGA")
$linhas.Add("- [ ] Piloto assistido concluido")
$linhas.Add("- [ ] Producao controlada liberada")
$linhas.Add("- [ ] Producao comercial liberada")
$linhas.Add("- [ ] Operacao assistida prorrogada")
$linhas.Add("- [ ] Retorno para homologacao")
$linhas.Add("")
$linhas.Add("VALIDACOES REALIZADAS")
$linhas.Add("- [ ] Login e acesso por perfil")
$linhas.Add("- [ ] Cadastros base")
$linhas.Add("- [ ] Venda/orcamento/pedido")
$linhas.Add("- [ ] Caixa, recebimento e fechamento")
$linhas.Add("- [ ] Estoque, entrada, baixa e alerta")
$linhas.Add("- [ ] Financeiro, contas, conciliacao e relatorios")
$linhas.Add("- [ ] Fiscal conforme escopo contratado")
$linhas.Add("- [ ] Notificacoes conforme canal contratado")
$linhas.Add("- [ ] Backup gerado e localizado")
$linhas.Add("- [ ] Restauracao testada")
$linhas.Add("- [ ] Suporte e rotina operacional apresentados")
$linhas.Add("- [ ] Treinamento por perfil executado e evidenciado")
$linhas.Add("")
$linhas.Add("EVIDENCIAS REVISADAS")
$linhas.Add("- [ ] Proposta/escopo aprovado")
$linhas.Add("- [ ] Handoff comercial, implantacao e suporte")
$linhas.Add("- [ ] Diagnostico/coleta inicial")
$linhas.Add("- [ ] Cronograma de implantacao")
$linhas.Add("- [ ] Diario(s) do piloto ou operacao assistida")
$linhas.Add("- [ ] Matriz Go/No-Go")
$linhas.Add("- [ ] Registro de riscos e pendencias")
$linhas.Add("- [ ] Smoke test operacional")
$linhas.Add("- [ ] Backup/restauracao")
$linhas.Add("- [ ] Evidencias de integracoes quando aplicavel")
$linhas.Add("- [ ] Evidencia de treinamento")
$linhas.Add("")
$linhas.Add("RESULTADO")
$linhas.Add("- [ ] Aprovado para producao comercial")
$linhas.Add("- [ ] Aprovado com pendencias nao bloqueantes")
$linhas.Add("- [ ] Mantido em operacao assistida")
$linhas.Add("- [ ] Reprovado para producao, retorna para homologacao")
$linhas.Add("")
$linhas.Add("PENDENCIAS")
$linhas.Add("- Bloqueantes:")
$linhas.Add("- Nao bloqueantes:")
$linhas.Add("")
$linhas.Add("PENDENCIAS ACEITAS PELO CLIENTE")
$linhas.Add("Pendencia | Impacto | Contorno | Prazo | Responsavel")
$linhas.Add("--- | --- | --- | --- | ---")
$linhas.Add(" |  |  |  | ")
$linhas.Add("")
$linhas.Add("RESTRICOES E CONDICOES")
$linhas.Add("- Fiscal real somente conforme homologacao, certificado, contador, credenciamento e provedor/SEFAZ/municipio.")
$linhas.Add("- Pix/boleto real somente conforme homologacao ponta a ponta com provedor e conciliacao.")
$linhas.Add("- Notificacoes externas somente conforme canal/token/webhook validado.")
$linhas.Add("- Mudancas de escopo, customizacoes e integracoes nao previstas devem retornar para proposta, priorizacao ou novo aceite.")
$linhas.Add("")
$linhas.Add("PROXIMOS PASSOS")
$linhas.Add("- [ ] Encaminhar para rotina de sucesso do cliente")
$linhas.Add("- [ ] Agendar revisao de saude/NPS")
$linhas.Add("- [ ] Atualizar pacote de entrega")
$linhas.Add("- [ ] Abrir plano de pendencias nao bloqueantes")
$linhas.Add("- [ ] Prorrogar operacao assistida")
$linhas.Add("- [ ] Retornar para homologacao")
$linhas.Add("")
$linhas.Add("DECLARACAO")
$linhas.Add("O cliente declara que os fluxos implantados foram apresentados, testados e validados conforme o escopo contratado ou acordado para o piloto/implantacao.")
$linhas.Add("Quando a classificacao for producao controlada ou producao ampla, o cliente e o responsavel Nexus One confirmam que nao ha pendencia bloqueante aberta na matriz Go/No-Go.")
$linhas.Add("Pendencias nao bloqueantes listadas neste termo foram comunicadas, possuem contorno ou plano de acao e nao impedem o uso do escopo aprovado.")
$linhas.Add("")
$linhas.Add("ASSINATURAS")
$linhas.Add("- Responsavel do cliente:")
$linhas.Add("- Data:")
$linhas.Add("- Assinatura:")
$linhas.Add("")
$linhas.Add("- Responsavel Nexus One:")
$linhas.Add("- Data:")
$linhas.Add("- Assinatura:")
$linhas.Add("")
$linhas.Add("REFERENCIAS")
$linhas.Add("- docs\TERMO_ACEITE_IMPLANTACAO_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_GO_NO_GO_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\REGISTRO_RISCOS_PENDENCIAS_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Termo de aceite gerado: $arquivo"
