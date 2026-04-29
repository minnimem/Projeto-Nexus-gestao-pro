package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Entrega;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EntregaRepository extends JpaRepository<Entrega, UUID> {
    boolean existsByPedidoId(UUID pedidoId);

    Optional<Entrega> findByPedidoId(UUID pedidoId);

    List<Entrega> findByRotaEntregaId(UUID rotaId);
}
