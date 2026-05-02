package br.com.diego.projectoads.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "filial", schema = "public")
public class Filial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(length = 30)
    private String codigo;

    @Column(length = 20)
    private String cnpj;

    @Column(length = 30)
    private String telefone;

    @Column(length = 120)
    private String email;

    @Column(length = 255)
    private String endereco;

    @Column(length = 80)
    private String cidade;

    @Column(length = 2)
    private String uf;

    @Column(nullable = false)
    private Boolean matriz = false;

    @Column(nullable = false)
    private Boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(name = "data_cadastro", nullable = false)
    private LocalDateTime dataCadastro;

    @PrePersist
    public void prePersist() {
        if (this.dataCadastro == null) {
            this.dataCadastro = LocalDateTime.now();
        }
        if (this.ativo == null) {
            this.ativo = true;
        }
        if (this.matriz == null) {
            this.matriz = false;
        }
    }
}
