package br.com.diego.projectoads.model;

import lombok.Getter;

@Getter
public class ProdutoEstoqueDTO {

    private final String nomeProduto;
    private final Integer quantidade;
    private final String status;

    public ProdutoEstoqueDTO(String nomeProduto, Integer quantidade) {
        this.nomeProduto = nomeProduto;
        this.quantidade = quantidade;

        if (quantidade == 0) {
            this.status = "ZERADO";
        } else if (quantidade <= 5) {
            this.status = "CRITICO";
        } else {
            this.status = "OK";
        }
    }
}