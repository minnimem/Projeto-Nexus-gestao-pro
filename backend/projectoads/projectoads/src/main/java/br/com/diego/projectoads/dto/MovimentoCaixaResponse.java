package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.TipoMovimentoCaixa;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class MovimentoCaixaResponse {
    private UUID id;
    private TipoMovimentoCaixa tipo;
    private LocalDateTime dataMovimento;
    private BigDecimal valor;
    private MetodoPagamento metodoPagamento;
    private Integer parcelas;
    private UUID pedidoId;
    private UUID usuarioId;
    private String usuarioNome;
    private String descricao;
    private String observacao;
}
