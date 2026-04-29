package br.com.diego.projectoads.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class LogisticaResponse {

    private UUID id;

    private UUID pedidoId;
    private String numeroPedido;
    private String clienteNome;
    private BigDecimal totalPedido;
    private String enderecoEntrega;
    private String telefoneContato;

    private String status;
    private String prioridade;
    private UUID rotaId;
    private String rotaNome;

    private String transportadora;
    private String codigoRastreio;
    private String placaVeiculo;

    private LocalDateTime previsaoEntrega;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataEntrega;

    private String observacao;
}
