package br.com.diego.projectoads.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.UUID;

@ToString
@Getter
@Setter
@Entity
@Table (name = "item_pedido")
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column (name = "id_item", nullable = false)
    private UUID id;

    @ManyToOne
    @JoinColumn (name = "id_pedido", nullable = false)
    private Pedido pedido;

    @ManyToOne
    @JoinColumn (name = "id_produto", nullable = false)
    private Produto produto;

    @Column (name = "quantidade", nullable = false)
    private Integer quantidade;

    @Column (name = "preco_unit", precision = 18, scale = 2, nullable = false)
    private BigDecimal precoUnit;
}
