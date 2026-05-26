package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.ModuloPlano;
import br.com.diego.projectoads.config.Enum.StatusLiberacaoModulo;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LiberacaoModuloRequest {
    private ModuloPlano modulo;
    private StatusLiberacaoModulo status;
    private Boolean contratado;
    private String responsavel;
    private String evidencia;
    private String observacao;
}
