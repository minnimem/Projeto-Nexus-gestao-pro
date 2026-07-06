package br.com.diego.projectoads.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ComissaoConfigRequest {
    @NotNull(message = "Percentual padrao e obrigatorio")
    @DecimalMin(value = "0.00", message = "Percentual padrao nao pode ser negativo")
    @DecimalMax(value = "100.00", message = "Percentual padrao nao pode ser maior que 100")
    private BigDecimal percentualPadrao;
}
