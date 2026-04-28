package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {

    boolean existsByCpf(String cpf);
    boolean existsByEmail(String email);
    boolean existsByCpfAndIdClienteNot(String cpf, UUID idCliente);
    boolean existsByEmailAndIdClienteNot(String email, UUID idCliente);

}
