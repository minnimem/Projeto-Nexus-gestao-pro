package br.com.diego.projectoads.dto;

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
    private BigDecimal highValueThreshold;
    private String channel;
}
