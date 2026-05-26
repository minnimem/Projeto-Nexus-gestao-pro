package br.com.diego.projectoads.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class DocumentoFiscalPacoteIntegridadeResponse {
    private UUID id;
    private String documento;
    private Boolean valido;
    private String pacoteReferencia;
    private String payloadJsonSha256;
    private String xmlEnvioSha256;
    private List<String> itensProntos;
    private List<String> pendencias;
    private Integer totalItensProntos;
    private Integer totalPendencias;
    private Integer percentualProntidao;
    private String proximaAcao;
    private LocalDateTime validadoEm;
}
