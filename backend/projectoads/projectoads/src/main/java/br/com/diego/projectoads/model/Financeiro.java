package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@ToString(exclude = {"pedido", "usuario", "filial"})
@Table(name = "financeiro", schema = "public")
public class Financeiro {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "data_lancamento", nullable = false)
    private LocalDateTime dataLancamento;

    @Column(name = "data_vencimento")
    private LocalDate dataVencimento;

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
    @Column(name = "forma_pagamento", length = 30)
    private MetodoPagamento metodoPagamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusPagamento status = StatusPagamento.APROVADO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filial_id")
    private Filial filial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorrencia_id")
    private RecorrenciaFinanceira recorrencia;

    @Column(name = "codigo_cobranca", length = 40)
    private String codigoCobranca;

    @Column(name = "pix_copia_cola", columnDefinition = "TEXT")
    private String pixCopiaCola;

    @Column(name = "pix_qr_code_url", length = 1000)
    private String pixQrCodeUrl;

    @Column(name = "boleto_linha_digitavel", length = 140)
    private String boletoLinhaDigitavel;

    @Column(name = "boleto_numero_documento", length = 60)
    private String boletoNumeroDocumento;

    @Column(name = "boleto_nosso_numero", length = 60)
    private String boletoNossoNumero;

    @Column(name = "cobranca_provedor", length = 30)
    private String cobrancaProvedor;

    @Column(name = "cobranca_externa_id", length = 80)
    private String cobrancaExternaId;

    @Column(name = "cobranca_url", length = 1000)
    private String cobrancaUrl;

    @Column(name = "cobranca_gerada_em")
    private LocalDateTime cobrancaGeradaEm;

    @Column(name = "cobranca_expira_em")
    private LocalDateTime cobrancaExpiraEm;

    @PrePersist
    public void prePersist() {
        if (this.dataLancamento == null) {
            this.dataLancamento = LocalDateTime.now();
        }

        if (this.status == null) {
            this.status = StatusPagamento.APROVADO;
        }

        if (this.valor == null) {
            this.valor = BigDecimal.ZERO;
        }
    }
}
