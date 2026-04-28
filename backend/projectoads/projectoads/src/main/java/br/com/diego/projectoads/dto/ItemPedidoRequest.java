package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ItemPedidoRequest {
    private UUID produtoId;
    private Integer quantidade;
}