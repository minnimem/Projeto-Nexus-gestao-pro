package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.model.CompraEstoque;
import br.com.diego.projectoads.model.ItemCompraEstoque;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CompraEstoqueResponse {

    public UUID id;
    public UUID fornecedorId;
    public String fornecedor;
    public LocalDateTime dataCompra;
    public LocalDate dataVencimento;
    public String numeroDocumento;
    public String metodoPagamento;
    public String status;
    public BigDecimal valorTotal;
    public String observacao;
    public List<ItemResponse> itens;

    public CompraEstoqueResponse(CompraEstoque compra) {
        this.id = compra.getId();
        this.fornecedorId = compra.getFornecedor() != null ? compra.getFornecedor().getId() : null;
        this.fornecedor = compra.getFornecedor() != null ? compra.getFornecedor().getNome() : null;
        this.dataCompra = compra.getDataCompra();
        this.dataVencimento = compra.getDataVencimento();
        this.numeroDocumento = compra.getNumeroDocumento();
        this.metodoPagamento = compra.getMetodoPagamento() != null ? compra.getMetodoPagamento().name() : null;
        this.status = compra.getStatusPagamento() != null ? compra.getStatusPagamento().name() : null;
        this.valorTotal = compra.getValorTotal();
        this.observacao = compra.getObservacao();
        this.itens = compra.getItens() == null ? List.of() : compra.getItens().stream().map(ItemResponse::new).toList();
    }

    public static class ItemResponse {
        public UUID id;
        public UUID produtoId;
        public String produto;
        public Integer quantidade;
        public BigDecimal precoUnitario;
        public BigDecimal subtotal;

        public ItemResponse(ItemCompraEstoque item) {
            this.id = item.getId();
            this.produtoId = item.getProduto() != null ? item.getProduto().getIdProduto() : null;
            this.produto = item.getProduto() != null ? item.getProduto().getNomeProduto() : null;
            this.quantidade = item.getQuantidade();
            this.precoUnitario = item.getPrecoUnitario();
            this.subtotal = item.getSubtotal();
        }
    }
}
