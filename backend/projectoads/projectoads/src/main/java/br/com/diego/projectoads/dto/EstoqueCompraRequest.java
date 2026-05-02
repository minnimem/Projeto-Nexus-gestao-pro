package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class EstoqueCompraRequest {

    private UUID produtoId;
    private UUID fornecedorId;
    private Integer quantidade;
    private BigDecimal valorTotal;
    private MetodoPagamento metodoPagamento;
    private StatusPagamento status;
    private LocalDate dataVencimento;
    private String numeroDocumento;
    private String observacao;
}
