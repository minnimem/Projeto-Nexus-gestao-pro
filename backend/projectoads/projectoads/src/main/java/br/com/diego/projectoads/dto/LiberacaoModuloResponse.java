package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.ModuloPlano;
import br.com.diego.projectoads.config.Enum.StatusLiberacaoModulo;
import br.com.diego.projectoads.model.LiberacaoModuloEmpresa;

import java.time.LocalDateTime;
import java.util.UUID;

public class LiberacaoModuloResponse {
    public UUID id;
    public String modulo;
    public String status;
    public Boolean contratado;
    public Boolean liberado;
    public Boolean liberadoPorPlano;
    public String responsavel;
    public String evidencia;
    public String observacao;
    public LocalDateTime dataLiberacao;
    public LocalDateTime dataAtualizacao;

    public LiberacaoModuloResponse(ModuloPlano modulo,
                                   StatusLiberacaoModulo status,
                                   Boolean contratado,
                                   Boolean liberado,
                                   Boolean liberadoPorPlano,
                                   String responsavel,
                                   String evidencia,
                                   String observacao,
                                   LocalDateTime dataLiberacao,
                                   LocalDateTime dataAtualizacao,
                                   UUID id) {
        this.id = id;
        this.modulo = modulo.name();
        this.status = status.name();
        this.contratado = contratado;
        this.liberado = liberado;
        this.liberadoPorPlano = liberadoPorPlano;
        this.responsavel = responsavel;
        this.evidencia = evidencia;
        this.observacao = observacao;
        this.dataLiberacao = dataLiberacao;
        this.dataAtualizacao = dataAtualizacao;
    }

    public static LiberacaoModuloResponse fromEntity(LiberacaoModuloEmpresa liberacao, boolean liberadoPorPlano) {
        return new LiberacaoModuloResponse(
                liberacao.getModulo(),
                liberacao.getStatus(),
                liberacao.getContratado(),
                liberacao.getLiberado(),
                liberadoPorPlano,
                liberacao.getResponsavel(),
                liberacao.getEvidencia(),
                liberacao.getObservacao(),
                liberacao.getDataLiberacao(),
                liberacao.getDataAtualizacao(),
                liberacao.getId()
        );
    }
}
