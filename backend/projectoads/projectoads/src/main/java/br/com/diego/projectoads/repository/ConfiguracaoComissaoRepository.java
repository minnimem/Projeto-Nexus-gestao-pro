package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.ConfiguracaoComissao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConfiguracaoComissaoRepository extends JpaRepository<ConfiguracaoComissao, UUID> {
    Optional<ConfiguracaoComissao> findFirstByAtivoTrueOrderByAtualizadoEmDesc();
}
