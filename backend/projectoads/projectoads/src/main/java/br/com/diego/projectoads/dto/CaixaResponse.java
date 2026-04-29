package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.Perfil;
import br.com.diego.projectoads.config.Enum.StatusCaixa;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CaixaResponse {
    private UUID id;
    private UUID usuarioId;
    private String usuarioNome;
    private String usuarioLogin;
    private Perfil perfil;
    private UUID empresaId;
    private String empresaNome;
    private LocalDateTime dataAbertura;
    private LocalDateTime dataFechamento;
    private BigDecimal valorInicial;
    private BigDecimal valorFechamento;
    private BigDecimal saldoCalculado;
    private BigDecimal totalVendas;
    private BigDecimal totalPagamentosRecebidos;
    private BigDecimal totalSuprimentos;
    private BigDecimal totalSangrias;
    private BigDecimal divergencia;
    private StatusCaixa status;
    private String observacao;
    private List<MovimentoCaixaResponse> movimentos;
}
