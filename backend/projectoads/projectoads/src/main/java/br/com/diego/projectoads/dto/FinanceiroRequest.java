package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class FinanceiroRequest {

    private LocalDateTime dataLancamento;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 255, message = "Descrição não pode ultrapassar 255 caracteres")
    private String descricao;

    @NotNull(message = "Tipo financeiro é obrigatório")
    private TipoFinanceiro tipo;

    @Size(max = 100, message = "Categoria não pode ultrapassar 100 caracteres")
    private String categoria;

    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero")
    private BigDecimal valor;

    @NotNull(message = "Método de pagamento é obrigatório")
    private MetodoPagamento metodoPagamento;

    private StatusPagamento status;

    private UUID pedidoId;

    private UUID usuarioId;

    @Size(max = 1000, message = "Observação não pode ultrapassar 1000 caracteres")
    private String observacao;
}
