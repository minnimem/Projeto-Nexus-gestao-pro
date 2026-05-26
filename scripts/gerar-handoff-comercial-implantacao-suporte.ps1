param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Plano = "Medio",

    [string]$Ambiente = "piloto assistido",

    [string]$ResponsavelComercial = "Comercial",

    [string]$ResponsavelImplantacao = "Implantacao",

    [string]$ResponsavelSuporte = "Suporte",

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
$arquivo = Join-Path $resolvedOutput "handoff-comercial-implantacao-suporte-$slug-$timestamp.txt"

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("HANDOFF COMERCIAL, IMPLANTACAO E SUPORTE - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Plano: $Plano")
$linhas.Add("Ambiente: $Ambiente")
$linhas.Add("Responsavel comercial: $ResponsavelComercial")
$linhas.Add("Responsavel implantacao: $ResponsavelImplantacao")
$linhas.Add("Responsavel suporte: $ResponsavelSuporte")
$linhas.Add("")
$linhas.Add("1. COMERCIAL ENTREGA PARA IMPLANTACAO")
$linhas.Add("- [ ] Proposta/contrato/aceite comercial")
$linhas.Add("- [ ] Faturamento, vencimento e forma de pagamento registrados quando aplicavel")
$linhas.Add("- [ ] Escopo do plano comercial")
$linhas.Add("- [ ] Limites de usuarios, filiais, caixas e modulos")
$linhas.Add("- [ ] Adicionais vendidos separadamente")
$linhas.Add("- [ ] Itens fora do escopo comunicados")
$linhas.Add("- [ ] Plano de demonstracao/prova de valor")
$linhas.Add("- [ ] Ficha de diagnostico/coleta inicial")
$linhas.Add("- [ ] Riscos comerciais e promessas feitas ao cliente")
$linhas.Add("")
$linhas.Add("2. MAPA DE PROMESSAS COMERCIAIS")
$linhas.Add("- Modulos incluidos: incluso / opcional / fase 2 | status: validado / pendente")
$linhas.Add("- Fiscal real: incluso / condicionado / fora do escopo | status: validado / pendente")
$linhas.Add("- Pix/boleto real: incluso / condicionado / fora do escopo | status: validado / pendente")
$linhas.Add("- Notificacoes externas: incluso / condicionado / fora do escopo | status: validado / pendente")
$linhas.Add("- Carga de dados: incluso / adicional / fase 2 | status: validado / pendente")
$linhas.Add("- Treinamento: incluso / adicional / fase 2 | status: validado / pendente")
$linhas.Add("- Suporte/SLA: incluso / especial / fora do padrao | status: validado / pendente")
$linhas.Add("- Customizacao: incluso / adicional / backlog | status: validado / pendente")
$linhas.Add("")
$linhas.Add("3. DEPENDENCIAS DO CLIENTE")
$linhas.Add("- [ ] Responsavel operacional disponivel")
$linhas.Add("- [ ] Usuarios-chave indicados")
$linhas.Add("- [ ] Dados para carga inicial entregues ou prazo definido")
$linhas.Add("- [ ] Responsavel LGPD definido para dados reais")
$linhas.Add("- [ ] Contador/fiscal disponivel quando houver fiscal no escopo")
$linhas.Add("- [ ] Conta/provedor de pagamento definido quando houver Pix/boleto real")
$linhas.Add("- [ ] Canal/token/webhook definido quando houver notificacao externa")
$linhas.Add("- [ ] Janela de treinamento e operacao assistida alinhada")
$linhas.Add("")
$linhas.Add("4. IMPLANTACAO RECEBE E CONFERE")
$linhas.Add("- [ ] Modulos contratados conferidos")
$linhas.Add("- [ ] Responsaveis do cliente definidos")
$linhas.Add("- [ ] Usuarios-chave identificados")
$linhas.Add("- [ ] Dados para carga inicial solicitados")
$linhas.Add("- [ ] Integracoes externas classificadas")
$linhas.Add("- [ ] Ambiente pretendido definido")
$linhas.Add("- [ ] Janela de implantacao alinhada")
$linhas.Add("- [ ] Registro de riscos/pendencias aberto")
$linhas.Add("")
$linhas.Add("5. IMPLANTACAO ENTREGA PARA SUPORTE")
$linhas.Add("- [ ] Plano contratado e SLA aplicavel")
$linhas.Add("- [ ] Canais de suporte do cliente")
$linhas.Add("- [ ] Usuarios-chave e contatos de emergencia")
$linhas.Add("- [ ] Modulos em operacao")
$linhas.Add("- [ ] Integracoes reais no escopo")
$linhas.Add("- [ ] Pendencias nao bloqueantes aceitas")
$linhas.Add("- [ ] Riscos altos ainda abertos")
$linhas.Add("- [ ] Rotina de backup/monitoramento definida")
$linhas.Add("- [ ] Data de inicio da operacao assistida")
$linhas.Add("")
$linhas.Add("6. SUPORTE CONFERE ANTES DA OPERACAO")
$linhas.Add("- [ ] Politica de SLA comunicada")
$linhas.Add("- [ ] Canal de acionamento testado")
$linhas.Add("- [ ] Responsavel de suporte definido")
$linhas.Add("- [ ] Ficha de incidente disponivel")
$linhas.Add("- [ ] Procedimento de escalonamento conhecido")
$linhas.Add("- [ ] Acesso a evidencias do pacote de entrega")
$linhas.Add("- [ ] Registro de riscos/pendencias acessivel")
$linhas.Add("- [ ] Go/No-Go e aceite arquivados quando aplicavel")
$linhas.Add("")
$linhas.Add("7. RISCOS ACEITOS PARA INICIAR")
$linhas.Add("- Risco:")
$linhas.Add("- Severidade: baixa / media / alta")
$linhas.Add("- Contorno operacional:")
$linhas.Add("- Responsavel:")
$linhas.Add("- Prazo:")
$linhas.Add("")
$linhas.Add("8. BLOQUEIOS")
$linhas.Add("- [ ] Escopo comercial indefinido")
$linhas.Add("- [ ] Plano sem limites de usuarios, filiais, caixas ou modulos")
$linhas.Add("- [ ] Integracao real prometida sem homologacao")
$linhas.Add("- [ ] Dados reais sem responsavel LGPD")
$linhas.Add("- [ ] Responsavel operacional do cliente indefinido")
$linhas.Add("- [ ] Suporte/SLA sem canal ou responsavel")
$linhas.Add("- [ ] Pendencia bloqueante sem plano de acao")
$linhas.Add("- [ ] Promessa comercial nao documentada")
$linhas.Add("- [ ] Dependencia critica do cliente sem responsavel ou prazo")
$linhas.Add("")
$linhas.Add("9. SAIDAS OBRIGATORIAS")
$linhas.Add("- [ ] Implantacao sabe exatamente o que entregar primeiro")
$linhas.Add("- [ ] Suporte sabe plano, SLA, canal, criticidade e contatos")
$linhas.Add("- [ ] Cliente sabe dependencias, limites e proximos passos")
$linhas.Add("- [ ] Registro de riscos/pendencias foi aberto ou atualizado")
$linhas.Add("- [ ] Cronograma de implantacao pode ser gerado")
$linhas.Add("")
$linhas.Add("10. DECISAO")
$linhas.Add("- [ ] Aprovado para homologacao")
$linhas.Add("- [ ] Aprovado para piloto assistido")
$linhas.Add("- [ ] Aprovado para producao controlada")
$linhas.Add("- [ ] Reprovado, retorna para comercial/cliente completar informacoes")
$linhas.Add("")
$linhas.Add("REFERENCIAS")
$linhas.Add("- docs\CHECKLIST_HANDOFF_COMERCIAL_IMPLANTACAO_SUPORTE_NEXUS_ONE.md")
$linhas.Add("- docs\FICHA_DIAGNOSTICO_COLETA_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\MATRIZ_PLANOS_COMERCIAIS_NEXUS_ONE.md")
$linhas.Add("- docs\REGISTRO_RISCOS_PENDENCIAS_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\PACOTE_ENTREGA_CLIENTE_NEXUS_ONE.md")
$linhas.Add("- docs\POLITICA_SLA_SUPORTE_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Handoff comercial/implantacao/suporte gerado: $arquivo"
