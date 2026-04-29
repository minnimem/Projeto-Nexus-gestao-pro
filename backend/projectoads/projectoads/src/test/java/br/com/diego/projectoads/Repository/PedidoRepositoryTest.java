package br.com.diego.projectoads.Repository;

import br.com.diego.projectoads.config.Enum.StatusPedido;
import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Pedido;
import br.com.diego.projectoads.repository.ClienteRepository;
import br.com.diego.projectoads.repository.EmpresaRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@SpringBootTest
@Transactional
class PedidoRepositoryTest {

    @Autowired
    PedidoRepository pedidoRepository;

    @Autowired
    ClienteRepository clienteRepository;

    @Autowired
    EmpresaRepository empresaRepository;

    @Test
    void salvarPedido() {
        Cliente cliente = clienteRepository.save(novoCliente());
        Empresa empresa = empresaRepository.save(novaEmpresa());

        Pedido pedido = new Pedido();
        pedido.setDataPedido(LocalDateTime.of(2000, 2, 3, 10, 30));
        pedido.setValorTotalPedido(new BigDecimal("1002.50"));
        pedido.setStatus(StatusPedido.ENTREGUE);
        pedido.setCliente(cliente);
        pedido.setEmpresa(empresa);

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        Assertions.assertNotNull(pedidoSalvo.getId());
        Assertions.assertEquals(cliente.getIdCliente(), pedidoSalvo.getCliente().getIdCliente());
        Assertions.assertEquals(empresa.getId(), pedidoSalvo.getEmpresa().getId());
    }

    private Cliente novoCliente() {
        Cliente cliente = new Cliente();
        cliente.setNome("Cliente Pedido");
        cliente.setCpf("93541134780");
        cliente.setDataNascimento(LocalDate.of(1990, 1, 1));
        cliente.setEmail("pedido-" + UUID.randomUUID() + "@example.com");
        cliente.setTelefone("62984576040");
        cliente.setEndereco("Rua do Pedido, 123");
        return cliente;
    }

    private Empresa novaEmpresa() {
        Empresa empresa = new Empresa();
        empresa.setNome("Empresa Teste " + UUID.randomUUID());
        empresa.setRazaoSocial("Empresa Teste LTDA");
        empresa.setCnpj("11222333000181");
        empresa.setTelefone("6233334444");
        empresa.setEmail("empresa-" + UUID.randomUUID() + "@example.com");
        empresa.setEndereco("Avenida Teste, 100");
        empresa.setCidade("Goiania");
        empresa.setUf("GO");
        return empresa;
    }
}
