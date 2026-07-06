package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class ConfiguracaoFiscalRequest {
    @NotNull(message = "Empresa e obrigatoria")
    private UUID empresaId;
    private UUID filialId;
    @NotNull(message = "Modelo fiscal e obrigatorio")
    private ModeloDocumentoFiscal modelo;
    @NotNull(message = "Ambiente fiscal e obrigatorio")
    private AmbienteFiscal ambiente;
    private Boolean ativo;
    @Size(max = 20, message = "Serie deve ter no maximo 20 caracteres")
    private String serie;
    @Min(value = 1, message = "Proximo numero deve ser maior que zero")
    private Long proximoNumero;
    private String provedor;
    private String provedorTokenEnv;
    private String certificadoAlias;
    private String certificadoArquivoEnv;
    private String certificadoSenhaEnv;
    private LocalDate certificadoValidoAte;
    private String cscId;
    private String cscTokenEnv;
    private String endpointHomologacao;
    private String endpointProducao;
    private String observacao;
}
