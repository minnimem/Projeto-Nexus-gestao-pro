package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PedidoFinalizacaoRequest {
    private MetodoPagamento metodoPagamento;
    private Integer parcelas = 1;
    private String detalhesPagamento;
}
