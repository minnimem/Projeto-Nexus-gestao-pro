package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Transportadora;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TransportadoraRepository extends JpaRepository<Transportadora, UUID> {
    List<Transportadora> findAllByOrderByAtivoDescNomeAsc();

    boolean existsByNomeIgnoreCase(String nome);

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, UUID id);

    boolean existsByDocumento(String documento);

    boolean existsByDocumentoAndIdNot(String documento, UUID id);
}
