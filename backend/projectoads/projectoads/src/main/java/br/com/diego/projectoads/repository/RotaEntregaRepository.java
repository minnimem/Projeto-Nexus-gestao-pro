package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.StatusRota;
import br.com.diego.projectoads.model.RotaEntrega;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface RotaEntregaRepository extends JpaRepository<RotaEntrega, UUID> {
    List<RotaEntrega> findByStatus(StatusRota status);
    List<RotaEntrega> findByDataRota(LocalDate dataRota);
}
