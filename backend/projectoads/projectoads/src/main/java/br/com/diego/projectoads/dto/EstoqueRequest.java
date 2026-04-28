package br.com.diego.projectoads.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class EstoqueRequest {

    @NotNull(message = "ID do produto é obrigatório")
    private UUID produtoId;

    @Min(0)
    private int quantidade;

    @Min(0)
    private int qtaMinimo;

    @Min(0)
    private int qtaMaximo;

    private String localizacao;

    // getters/setters
}