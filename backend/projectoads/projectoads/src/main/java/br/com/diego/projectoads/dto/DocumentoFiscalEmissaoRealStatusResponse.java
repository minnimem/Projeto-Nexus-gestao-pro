package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.StatusDocumentoFiscal;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class DocumentoFiscalEmissaoRealStatusResponse {
    private UUID id;
    private String documento;
    private StatusDocumentoFiscal status;
    private Boolean prontoEmissaoReal;
    private Integer percentualProntidao;
    private List<String> itensProntos;
    private List<String> pendencias;
    private List<String> pendenciasExternas;
    private Integer totalItensProntos;
    private Integer totalPendencias;
    private Integer totalPendenciasExternas;
    private String proximaAcao;
}
