package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.TipoMovimentacao;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class MovimentoEstoqueRequest {

    private UUID produtoId;
    private Integer quantidade;
    private TipoMovimentacao tipo;

}
