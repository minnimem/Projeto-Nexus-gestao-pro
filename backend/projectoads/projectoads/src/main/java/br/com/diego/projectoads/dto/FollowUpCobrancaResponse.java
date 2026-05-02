package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.StatusFollowUpCobranca;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class FollowUpCobrancaResponse {
    private UUID id;
    private UUID financeiroId;
    private String financeiroDescricao;
    private BigDecimal valor;
    private LocalDate vencimento;
    private UUID clienteId;
    private String clienteNome;
    private String canal;
    private LocalDate proximaAcao;
    private StatusFollowUpCobranca status;
    private String observacao;
    private LocalDateTime criadoEm;
    private LocalDateTime concluidoEm;
    private LocalDateTime notificacaoExternaEm;
    private UUID usuarioId;
    private String usuarioNome;
    private UUID filialId;
    private String filial;
}
