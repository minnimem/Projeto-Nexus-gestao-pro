package br.com.diego.projectoads.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class ConfiguracaoAutomacaoComercialRequest {
    private UUID filialId;
    private Boolean overdue;
    private Boolean today;
    private Boolean highValue;
    private Boolean missingDate;
    @DecimalMin(value = "0.00", message = "Valor minimo de destaque nao pode ser negativo")
    private BigDecimal highValueThreshold;
    @Size(max = 40, message = "Canal deve ter no maximo 40 caracteres")
    private String channel;
}
