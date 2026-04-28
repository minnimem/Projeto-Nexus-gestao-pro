package br.com.diego.projectoads.model;

import br.com.diego.projectoads.exception.BusinessException;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "produto")
@ToString(exclude = {"categoria", "marca", "fornecedor", "estoques"})
@Getter
@Setter
public class Produto {

    @Id
    @Column(name = "id_produto")
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID idProduto;

    @Column(name = "sku", unique = true, length = 60)
    private String sku;

    @Column(name = "codigo_barras", nullable = false, unique = true, length = 20)
    private String codBarras;

    @NotBlank
    @Column(name = "nome", nullable = false)
    private String nomeProduto;

    @Column(name = "descricao", length = 255)
    private String descricao;

    @Column(name = "preco_compra", nullable = false, precision = 18, scale = 2)
    private BigDecimal precoCompra;

    @Column(name = "preco_venda", nullable = false, precision = 18, scale = 2)
    private BigDecimal precoVenda;

    @Column(name = "desconto_percentual", precision = 5, scale = 2)
    private BigDecimal descontoPercentual;

    @Column(name = "lucro_percentual")
    private BigDecimal lucroPercentual;

    @OneToMany(mappedBy = "produto", fetch = FetchType.LAZY)
    private List<Estoque> estoques;

    @Column(name = "ativo")
    private boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_marca")
    private Marca marca;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_fornecedor")
    private Fornecedor fornecedor;

    @Column(name = "garantia_mes")
    private Integer garantiaMes;

    public void setDescontoPercentual(BigDecimal descontoPercentual) {
        if (descontoPercentual != null &&
                (descontoPercentual.compareTo(BigDecimal.ZERO) < 0 ||
                        descontoPercentual.compareTo(BigDecimal.valueOf(100)) > 0)) {
            throw new BusinessException("Desconto deve ser entre 0 e 100%");
        }
        this.descontoPercentual = descontoPercentual;
    }

    public BigDecimal calcularPrecoComDesconto() {
        if (precoVenda == null) return BigDecimal.ZERO;

        if (descontoPercentual == null) {
            return precoVenda.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal desconto = precoVenda
                .multiply(descontoPercentual)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        return precoVenda.subtract(desconto).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calcularLucroComDesconto() {
        if (precoCompra == null || precoCompra.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Preço de compra inválido");
        }

        BigDecimal precoFinal = calcularPrecoComDesconto();
        BigDecimal lucro = precoFinal.subtract(precoCompra);

        return lucro.divide(precoCompra, 4, RoundingMode.HALF_UP);
    }

    @PrePersist
    @PreUpdate
    public void calcularLucro() {
        if (precoCompra != null && precoVenda != null) {
            this.lucroPercentual = calcularLucroComDesconto();
        }
    }
}