package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class RecorrenciaFinanceiraRequest {

    @NotBlank(message = "Descricao e obrigatoria")
    @Size(max = 255, message = "Descricao nao pode ultrapassar 255 caracteres")
    private String descricao;

    @NotNull(message = "Tipo financeiro e obrigatorio")
    private TipoFinanceiro tipo;

    @Size(max = 100, message = "Categoria nao pode ultrapassar 100 caracteres")
    private String categoria;

    @NotNull(message = "Valor e obrigatorio")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
    private BigDecimal valor;

    @NotNull(message = "Metodo de pagamento e obrigatorio")
    private MetodoPagamento metodoPagamento;

    private StatusPagamento statusLancamento;

    @NotNull(message = "Data inicial e obrigatoria")
    private LocalDate dataInicio;

    @Min(value = 1, message = "Intervalo minimo e 1 mes")
    @Max(value = 12, message = "Intervalo maximo e 12 meses")
    private Integer intervaloMeses = 1;

    @Min(value = 1, message = "Total de geracoes deve ser maior que zero")
    private Integer totalGeracoes;

    private Boolean gerarPrimeiroLancamento = true;

    private UUID usuarioId;

    private UUID filialId;

    @Size(max = 1000, message = "Observacao nao pode ultrapassar 1000 caracteres")
    private String observacao;
}
