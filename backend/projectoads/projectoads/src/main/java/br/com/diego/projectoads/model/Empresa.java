package br.com.diego.projectoads.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "empresa")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(name = "razao_social", length = 180)
    private String razaoSocial;

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

    @Column(name = "estoque_minimo_padrao")
    private Integer estoqueMinimoPadrao = 5;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro = LocalDateTime.now();
}
