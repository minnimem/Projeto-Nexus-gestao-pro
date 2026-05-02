package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.StatusFollowUpCobranca;
import br.com.diego.projectoads.config.Enum.StatusPedido;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class FollowUpComercialResponse {
    private UUID id;
    private UUID pedidoId;
    private String pedidoNumero;
    private StatusPedido pedidoStatus;
    private BigDecimal valor;
    private UUID clienteId;
    private String clienteNome;
    private String vendedor;
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
