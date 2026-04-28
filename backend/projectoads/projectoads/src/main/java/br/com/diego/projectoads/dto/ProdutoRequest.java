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
