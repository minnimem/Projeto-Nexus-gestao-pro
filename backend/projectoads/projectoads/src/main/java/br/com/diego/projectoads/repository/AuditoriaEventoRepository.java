package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.AuditoriaEvento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditoriaEventoRepository extends JpaRepository<AuditoriaEvento, UUID> {
    List<AuditoriaEvento> findTop50ByOrderByDataEventoDesc();

    List<AuditoriaEvento> findTop20ByReferenciaIdOrderByDataEventoDesc(String referenciaId);
}
