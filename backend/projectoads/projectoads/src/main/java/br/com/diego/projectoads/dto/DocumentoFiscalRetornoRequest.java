package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentoFiscalRetornoRequest {
    private String chaveAcesso;
    private String protocolo;
    private String xmlRetorno;
    private String mensagemRetorno;
    private String observacao;
}
