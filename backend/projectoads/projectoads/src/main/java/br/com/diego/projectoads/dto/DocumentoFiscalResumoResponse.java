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
public class DocumentoFiscalResumoResponse {
    private UUID id;
    private UUID pedidoId;
    private String pedidoNumero;
    private ModeloDocumentoFiscal modelo;
    private AmbienteFiscal ambiente;
    private StatusDocumentoFiscal status;
    private String serie;
    private Long numero;
    private String chaveAcesso;
    private String protocolo;
    private Boolean possuiPayloadJson;
    private Boolean possuiXmlEnvio;
    private Boolean possuiXmlRetorno;
    private Boolean possuiDanfeHtml;
    private Boolean possuiCartaCorrecao;
    private Boolean possuiPendenciasFiscais;
    private Integer totalArquivosDisponiveis;
    private Integer totalPendenciasFiscais;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
}
