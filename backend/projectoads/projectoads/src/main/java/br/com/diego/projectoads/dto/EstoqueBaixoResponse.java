package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.model.Estoque;

import java.util.UUID;

public class EstoqueBaixoResponse {

    public UUID id;
    public UUID produtoId;
    public String produto;
    public String nomeProduto;
    public Integer quantidade;
    public Integer quantidadeAtual;
    public Integer qtaMinimo;
    public Integer estoqueMinimo;
    public Integer qtaMaximo;
    public String localizacao;

    public EstoqueBaixoResponse(Estoque estoque, int estoqueMinimoPadrao) {
        this.id = estoque.getId();
        this.produtoId = estoque.getProduto() != null ? estoque.getProduto().getIdProduto() : null;
        this.produto = estoque.getProduto() != null ? estoque.getProduto().getNomeProduto() : null;
        this.nomeProduto = this.produto;
        this.quantidade = estoque.getQuantidade() == null ? 0 : estoque.getQuantidade();
        this.quantidadeAtual = this.quantidade;
        this.qtaMinimo = estoque.getQtaMinimo() == null ? estoqueMinimoPadrao : estoque.getQtaMinimo();
        this.estoqueMinimo = this.qtaMinimo;
        this.qtaMaximo = estoque.getQtaMaximo();
        this.localizacao = estoque.getLocalizacao();
    }
}
