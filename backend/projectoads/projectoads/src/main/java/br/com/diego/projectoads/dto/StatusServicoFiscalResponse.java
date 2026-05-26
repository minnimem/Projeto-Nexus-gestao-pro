package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class StatusServicoFiscalResponse {
    private UUID configuracaoFiscalId;
    private ModeloDocumentoFiscal modelo;
    private AmbienteFiscal ambiente;
    private String endpoint;
    private Boolean disponivel;
    private String status;
    private String mensagem;
    private List<String> pendencias;
    private LocalDateTime consultadoEm;
}
