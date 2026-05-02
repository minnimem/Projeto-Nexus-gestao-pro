package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.TipoCategoria;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "categoria")
public class Categoria {
    @Id
    @Column(name = "id_categoria", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column (name = "nome", length = 100, nullable = false)
    private String nome;

    @Column (name = "descricao", length = 255)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", length = 30)
    private TipoCategoria tipo = TipoCategoria.GERAL;

    @Column(name = "centro_custo")
    private Boolean centroCusto = false;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @PrePersist
    @PreUpdate
    public void preSave() {
        if (tipo == null) {
            tipo = TipoCategoria.GERAL;
        }
        if (centroCusto == null) {
            centroCusto = false;
        }
        if (ativo == null) {
            ativo = true;
        }
        if (nome != null) {
            nome = nome.trim();
        }
        if (descricao != null) {
            descricao = descricao.trim();
        }
    }
}
