package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class ProdutoRequest {

    public String sku;
    public String codBarras;
    public String nomeProduto;
    public String descricao;
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

    public BigDecimal precoCompra;
    public BigDecimal precoVenda;
    public BigDecimal descontoPercentual;

    public Integer qtaMinimo;
    public Integer qtaMaximo;

    public UUID idCategoria;
    public UUID idMarca;
    public UUID idFornecedor;

    public Integer garantiaMes;
}
