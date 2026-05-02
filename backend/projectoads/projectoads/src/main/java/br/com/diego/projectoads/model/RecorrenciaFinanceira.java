package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import br.com.diego.projectoads.exception.BusinessException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "recorrencia_financeira", schema = "public")
public class RecorrenciaFinanceira {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "descricao", nullable = false, length = 255)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoFinanceiro tipo;

    @Column(name = "categoria", length = 100)
    private String categoria;

    @Column(name = "valor", nullable = false, precision = 18, scale = 2)
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pagamento", nullable = false, length = 30)
    private MetodoPagamento metodoPagamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_lancamento", nullable = false, length = 30)
    private StatusPagamento statusLancamento = StatusPagamento.PENDENTE;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "proxima_geracao", nullable = false)
    private LocalDate proximaGeracao;

    @Column(name = "intervalo_meses", nullable = false)
    private Integer intervaloMeses = 1;

    @Column(name = "total_geracoes")
    private Integer totalGeracoes;

    @Column(name = "geracoes_realizadas", nullable = false)
    private Integer geracoesRealizadas = 0;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filial_id")
    private Filial filial;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    public void prePersist() {
        LocalDateTime agora = LocalDateTime.now();
        criadoEm = agora;
        atualizadoEm = agora;
        validar();
    }

    @PreUpdate
    public void preUpdate() {
        atualizadoEm = LocalDateTime.now();
        validar();
    }

    private void validar() {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Valor da recorrencia deve ser maior que zero.");
        }
        if (dataInicio == null) {
            throw new BusinessException("Data inicial da recorrencia e obrigatoria.");
        }
        if (proximaGeracao == null) {
            proximaGeracao = dataInicio;
        }
        if (intervaloMeses == null || intervaloMeses < 1 || intervaloMeses > 12) {
            throw new BusinessException("Intervalo da recorrencia deve ficar entre 1 e 12 meses.");
        }
        if (geracoesRealizadas == null || geracoesRealizadas < 0) {
            geracoesRealizadas = 0;
        }
        if (totalGeracoes != null && totalGeracoes < 1) {
            throw new BusinessException("Total de geracoes deve ser maior que zero.");
        }
        if (ativo == null) {
            ativo = true;
        }
        if (statusLancamento == null) {
            statusLancamento = StatusPagamento.PENDENTE;
        }
    }
}
