package br.com.diego.projectoads.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "marca")
public class Marca {
    @Id
    @Column(name = "id_marca", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column (name = "nome", nullable = false, length = 100)
    private String nome;

    @Column (name = "descricao")
    private String descricao;
}