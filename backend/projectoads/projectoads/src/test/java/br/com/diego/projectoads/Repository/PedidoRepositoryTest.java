package br.com.diego.projectoads.Repository;


import br.com.diego.projectoads.config.Enum.StatusPedido;
import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.repository.ClienteRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;



@SpringBootTest
class PedidoRepositoryTest {

    @Autowired
    PedidoRepository pedidoRepository;

    @Autowired
    ClienteRepository clienteRepository;

    @Test
    void salvarPedido(){

        Pedido pedido = new Pedido();

        pedido.setDataPedido(LocalDateTime.of(2000, 2, 3, 10, 30));
        pedido.setValorTotalPedido(new BigDecimal("1002.50"));
        pedido.setStatus(StatusPedido.ENTREGUE);

        Cliente cliente = clienteRepository.findById(
                        UUID.fromString("b1b8d61c-d17a-4dae-bf4c-50905f71cd6b"))
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        pedido.setCliente(cliente);

        pedidoRepository.save(pedido);

    }

}
