package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.OrdemServico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, UUID> {
    List<OrdemServico> findAllByOrderByCriadoEmDesc();
}
