package br.com.diego.projectoads.Repository;

import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.repository.ClienteRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@SpringBootTest
@Transactional
public class ClienteRepositoryTest {

    @Autowired
    ClienteRepository repository;

    @Test
    public void salvarTest() {
        Cliente cliente = novoCliente("Maria", "52998224725");

        Cliente clienteSalvo = repository.save(cliente);

        Assertions.assertNotNull(clienteSalvo.getIdCliente());
        Assertions.assertEquals("Maria", clienteSalvo.getNome());
    }

    @Test
    public void atualizarTest() {
        Cliente clienteSalvo = repository.save(novoCliente("Joao", "39053344705"));

        Cliente clienteEncontrado = repository.findById(clienteSalvo.getIdCliente())
                .orElseThrow();
        clienteEncontrado.setDataNascimento(LocalDate.of(2000, 3, 10));

        Cliente clienteAtualizado = repository.save(clienteEncontrado);

        Assertions.assertEquals(LocalDate.of(2000, 3, 10), clienteAtualizado.getDataNascimento());
    }

    @Test
    public void listarCliente() {
        List<Cliente> lista = repository.findAll();
        Assertions.assertNotNull(lista);
    }

    @Test
    public void countTest() {
        Assertions.assertTrue(repository.count() >= 0);
    }

    @Test
    public void deletePorIdTest() {
        Cliente clienteSalvo = repository.save(novoCliente("Ana", "15350946056"));
        UUID id = clienteSalvo.getIdCliente();

        repository.deleteById(id);

        Assertions.assertFalse(repository.existsById(id));
    }

    @Test
    public void deleteTest() {
        Cliente clienteSalvo = repository.save(novoCliente("Carla", "11144477735"));

        repository.delete(clienteSalvo);

        Assertions.assertFalse(repository.existsById(clienteSalvo.getIdCliente()));
    }

    private Cliente novoCliente(String nome, String cpf) {
        Cliente cliente = new Cliente();
        cliente.setNome(nome);
        cliente.setCpf(cpf);
        cliente.setDataNascimento(LocalDate.of(2004, 2, 5));
        cliente.setEmail("teste-" + UUID.randomUUID() + "@example.com");
        cliente.setTelefone("62984576040");
        cliente.setEndereco("Rua Manoel Bel, qd 166, lt04");
        return cliente;
    }
}
