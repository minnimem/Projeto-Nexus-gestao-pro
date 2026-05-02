package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ConfiguracaoFiscalRequest {
    private UUID empresaId;
    private UUID filialId;
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
}
