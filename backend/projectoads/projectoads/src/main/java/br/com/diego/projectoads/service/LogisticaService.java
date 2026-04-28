package br.com.diego.projectoads.service;

import br.com.diego.projectoads.dto.LogisticaResponse;
import br.com.diego.projectoads.model.Entrega;
import br.com.diego.projectoads.repository.EntregaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class LogisticaService {

    private final EntregaRepository repository;

    public LogisticaService(EntregaRepository repository) {
        this.repository = repository;
    }

    // 🔎 LISTAGEM PAGINADA
    public Page<LogisticaResponse> listar(Pageable pageable) {
        return repository.findAll(pageable)
                .map(this::toResponse);
    }

    // 🔄 CONVERSÃO ENTITY → DTO
    private LogisticaResponse toResponse(Entrega entrega) {

        LogisticaResponse r = new LogisticaResponse();

        r.setId(entrega.getId());

        if (entrega.getPedido() != null) {
            r.setPedidoId(entrega.getPedido().getId());
            r.setNumeroPedido(entrega.getPedido().getNumero());
            r.setTotalPedido(entrega.getPedido().getValorTotalPedido());
        }

        r.setStatus(entrega.getStatus().name());
        r.setPrioridade(entrega.getPrioridade());

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