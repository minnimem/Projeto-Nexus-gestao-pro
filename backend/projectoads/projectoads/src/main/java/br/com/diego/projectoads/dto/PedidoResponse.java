package br.com.diego.projectoads.dto;

import br.com.diego.projectoads.model.ItemPedido;
import br.com.diego.projectoads.model.Pedido;
import org.hibernate.Hibernate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class PedidoResponse {

    public UUID id;
    public String numero;
    public UUID clienteId;
    public String cliente;
    public UUID usuarioId;
    public String usuario;
    public UUID empresaId;
    public String empresa;
    public LocalDateTime data;
    public BigDecimal valor;
    public String status;
    public String prioridade;
    public String metodoPagamento;
    public String metodoPagamentoDescricao;
    public List<ItemResponse> itens;

    public PedidoResponse(Pedido pedido) {
        this.id = pedido.getId();
        this.numero = pedido.getNumero();
        this.clienteId = pedido.getCliente() != null ? pedido.getCliente().getIdCliente() : null;
        this.cliente = pedido.getCliente() != null ? pedido.getCliente().getNome() : null;
        this.usuarioId = pedido.getUsuario() != null ? pedido.getUsuario().getId() : null;
        this.usuario = pedido.getUsuario() != null ? pedido.getUsuario().getNome() : null;
        this.empresaId = pedido.getEmpresa() != null ? pedido.getEmpresa().getId() : null;
        this.empresa = pedido.getEmpresa() != null ? pedido.getEmpresa().getNome() : null;
        this.data = pedido.getDataPedido();
        this.valor = pedido.getValorTotalPedido();
        this.status = pedido.getStatus() != null ? pedido.getStatus().name() : null;
        this.prioridade = pedido.getPrioridade() != null ? pedido.getPrioridade().name() : null;
        this.metodoPagamento = pedido.getMetodoPagamento() != null ? pedido.getMetodoPagamento().name() : null;
        this.metodoPagamentoDescricao = pedido.getMetodoPagamento() != null ? pedido.getMetodoPagamento().getDescricao() : null;
        this.itens = pedido.getItens() != null && Hibernate.isInitialized(pedido.getItens())
                ? pedido.getItens()
                        .stream()
                        .map(ItemResponse::new)
                        .toList()
                : List.of();
    }

    public static class ItemResponse {
        public UUID id;
        public UUID produtoId;
        public String produto;
        public Integer quantidade;
        public BigDecimal precoUnit;
        public BigDecimal subtotal;

        public ItemResponse(ItemPedido item) {
            this.id = item.getId();
            this.produtoId = item.getProduto() != null ? item.getProduto().getIdProduto() : null;
            this.produto = item.getProduto() != null ? item.getProduto().getNomeProduto() : null;
            this.quantidade = item.getQuantidade();
            this.precoUnit = item.getPrecoUnit();
            this.subtotal = item.getPrecoUnit() != null && item.getQuantidade() != null
                    ? item.getPrecoUnit().multiply(BigDecimal.valueOf(item.getQuantidade()))
                    : BigDecimal.ZERO;
        }
    }
}
