package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.PrioridadeEntrega;
import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class PedidoRequest {

    private UUID clienteId;
    private UUID usuarioId;

    private PrioridadeEntrega prioridade = PrioridadeEntrega.NORMAL;

    private BigDecimal desconto = BigDecimal.ZERO;

    private MetodoPagamento metodoPagamento = MetodoPagamento.PIX;

    private List<ItemPedidoRequest> itens;
}
