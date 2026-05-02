package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class EstoqueAjusteRequest {

    private UUID produtoId;
    private Integer quantidadeContada;
    private String observacao;
}
