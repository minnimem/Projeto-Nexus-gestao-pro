package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.TipoMovimentacao;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
public class EstoqueMovimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    private Produto produto;

    private Integer quantidade;

    @Enumerated(EnumType.STRING)
    private TipoMovimentacao tipo; // ENTRADA / SAIDA

    private String motivo;

    private LocalDateTime data = LocalDateTime.now();
}