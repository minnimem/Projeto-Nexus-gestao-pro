package br.com.diego.projectoads.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "item_compra_estoque")
@ToString(exclude = {"compra", "produto"})
public class ItemCompraEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_item_compra")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_compra", nullable = false)
    private CompraEstoque compra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_produto", nullable = false)
    private Produto produto;

    @Column(name = "quantidade", nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario", nullable = false, precision = 18, scale = 2)
    private BigDecimal precoUnitario;

    @Column(name = "subtotal", nullable = false, precision = 18, scale = 2)
    private BigDecimal subtotal;

    @PrePersist
    @PreUpdate
    public void calcularSubtotal() {
        if (precoUnitario == null) {
            precoUnitario = BigDecimal.ZERO;
        }
        if (quantidade == null) {
            quantidade = 0;
        }
        subtotal = precoUnitario.multiply(BigDecimal.valueOf(quantidade));
    }
}
