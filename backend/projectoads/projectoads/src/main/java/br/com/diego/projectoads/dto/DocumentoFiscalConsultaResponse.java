package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import br.com.diego.projectoads.config.Enum.StatusDocumentoFiscal;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class DocumentoFiscalConsultaResponse {
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
    private String provedor;
    private Boolean autorizado;
    private Boolean possuiChaveAcesso;
    private Boolean possuiProtocolo;
    private Boolean possuiPayloadJson;
    private Boolean possuiXmlEnvio;
    private Boolean possuiXmlRetorno;
    private Boolean possuiDanfeHtml;
    private Boolean possuiCartaCorrecao;
    private Boolean possuiPendenciasFiscais;
    private Integer totalArquivosDisponiveis;
    private Integer totalPendenciasFiscais;
    private Integer totalAcoesDisponiveis;
    private String mensagemRetorno;
    private List<String> pendenciasFiscais;
    private String proximaAcao;
    private List<String> acoesDisponiveis;
    private LocalDateTime consultadoEm;
    private LocalDateTime atualizadoEm;
}
