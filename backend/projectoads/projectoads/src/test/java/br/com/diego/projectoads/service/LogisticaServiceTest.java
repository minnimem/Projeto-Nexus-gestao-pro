package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.PrioridadeEntrega;
import br.com.diego.projectoads.config.Enum.StatusEntrega;
import br.com.diego.projectoads.config.Enum.TipoEntrega;
import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.model.Entrega;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.repository.EntregaRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LogisticaServiceTest {

    private final EntregaRepository entregaRepository = mock(EntregaRepository.class);
    private final PedidoRepository pedidoRepository = mock(PedidoRepository.class);
    private final LogisticaService service = new LogisticaService(entregaRepository, pedidoRepository);

    @Test
    void listarDeveCriarEntregaPendenteParaPedidoDeEntregaSemRegistro() {
        Pedido pedido = pedidoDeEntrega();
        when(pedidoRepository.findByTipoEntrega(TipoEntrega.ENTREGA)).thenReturn(List.of(pedido));
        when(entregaRepository.findByPedidoId(pedido.getId())).thenReturn(Optional.empty());
        when(entregaRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of()));

        service.listar(PageRequest.of(0, 10));

        ArgumentCaptor<Entrega> captor = ArgumentCaptor.forClass(Entrega.class);
        verify(entregaRepository).save(captor.capture());
        Entrega entrega = captor.getValue();
        assertThat(entrega.getPedido()).isEqualTo(pedido);
        assertThat(entrega.getStatus()).isEqualTo(StatusEntrega.PENDENTE);
        assertThat(entrega.getPrioridade()).isEqualTo("URGENTE");
        assertThat(entrega.getEnderecoEntrega()).isEqualTo("Rua Cliente, 100");
        assertThat(entrega.getTelefoneContato()).isEqualTo("11999999999");
        assertThat(entrega.getObservacao()).isEqualTo("Entregar pela manhã");
    }

    @Test
    void listarDeveCompletarEntregaExistenteComDadosDoPedido() {
        Pedido pedido = pedidoDeEntrega();
        Entrega entrega = new Entrega();
        entrega.setStatus(StatusEntrega.PENDENTE);

        when(pedidoRepository.findByTipoEntrega(TipoEntrega.ENTREGA)).thenReturn(List.of(pedido));
        when(entregaRepository.findByPedidoId(pedido.getId())).thenReturn(Optional.of(entrega));
        when(entregaRepository.findAll(any(PageRequest.class))).thenReturn(new PageImpl<>(List.of(entrega)));

        service.listar(PageRequest.of(0, 10));

        assertThat(entrega.getPedido()).isEqualTo(pedido);
        assertThat(entrega.getEnderecoEntrega()).isEqualTo("Rua Cliente, 100");
        assertThat(entrega.getTelefoneContato()).isEqualTo("11999999999");
        assertThat(entrega.getObservacao()).isEqualTo("Entregar pela manhã");
        verify(entregaRepository).save(entrega);
    }

    private Pedido pedidoDeEntrega() {
        Cliente cliente = new Cliente();
        cliente.setNome("Cliente Teste");
        cliente.setEndereco("Rua Cliente, 100");
        cliente.setTelefone("11999999999");

        Pedido pedido = new Pedido();
        pedido.setId(UUID.randomUUID());
        pedido.setNumero("PED-001");
        pedido.setCliente(cliente);
        pedido.setTipoEntrega(TipoEntrega.ENTREGA);
        pedido.setPrioridade(PrioridadeEntrega.URGENTE);
        pedido.setObservacaoEntrega("Entregar pela manhã");
        return pedido;
    }
}
