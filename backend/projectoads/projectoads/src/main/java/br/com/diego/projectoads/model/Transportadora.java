package br.com.diego.projectoads.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "transportadora")
public class Transportadora {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_transportadora", nullable = false)
    private UUID id;

    @Column(name = "nome", nullable = false, length = 120)
    private String nome;

    @Column(name = "documento", length = 20)
    private String documento;

    @Column(name = "telefone", length = 30)
    private String telefone;

    @Column(name = "email", length = 120)
    private String email;

    @Column(name = "site", length = 160)
    private String site;

    @Column(name = "ativo")
    private Boolean ativo = true;

    @Column(name = "observacao", length = 500)
    private String observacao;

    @PrePersist
    @PreUpdate
    public void preSave() {
        if (nome != null) {
            nome = nome.trim();
        }
        if (documento != null) {
            documento = documento.replaceAll("\\D", "");
        }
        if (telefone != null) {
            telefone = telefone.trim();
        }
        if (email != null) {
            email = email.trim();
        }
        if (site != null) {
            site = site.trim();
        }
        if (observacao != null) {
            observacao = observacao.trim();
        }
        if (ativo == null) {
            ativo = true;
        }
    }
}
