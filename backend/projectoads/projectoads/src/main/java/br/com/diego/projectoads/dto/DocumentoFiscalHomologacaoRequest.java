package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class DocumentoFiscalHomologacaoRequest {
    private UUID pedidoId;
    private UUID configuracaoFiscalId;
    private ModeloDocumentoFiscal modelo;
    private String observacao;
}
