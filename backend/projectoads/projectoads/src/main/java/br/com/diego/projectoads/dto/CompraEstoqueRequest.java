package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
    @NotNull(message = "Metodo de pagamento e obrigatorio")
    private MetodoPagamento metodoPagamento;
    @NotNull(message = "Status de pagamento e obrigatorio")
    private StatusPagamento status;
    private LocalDate dataVencimento;
    private String numeroDocumento;
    private String observacao;
    @Valid
    @NotEmpty(message = "Informe ao menos um item da compra")
    private List<ItemRequest> itens;

    @Getter
    @Setter
    public static class ItemRequest {
        @NotNull(message = "Produto e obrigatorio")
        private UUID produtoId;
        @NotNull(message = "Quantidade e obrigatoria")
        @Positive(message = "Quantidade deve ser maior que zero")
        private Integer quantidade;
        @NotNull(message = "Preco unitario e obrigatorio")
        @DecimalMin(value = "0.00", inclusive = false, message = "Preco unitario deve ser maior que zero")
        private BigDecimal precoUnitario;
    }
}
