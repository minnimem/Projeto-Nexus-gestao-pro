package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Entregador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EntregadorRepository extends JpaRepository<Entregador, UUID> {
    List<Entregador> findByAtivoTrue();
    boolean existsByCpf(String cpf);
    boolean existsByEmail(String email);
}
