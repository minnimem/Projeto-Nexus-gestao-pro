package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class FinanceiroResponse {
    private UUID id;
    private LocalDateTime dataLancamento;
    private String descricao;
    private TipoFinanceiro tipo;
    private String categoria;
    private BigDecimal valor;
    private MetodoPagamento metodoPagamento;
    private String metodoPagamentoDescricao;
    private StatusPagamento status;
    private UUID pedidoId;
    private UUID usuarioId;
    private String observacao;
}
