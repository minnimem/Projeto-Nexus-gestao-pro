package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.PrioridadeEntrega;
import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.StatusPedido;
import br.com.diego.projectoads.config.Enum.TipoEntrega;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@ToString(exclude = {"cliente", "itens", "usuario"})
@Table(name = "pedido", schema = "public")
public class Pedido {

    @Id
    @Column(name = "id_pedido")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "numero_pedido", unique = true, nullable = false, length = 30)
    private String numero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    // 🔥 NOVO (VENDEDOR RESPONSÁVEL)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "data_pedido")
    private LocalDateTime dataPedido;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(name = "valor_total_pedido", precision = 18, scale = 2, nullable = false)
    private BigDecimal valorTotalPedido;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusPedido status = StatusPedido.PENDENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pagamento", length = 30)
    private MetodoPagamento metodoPagamento = MetodoPagamento.PIX;

    @Column(name = "parcelas_pagamento")
    private Integer parcelasPagamento = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "prioridade", nullable = false, length = 20)
    private PrioridadeEntrega prioridade = PrioridadeEntrega.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_entrega", length = 30)
    private TipoEntrega tipoEntrega = TipoEntrega.RETIRADA_LOJA;

    @Column(name = "endereco_entrega", length = 255)
    private String enderecoEntrega;

    @Column(name = "observacao_entrega", length = 255)
    private String observacaoEntrega;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    // =====================
    // REGRAS
    // =====================

    public void adicionarItem(ItemPedido item){
        item.setPedido(this);
        this.itens.add(item);
    }

    public void calcularTotal(){
        this.valorTotalPedido = itens.stream()
                .map(item -> item.getPrecoUnit()
                        .multiply(BigDecimal.valueOf(item.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @PrePersist
    @PreUpdate
    public void prePersist(){

        if (this.numero == null) {
            this.numero = "PED-" + System.currentTimeMillis();
        }

        if (this.dataPedido == null) {
            this.dataPedido = LocalDateTime.now();
        }

        if (this.valorTotalPedido == null) {
            calcularTotal();
        }
    }
}

