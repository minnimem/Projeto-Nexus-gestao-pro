package br.com.diego.projectoads.dto;

public class ProdutoEstoqueDTO {

    public String nomeProduto;
    public Integer quantidade;
    public String status;

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