package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import br.com.diego.projectoads.config.Enum.StatusDocumentoFiscal;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class DocumentoFiscalResponse {
    private UUID id;
    private UUID pedidoId;
    private String pedidoNumero;
    private UUID configuracaoFiscalId;
    private ModeloDocumentoFiscal modelo;
    private AmbienteFiscal ambiente;
    private StatusDocumentoFiscal status;
    private String serie;
    private Long numero;
    private String chaveAcesso;
    private String protocolo;
    private String provedor;
    private String payloadJson;
    private String xmlEnvio;
    private String xmlRetorno;
    private String danfeHtml;
    private String cartaCorrecaoXml;
    private String cartaCorrecaoTexto;
    private Integer cartaCorrecaoSequencia;
    private String mensagemRetorno;
    private String pendenciasFiscais;
    private String observacao;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
