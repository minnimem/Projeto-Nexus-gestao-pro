package br.com.diego.projectoads.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@Getter
@Setter
@Entity
@ToString (exclude = "categoria")
@Table(name = "categoria")
public class Categoria {
    @Id
    @Column(name = "id_categoria", nullable = false)
    private UUID id;

    @Column (name = "nome", length = 100, nullable = false)
    private String nome;

    @Column (name = "descricao", length = 255)
    private String descricao;

}