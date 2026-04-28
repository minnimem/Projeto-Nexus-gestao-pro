package br.com.diego.projectoads.model;

import br.com.diego.projectoads.exception.BusinessException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.UUID;

@Getter
@Setter
@Entity
@ToString (exclude = "produto")
@Table(name = "estoque")
public class Estoque {
    @Id
    @Column(name = "id_estoque", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "id_produto", nullable = false)
    private Produto produto;

    @Column (name = "quantidade", nullable = false)
    private Integer quantidade;

    @Column (name = "qta_minimo")
    private Integer qtaMinimo;

    @Column (name = "qta_maximo")
    private Integer qtaMaximo;

    @Column (name = "localizacao", nullable = false)
    private String localizacao;

    public void retirarEstoque(int quantidade){
        if(quantidade <= 0){
            throw new BusinessException("Quantidade inválida");
        }

        if(this.quantidade == null || quantidade > this.quantidade){
            throw new BusinessException("Estoque insuficiente");
        }

        this.quantidade -= quantidade;

        // Estoque minimo e alerta operacional. Bloqueio acontece somente por saldo insuficiente.
        if(qtaMinimo != null && this.quantidade < qtaMinimo){
            return;
        }

        if(qtaMinimo != null && this.quantidade < qtaMinimo){
            throw new BusinessException("Estoque abaixo do mínimo");
        }
    }

    public void aumentarEstoque(int quantidade){
        if(quantidade <= 0){
            throw new BusinessException("Quantidade inválida");
        }

        if(this.quantidade == null){
            this.quantidade = 0;
        }

        int novaQuantidade = this.quantidade + quantidade;

        if(qtaMaximo != null && qtaMaximo > 0 && novaQuantidade > qtaMaximo){
            throw new BusinessException("⚠ Excede quantidade máxima");
        }

        this.quantidade = novaQuantidade;
    }

    @PrePersist
    @PreUpdate
    public void validarLimites() {
        if (qtaMinimo != null && qtaMaximo != null && qtaMinimo > qtaMaximo) {
            throw new BusinessException("Quantidade mínima não pode ser maior que a máxima");
        }
    }
}
