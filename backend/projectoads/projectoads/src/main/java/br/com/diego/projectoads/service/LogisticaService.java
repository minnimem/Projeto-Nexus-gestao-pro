package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.StatusEntrega;
import br.com.diego.projectoads.config.Enum.TipoEntrega;
import br.com.diego.projectoads.dto.LogisticaResponse;
import br.com.diego.projectoads.model.Entrega;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.repository.EntregaRepository;
import br.com.diego.projectoads.repository.PedidoRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LogisticaService {

    private final EntregaRepository repository;
    private final PedidoRepository pedidoRepository;

    public LogisticaService(EntregaRepository repository, PedidoRepository pedidoRepository) {
        this.repository = repository;
        this.pedidoRepository = pedidoRepository;
    }

    // 🔎 LISTAGEM PAGINADA
    @Transactional
    public Page<LogisticaResponse> listar(Pageable pageable) {
        sincronizarPedidosDeEntrega();
        return repository.findAll(pageable)
                .map(this::toResponse);
    }

    private void sincronizarPedidosDeEntrega() {
        pedidoRepository.findByTipoEntrega(TipoEntrega.ENTREGA).forEach(pedido -> {
            if (pedido.getId() == null) {
                return;
            }

            repository.findByPedidoId(pedido.getId()).ifPresentOrElse(
                    entrega -> completarDadosDaEntrega(entrega, pedido),
                    () -> criarEntregaParaPedido(pedido)
            );
        });
    }

    private void criarEntregaParaPedido(Pedido pedido) {
        Entrega entrega = new Entrega();
        entrega.setPedido(pedido);
        entrega.setStatus(StatusEntrega.PENDENTE);
        entrega.setPrioridade(pedido.getPrioridade() != null ? pedido.getPrioridade().name() : "NORMAL");
        entrega.setEnderecoEntrega(enderecoDoPedido(pedido));
        entrega.setTelefoneContato(telefoneDoPedido(pedido));
        entrega.setObservacao(pedido.getObservacaoEntrega());
        repository.save(entrega);
    }

    private void completarDadosDaEntrega(Entrega entrega, Pedido pedido) {
        boolean alterou = false;

        if (entrega.getPedido() == null) {
            entrega.setPedido(pedido);
            alterou = true;
        }

        if (entrega.getEnderecoEntrega() == null || entrega.getEnderecoEntrega().isBlank()) {
            entrega.setEnderecoEntrega(enderecoDoPedido(pedido));
            alterou = true;
        }

        if (entrega.getTelefoneContato() == null || entrega.getTelefoneContato().isBlank()) {
            entrega.setTelefoneContato(telefoneDoPedido(pedido));
            alterou = true;
        }

        if ((entrega.getObservacao() == null || entrega.getObservacao().isBlank())
                && pedido.getObservacaoEntrega() != null
                && !pedido.getObservacaoEntrega().isBlank()) {
            entrega.setObservacao(pedido.getObservacaoEntrega().trim());
            alterou = true;
        }

        if (alterou) {
            repository.save(entrega);
        }
    }

    private String enderecoDoPedido(Pedido pedido) {
        return textoOuPadrao(
                pedido.getEnderecoEntrega(),
                pedido.getCliente() != null ? pedido.getCliente().getEndereco() : null
        );
    }

    private String telefoneDoPedido(Pedido pedido) {
        return pedido.getCliente() != null ? textoOuPadrao(pedido.getCliente().getTelefone(), null) : null;
    }

    private String textoOuPadrao(String valor, String padrao) {
        if (valor != null && !valor.isBlank()) {
            return valor.trim();
        }

        return padrao != null && !padrao.isBlank() ? padrao.trim() : null;
    }

    // 🔄 CONVERSÃO ENTITY → DTO
    private LogisticaResponse toResponse(Entrega entrega) {

        LogisticaResponse r = new LogisticaResponse();

        r.setId(entrega.getId());

        if (entrega.getPedido() != null) {
            Pedido pedido = entrega.getPedido();
            r.setPedidoId(pedido.getId());
            r.setNumeroPedido(pedido.getNumero());
            r.setTotalPedido(pedido.getValorTotalPedido());
            if (pedido.getFilial() != null) {
                r.setFilialId(pedido.getFilial().getId());
                r.setFilial(pedido.getFilial().getNome());
            }
            if (pedido.getCliente() != null) {
                r.setClienteNome(pedido.getCliente().getNome());
            }
        }

        r.setEnderecoEntrega(textoOuPadrao(
                entrega.getEnderecoEntrega(),
                entrega.getPedido() != null ? enderecoDoPedido(entrega.getPedido()) : null
        ));
        r.setTelefoneContato(textoOuPadrao(
                entrega.getTelefoneContato(),
                entrega.getPedido() != null ? telefoneDoPedido(entrega.getPedido()) : null
        ));
        r.setStatus(entrega.getStatus().name());
        r.setPrioridade(entrega.getPrioridade());

        if (entrega.getRotaEntrega() != null) {
            r.setRotaId(entrega.getRotaEntrega().getId());
            r.setRotaNome(entrega.getRotaEntrega().getNome());
        }

        r.setTransportadora(entrega.getTransportadora());
        r.setCodigoRastreio(entrega.getCodigoRastreio());
        r.setPlacaVeiculo(entrega.getPlacaVeiculo());

        r.setPrevisaoEntrega(entrega.getPrevisaoEntrega());
        r.setDataCriacao(entrega.getDataEnvio());
        r.setDataEntrega(entrega.getDataEntrega());

        r.setObservacao(entrega.getObservacao());

        return r;
    }
}
