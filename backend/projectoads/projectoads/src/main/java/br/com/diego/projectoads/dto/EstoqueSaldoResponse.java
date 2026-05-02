package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.model.Estoque;

import java.util.UUID;

public class EstoqueSaldoResponse {
    public UUID estoqueId;
    public UUID produtoId;
    public String produto;
    public String codigoBarras;
    public UUID filialId;
    public String filial;
    public String localizacao;
    public Integer quantidade;
    public Integer qtaMinimo;
    public Integer qtaMaximo;

    public EstoqueSaldoResponse(Estoque estoque) {
        this.estoqueId = estoque.getId();
        this.produtoId = estoque.getProduto() != null ? estoque.getProduto().getIdProduto() : null;
        this.produto = estoque.getProduto() != null ? estoque.getProduto().getNomeProduto() : null;
        this.codigoBarras = estoque.getProduto() != null ? estoque.getProduto().getCodBarras() : null;
        this.filialId = estoque.getFilial() != null ? estoque.getFilial().getId() : null;
        this.filial = estoque.getFilial() != null ? estoque.getFilial().getNome() : null;
        this.localizacao = estoque.getLocalizacao();
        this.quantidade = estoque.getQuantidade() == null ? 0 : estoque.getQuantidade();
        this.qtaMinimo = estoque.getQtaMinimo();
        this.qtaMaximo = estoque.getQtaMaximo();
    }
}
