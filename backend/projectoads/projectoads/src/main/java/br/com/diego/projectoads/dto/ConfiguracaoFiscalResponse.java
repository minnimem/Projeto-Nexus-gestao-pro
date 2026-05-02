package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ConfiguracaoFiscalResponse {
    private UUID id;
    private UUID empresaId;
    private String empresaNome;
    private UUID filialId;
    private String filialNome;
    private ModeloDocumentoFiscal modelo;
    private AmbienteFiscal ambiente;
    private Boolean ativo;
    private String serie;
    private Long proximoNumero;
    private String provedor;
    private String certificadoAlias;
    private String certificadoSenhaEnv;
    private String cscId;
    private String cscTokenEnv;
    private String endpointHomologacao;
    private String endpointProducao;
    private String observacao;
    private LocalDateTime atualizadoEm;
}
