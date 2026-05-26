param(
    [Parameter(Mandatory = $true)]
    [string]$Cliente,

    [string]$Segmento = "comercio varejista",

    [string]$DorPrincipal = "Controle de vendas, caixa, estoque e financeiro",

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
$arquivo = Join-Path $resolvedOutput "plano-demo-comercial-$slug-$timestamp.txt"

$segmentoNormalizado = $Segmento.ToLowerInvariant()

switch -Regex ($segmentoNormalizado) {
    "distrib|atacad" {
        $modulosPrioritarios = @("Vendas com separacao", "Estoque e curva ABC", "Logistica e romaneio", "Financeiro e inadimplencia", "Relatorios por vendedor/cliente/produto")
        $fluxoPrincipal = "pedido -> separacao -> entrega -> financeiro -> relatorio"
        break
    }
    "serv" {
        $modulosPrioritarios = @("Ordem de servico", "Clientes/CRM", "Financeiro e cobranca", "Relatorios operacionais", "Suporte/SLA")
        $fluxoPrincipal = "cliente -> ordem de servico -> cobranca -> acompanhamento -> relatorio"
        break
    }
    "filial|rede|multi" {
        $modulosPrioritarios = @("Multiempresa/filial", "Permissoes por perfil", "Auditoria", "Relatorios por filial", "Implantacao e treinamento")
        $fluxoPrincipal = "filial -> usuario/perfil -> venda/caixa -> relatorio consolidado -> governanca"
        break
    }
    default {
        $modulosPrioritarios = @("Caixa/PDV", "Vendas", "Estoque e reposicao", "Financeiro/conciliacao", "Relatorios e alertas")
        $fluxoPrincipal = "venda -> recebimento no caixa -> baixa de estoque -> financeiro -> relatorio"
        break
    }
}

$linhas = New-Object System.Collections.Generic.List[string]
$linhas.Add("PLANO DE DEMONSTRACAO COMERCIAL - NEXUS ONE")
$linhas.Add("Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')")
$linhas.Add("Cliente: $Cliente")
$linhas.Add("Segmento: $Segmento")
$linhas.Add("Responsavel: $Responsavel")
$linhas.Add("")
$linhas.Add("DOR PRINCIPAL")
$linhas.Add($DorPrincipal)
$linhas.Add("")
$linhas.Add("OBJETIVO DA DEMO")
$linhas.Add("- Demonstrar valor pratico sem prometer producao ampla antes das homologacoes reais.")
$linhas.Add("- Validar aderencia para piloto assistido ou proposta controlada.")
$linhas.Add("- Registrar dependencias externas e proximos passos.")
$linhas.Add("")
$linhas.Add("MODULOS PRIORITARIOS")
foreach ($modulo in $modulosPrioritarios) {
    $linhas.Add("- $modulo")
}
$linhas.Add("")
$linhas.Add("FLUXO PRINCIPAL A DEMONSTRAR")
$linhas.Add($fluxoPrincipal)
$linhas.Add("")
$linhas.Add("AGENDA SUGERIDA")
$linhas.Add("0-5 min: abertura, dor principal, decisor e objetivo da reuniao.")
$linhas.Add("5-12 min: diagnostico rapido do processo atual.")
$linhas.Add("12-30 min: fluxo principal do segmento.")
$linhas.Add("30-40 min: indicadores, alertas, relatorios e exportacoes.")
$linhas.Add("40-45 min: dependencias de fiscal, pagamento, notificacoes, dados e infraestrutura.")
$linhas.Add("45-50 min: definicao do proximo passo.")
$linhas.Add("")
$linhas.Add("PERGUNTAS DE QUALIFICACAO")
$linhas.Add("- Como o cliente faz esse fluxo hoje?")
$linhas.Add("- Onde ha retrabalho, perda financeira ou falta de visibilidade?")
$linhas.Add("- Quais usuarios precisam operar no primeiro piloto?")
$linhas.Add("- Quais integracoes sao obrigatorias para fechar negocio?")
$linhas.Add("- Quais relatorios o dono/gerente precisa enxergar toda semana?")
$linhas.Add("")
$linhas.Add("SINAIS DE COMPRA A OBSERVAR")
$linhas.Add("- Pergunta preco, prazo ou implantacao.")
$linhas.Add("- Pede para envolver socio, gerente, financeiro ou contador.")
$linhas.Add("- Compara com sistema atual ou concorrente.")
$linhas.Add("- Pergunta como importar dados reais.")
$linhas.Add("- Pede proposta, piloto ou ambiente para testar.")
$linhas.Add("")
$linhas.Add("RISCOS A REGISTRAR")
$linhas.Add("- Fiscal real ou integracao real imediata sem homologacao.")
$linhas.Add("- Nao aceita piloto assistido/producao controlada.")
$linhas.Add("- Decisor ausente.")
$linhas.Add("- Foco exclusivo em menor preco.")
$linhas.Add("- Customizacao grande antes de validar o produto base.")
$linhas.Add("")
$linhas.Add("RESTRICOES A COMUNICAR")
$linhas.Add("- Fiscal real depende de certificado, contador, credenciamento e homologacao oficial.")
$linhas.Add("- Pix, boleto e notificacoes reais dependem do provedor/canal do cliente.")
$linhas.Add("- Producao controlada exige deploy, backup, monitoramento, smoke test, Go/No-Go e aceite.")
$linhas.Add("- Dados reais exigem politica LGPD e carga inicial validada.")
$linhas.Add("")
$linhas.Add("CRITERIOS DE SUCESSO")
$linhas.Add("- Cliente reconheceu a dor principal no fluxo demonstrado.")
$linhas.Add("- Escopo do piloto ficou claro.")
$linhas.Add("- Dependencias externas foram registradas.")
$linhas.Add("- Proximo passo foi decidido.")
$linhas.Add("")
$linhas.Add("PERGUNTA DE FECHAMENTO")
$linhas.Add("- Pelo que vimos, faz sentido avancar para proposta controlada, diagnostico ou piloto assistido?")
$linhas.Add("")
$linhas.Add("PROXIMO PASSO")
$linhas.Add("- [ ] Gerar proposta controlada.")
$linhas.Add("- [ ] Agendar piloto assistido.")
$linhas.Add("- [ ] Agendar homologacao tecnica.")
$linhas.Add("- [ ] Solicitar dados para carga inicial.")
$linhas.Add("- [ ] Encerrar oportunidade por falta de aderencia.")
$linhas.Add("")
$linhas.Add("REFERENCIAS")
$linhas.Add("- docs\ROTEIRO_DEMONSTRACAO_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\FICHA_PRONTIDAO_COMERCIAL_NEXUS_ONE.md")
$linhas.Add("- docs\MODELO_PROPOSTA_COMERCIAL_CONTROLADA_NEXUS_ONE.md")
$linhas.Add("- docs\CHECKLIST_CLIENTE_PILOTO_NEXUS_ONE.md")

$linhas | Set-Content -LiteralPath $arquivo -Encoding UTF8

Write-Host "Plano de demonstracao comercial gerado: $arquivo"
