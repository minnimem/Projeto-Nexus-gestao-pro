package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class RecorrenciaFinanceiraResponse {
    private UUID id;
    private String descricao;
    private TipoFinanceiro tipo;
    private String categoria;
    private BigDecimal valor;
    private MetodoPagamento metodoPagamento;
    private String metodoPagamentoDescricao;
    private StatusPagamento statusLancamento;
    private LocalDate dataInicio;
    private LocalDate proximaGeracao;
    private Integer intervaloMeses;
    private Integer totalGeracoes;
    private Integer geracoesRealizadas;
    private Boolean ativo;
    private UUID usuarioId;
    private UUID filialId;
    private String filial;
    private String observacao;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
