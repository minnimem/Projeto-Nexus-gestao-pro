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
public class DocumentoFiscalPacoteEmissaoRealResponse {
    private UUID id;
    private UUID pedidoId;
    private String pedidoNumero;
    private ModeloDocumentoFiscal modelo;
    private AmbienteFiscal ambienteDocumento;
    private AmbienteFiscal ambienteConfiguracao;
    private StatusDocumentoFiscal status;
    private String serie;
    private Long numero;
    private String provedor;
    private String endpointProducao;
    private String provedorTokenEnv;
    private String certificadoArquivoEnv;
    private String certificadoSenhaEnv;
    private String cscId;
    private String cscTokenEnv;
    private Boolean prontoEmissaoReal;
    private Integer percentualProntidao;
    private List<String> itensProntos;
    private List<String> pendencias;
    private List<String> pendenciasExternas;
    private Integer totalItensProntos;
    private Integer totalPendencias;
    private Integer totalPendenciasExternas;
    private String proximaAcao;
    private String payloadJson;
    private String payloadJsonSha256;
    private String xmlEnvio;
    private String xmlEnvioSha256;
    private String pacoteReferencia;
    private String observacao;
    private LocalDateTime geradoEm;
}
