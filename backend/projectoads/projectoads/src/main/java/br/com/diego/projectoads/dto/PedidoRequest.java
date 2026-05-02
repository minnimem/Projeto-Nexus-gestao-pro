package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.config.Enum.PrioridadeEntrega;
import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.config.Enum.TipoEntrega;
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
    private UUID filialId;

    private PrioridadeEntrega prioridade = PrioridadeEntrega.NORMAL;

    private BigDecimal desconto = BigDecimal.ZERO;

    private MetodoPagamento metodoPagamento = MetodoPagamento.PIX;

    private Integer parcelas = 1;

    private TipoEntrega tipoEntrega = TipoEntrega.RETIRADA_LOJA;

    private String enderecoEntrega;

    private String observacaoEntrega;

    private Boolean orcamento = false;

    private List<ItemPedidoRequest> itens;
}
