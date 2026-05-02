package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPagamento;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "compra_estoque")
@ToString(exclude = {"fornecedor", "itens"})
public class CompraEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_compra")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_fornecedor", nullable = false)
    private Fornecedor fornecedor;

    @Column(name = "data_compra", nullable = false)
    private LocalDateTime dataCompra;

    @Column(name = "data_vencimento")
    private LocalDate dataVencimento;

    @Column(name = "numero_documento", length = 80)
    private String numeroDocumento;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pagamento", length = 30)
    private MetodoPagamento metodoPagamento = MetodoPagamento.BOLETO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_pagamento", length = 30)
    private StatusPagamento statusPagamento = StatusPagamento.PENDENTE;

    @Column(name = "valor_total", nullable = false, precision = 18, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @Column(name = "observacao", columnDefinition = "TEXT")
    private String observacao;

    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCompraEstoque> itens = new ArrayList<>();

    public void adicionarItem(ItemCompraEstoque item) {
        item.setCompra(this);
        itens.add(item);
    }

    @PrePersist
    public void prePersist() {
        if (dataCompra == null) {
            dataCompra = LocalDateTime.now();
        }
        if (metodoPagamento == null) {
            metodoPagamento = MetodoPagamento.BOLETO;
        }
        if (statusPagamento == null) {
            statusPagamento = StatusPagamento.PENDENTE;
        }
        if (valorTotal == null) {
            valorTotal = BigDecimal.ZERO;
        }
    }
}
