package br.com.diego.projectoads.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ConfiguracaoAutomacaoComercialResponse {
    private UUID id;
    private UUID empresaId;
    private UUID filialId;
    private String filial;
    private Boolean overdue;
    private Boolean today;
    private Boolean highValue;
    private Boolean missingDate;
    private BigDecimal highValueThreshold;
    private String channel;
    private LocalDateTime atualizadoEm;
}
