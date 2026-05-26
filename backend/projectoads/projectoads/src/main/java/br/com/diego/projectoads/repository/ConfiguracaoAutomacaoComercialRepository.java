package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.ConfiguracaoAutomacaoComercial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConfiguracaoAutomacaoComercialRepository extends JpaRepository<ConfiguracaoAutomacaoComercial, UUID> {
    Optional<ConfiguracaoAutomacaoComercial> findFirstByEmpresaIdAndFilialIsNull(UUID empresaId);

    Optional<ConfiguracaoAutomacaoComercial> findFirstByEmpresaIdAndFilialId(UUID empresaId, UUID filialId);
}
