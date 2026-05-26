package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.ModuloPlano;
import br.com.diego.projectoads.model.Empresa;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

public class PlanoEmpresaResponse {
    public UUID empresaId;
    public String empresa;
    public String planoComercial;
    public String statusAssinatura;
    public Map<String, Integer> limites;
    public Map<String, Boolean> modulos;
    public BigDecimal valorMensalPlano;
    public Integer diaVencimentoPlano;
    public LocalDate ultimoPagamentoPlano;

    public PlanoEmpresaResponse(Empresa empresa, Map<ModuloPlano, Boolean> modulos) {
        this.empresaId = empresa.getId();
        this.empresa = empresa.getNome();
        this.planoComercial = empresa.getPlanoComercial().name();
        this.statusAssinatura = empresa.getStatusAssinatura().name();
        this.valorMensalPlano = empresa.getValorMensalPlano();
        this.diaVencimentoPlano = empresa.getDiaVencimentoPlano();
        this.ultimoPagamentoPlano = empresa.getUltimoPagamentoPlano();
        this.limites = Map.of(
                "usuarios", empresa.getLimiteUsuarios(),
                "filiais", empresa.getLimiteFiliais(),
                "caixas", empresa.getLimiteCaixas(),
                "produtos", empresa.getLimiteProdutos()
        );
        this.modulos = Map.ofEntries(
                Map.entry("vendas", modulos.getOrDefault(ModuloPlano.VENDAS, false)),
                Map.entry("caixa", modulos.getOrDefault(ModuloPlano.CAIXA, false)),
                Map.entry("clientes", modulos.getOrDefault(ModuloPlano.CLIENTES, false)),
                Map.entry("produtos", modulos.getOrDefault(ModuloPlano.PRODUTOS, false)),
                Map.entry("estoque", modulos.getOrDefault(ModuloPlano.ESTOQUE, false)),
                Map.entry("financeiro", modulos.getOrDefault(ModuloPlano.FINANCEIRO, false)),
                Map.entry("relatorios", modulos.getOrDefault(ModuloPlano.RELATORIOS, false)),
                Map.entry("usuarios", modulos.getOrDefault(ModuloPlano.USUARIOS, false)),
                Map.entry("logistica", modulos.getOrDefault(ModuloPlano.LOGISTICA, false)),
                Map.entry("servicos", modulos.getOrDefault(ModuloPlano.SERVICOS, false)),
                Map.entry("fiscal", modulos.getOrDefault(ModuloPlano.FISCAL, false)),
                Map.entry("pagamentos", modulos.getOrDefault(ModuloPlano.PAGAMENTOS, false)),
                Map.entry("notificacoes", modulos.getOrDefault(ModuloPlano.NOTIFICACOES, false)),
                Map.entry("auditoria", modulos.getOrDefault(ModuloPlano.AUDITORIA, false))
        );
    }
}
