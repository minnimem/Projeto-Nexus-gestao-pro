package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class ConfiguracaoFiscalStatusResponse {
    private UUID id;
    private UUID empresaId;
    private String empresaNome;
    private UUID filialId;
    private String filialNome;
    private ModeloDocumentoFiscal modelo;
    private AmbienteFiscal ambiente;
    private Boolean ativo;
    private Boolean prontoHomologacao;
    private String status;
    private List<String> pendencias;
}
