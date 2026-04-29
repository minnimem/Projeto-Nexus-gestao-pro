package br.com.diego.projectoads.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CaixaAberturaRequest {

    @NotNull(message = "Valor inicial e obrigatorio")
    @DecimalMin(value = "0.00", message = "Valor inicial nao pode ser negativo")
    private BigDecimal valorInicial;

    @Size(max = 1000, message = "Observacao nao pode ultrapassar 1000 caracteres")
    private String observacao;
}
