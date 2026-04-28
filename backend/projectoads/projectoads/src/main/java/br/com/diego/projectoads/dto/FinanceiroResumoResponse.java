package br.com.diego.projectoads.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class FinanceiroResumoResponse {
    private BigDecimal receitaTotal;
    private BigDecimal despesas;
    private BigDecimal lucro;
    private long pedidosPagos;
    private long lancamentos;
    private List<FinanceiroResponse> movimentacoes;
}
