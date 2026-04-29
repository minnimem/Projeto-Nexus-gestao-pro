package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CaixaMovimentoRequest {

    @NotNull(message = "Valor e obrigatorio")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
    private BigDecimal valor;

    private MetodoPagamento metodoPagamento;

    private Integer parcelas = 1;

    @Size(max = 255, message = "Descricao nao pode ultrapassar 255 caracteres")
    private String descricao;

    @Size(max = 1000, message = "Observacao nao pode ultrapassar 1000 caracteres")
    private String observacao;
}
