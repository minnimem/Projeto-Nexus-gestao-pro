package br.com.diego.projectoads.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class OrdemServicoPecaRequest {

    @NotNull(message = "Produto da peca obrigatorio.")
    private UUID produtoId;

    @Min(value = 1, message = "Quantidade da peca deve ser maior que zero.")
    private Integer quantidade;

    @DecimalMin(value = "0.00", message = "Custo unitario da peca nao pode ser negativo.")
    private BigDecimal custoUnitario;

    @DecimalMin(value = "0.00", message = "Valor unitario da peca nao pode ser negativo.")
    private BigDecimal valorUnitario;
}
