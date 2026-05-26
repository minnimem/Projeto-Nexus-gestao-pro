package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.StatusOrdemServico;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrdemServicoStatusRequest {

    @NotNull(message = "Status obrigatorio.")
    private StatusOrdemServico status;

    @Size(max = 1000, message = "Observacao nao pode ultrapassar 1000 caracteres.")
    private String observacao;
}
