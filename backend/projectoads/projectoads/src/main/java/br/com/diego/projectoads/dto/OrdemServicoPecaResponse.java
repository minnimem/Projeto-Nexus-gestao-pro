package br.com.diego.projectoads.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class OrdemServicoPecaResponse {
    private UUID id;
    private UUID produtoId;
    private String produto;
    private String sku;
    private String codigoBarras;
    private Integer quantidade;
    private BigDecimal custoUnitario;
    private BigDecimal valorUnitario;
    private BigDecimal custoTotal;
    private BigDecimal valorTotal;
    private BigDecimal margem;
}
