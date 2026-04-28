package br.com.diego.projectoads.Repository;

import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.repository.ClienteRepository;
import jakarta.persistence.Table;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class ClienteRepositoryTest {

    @Autowired
    ClienteRepository repository;

    @Test
    public void salvartest(){

        Cliente cliente = new Cliente();
        cliente.setNome("Maria");
        cliente.setCpf("11155555250");
        cliente.setDataNascimento(LocalDate.of(2004, 02, 05));
        cliente.setEmail("maria@gmail.com");
        cliente.setTelefone("62984576040");
        cliente.setEndereco("Rua Manoel Bel, qd 166, lt04");

        var clienteSalvo = repository.save(cliente);
        System.out.println("Cliente salvo " + clienteSalvo);

    }

    //Atualizar dados
    @Test
    public  void atualizarTest(){
       var id = UUID.fromString("b1b8d61c-d17a-4dae-bf4c-50905f71cd6b");

        Optional<Cliente> possivelCliente = repository.findById(id);

        if(possivelCliente.isPresent()){
            Cliente clienteEncontrado = possivelCliente.get();
            System.out.println("Dados do Cliente");
            System.out.println(clienteEncontrado);
            clienteEncontrado.setDataNascimento(LocalDate.of(2000, 03,10));

            repository.save(clienteEncontrado);
        }
    }

    //listar Cliente

    @Test
    public void listarCliente(){
        List<Cliente> lista = repository.findAll();
        lista.forEach(System.out::println);
    }

    //Contagem Cliente
    @Test
    public void countTest(){
        System.out.println("Contagem de Clientes: " + repository.count());
    }

    //Deletar pelo ID
    @Test
    public void deletePorIdTest(){
        var id = UUID.fromString("8fe4a77c-231f-4c47-9108-814319be2346");
        repository.deleteById(id);
    }
    //Delete String
    @Test
    public void deleteTest(){
        var id = UUID.fromString("8fe4a77c-231f-4c47-9108-814319be2346");
        var maria = repository.findById(id).get();
        repository.delete(maria);
    }
}
