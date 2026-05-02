package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Filial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FilialRepository extends JpaRepository<Filial, UUID> {
    List<Filial> findByEmpresaIdOrderByMatrizDescNomeAsc(UUID empresaId);
}
