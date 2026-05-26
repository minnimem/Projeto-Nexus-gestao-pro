package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.model.Produto;

import java.math.BigDecimal;
import java.util.UUID;

public class ProdutoResponse {

    public UUID id;
    public String nome;
    public String sku;
    public String descricao;
    public String codigoBarras;
    public String ncm;
    public String cfop;
    public String cest;
    public String origemFiscal;
    public String unidadeComercial;
    public String cstIcms;
    public String csosn;
    public BigDecimal aliquotaIcms;
    public BigDecimal aliquotaPis;
    public BigDecimal aliquotaCofins;
    public BigDecimal aliquotaIpi;
    public String codigoServicoMunicipal;
    public String codigoServicoNacional;
    public BigDecimal aliquotaIss;
    public BigDecimal precoVenda;
    public BigDecimal precoComDesconto;
    public BigDecimal lucro;
    public Integer quantidadeEstoque;
    public Integer estoqueMinimo;
    public Integer estoqueMaximo;
    public Boolean ativo;
    public UUID categoriaId;
    public String categoria;
    public UUID marcaId;
    public String marca;
    public UUID fornecedorId;
    public String fornecedor;

    public ProdutoResponse(Produto p) {
        this.id = p.getIdProduto();
        this.nome = p.getNomeProduto();
        this.sku = p.getSku();
        this.descricao = p.getDescricao();
        this.codigoBarras = p.getCodBarras();
        this.ncm = p.getNcm();
        this.cfop = p.getCfop();
        this.cest = p.getCest();
        this.origemFiscal = p.getOrigemFiscal();
        this.unidadeComercial = p.getUnidadeComercial();
        this.cstIcms = p.getCstIcms();
        this.csosn = p.getCsosn();
        this.aliquotaIcms = p.getAliquotaIcms();
        this.aliquotaPis = p.getAliquotaPis();
        this.aliquotaCofins = p.getAliquotaCofins();
        this.aliquotaIpi = p.getAliquotaIpi();
        this.codigoServicoMunicipal = p.getCodigoServicoMunicipal();
        this.codigoServicoNacional = p.getCodigoServicoNacional();
        this.aliquotaIss = p.getAliquotaIss();
        this.precoVenda = p.getPrecoVenda();
        this.precoComDesconto = p.calcularPrecoComDesconto();
        this.lucro = p.getLucroPercentual();
        this.quantidadeEstoque = calcularQuantidadeEstoque(p);
        this.estoqueMinimo = calcularEstoqueMinimo(p);
        this.estoqueMaximo = calcularEstoqueMaximo(p);
        this.ativo = p.isAtivo();
        this.categoriaId = p.getCategoria() != null ? p.getCategoria().getId() : null;
        this.categoria = p.getCategoria() != null ? p.getCategoria().getNome() : null;
        this.marcaId = p.getMarca() != null ? p.getMarca().getId() : null;
        this.marca = p.getMarca() != null ? p.getMarca().getNome() : null;
        this.fornecedorId = p.getFornecedor() != null ? p.getFornecedor().getId() : null;
        this.fornecedor = p.getFornecedor() != null ? p.getFornecedor().getNome() : null;
    }

    private Integer calcularQuantidadeEstoque(Produto p) {
        if (p.getEstoques() == null) {
            return 0;
        }

        return p.getEstoques()
                .stream()
                .mapToInt(estoque -> estoque.getQuantidade() == null ? 0 : estoque.getQuantidade())
                .sum();
    }

    private Integer calcularEstoqueMinimo(Produto p) {
        if (p.getEstoques() == null || p.getEstoques().isEmpty()) {
            return 5;
        }

        return p.getEstoques()
                .stream()
                .map(estoque -> estoque.getQtaMinimo() == null ? 5 : estoque.getQtaMinimo())
                .findFirst()
                .orElse(5);
    }

    private Integer calcularEstoqueMaximo(Produto p) {
        if (p.getEstoques() == null || p.getEstoques().isEmpty()) {
            return null;
        }

        return p.getEstoques()
                .stream()
                .map(estoque -> estoque.getQtaMaximo())
                .filter(valor -> valor != null && valor > 0)
                .findFirst()
                .orElse(null);
    }
}
