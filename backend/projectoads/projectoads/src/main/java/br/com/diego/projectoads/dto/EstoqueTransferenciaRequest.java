package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class EstoqueTransferenciaRequest {
    private UUID produtoId;
    private String origem;
    private String destino;
    private Integer quantidade;
    private String observacao;
}
