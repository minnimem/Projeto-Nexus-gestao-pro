package br.com.diego.projectoads.dto;

import java.util.List;
import java.util.UUID;

public record PedidoCancelamentoLoteRequest(
        List<UUID> ids
) {
}
