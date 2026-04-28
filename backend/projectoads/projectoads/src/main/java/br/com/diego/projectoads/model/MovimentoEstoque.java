package br.com.diego.projectoads.model;

import br.com.diego.projectoads.config.Enum.TipoMovimentacao;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity (name = "movimento_estoque")
public class MovimentoEstoque {

    @Id
    @GeneratedValue
    private UUID id;

    @Enumerated(EnumType.STRING)
    private TipoMovimentacao tipo; // ENTRADA ou SAIDA

    private Integer quantidade;

    private LocalDateTime data;

    @ManyToOne
    private Produto produto;

    @ManyToOne
    private Usuario usuario;
}
