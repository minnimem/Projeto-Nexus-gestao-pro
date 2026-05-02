package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CompraEstoqueRequest {

    private UUID fornecedorId;
    private MetodoPagamento metodoPagamento;
    private StatusPagamento status;
    private LocalDate dataVencimento;
    private String numeroDocumento;
    private String observacao;
    private List<ItemRequest> itens;

    @Getter
    @Setter
    public static class ItemRequest {
        private UUID produtoId;
        private Integer quantidade;
        private BigDecimal precoUnitario;
    }
}
