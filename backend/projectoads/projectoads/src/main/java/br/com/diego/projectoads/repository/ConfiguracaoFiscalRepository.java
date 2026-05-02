package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConfiguracaoFiscalRepository extends JpaRepository<ConfiguracaoFiscal, UUID> {
    List<ConfiguracaoFiscal> findAllByOrderByEmpresaNomeAscFilialNomeAscModeloAsc();

    Optional<ConfiguracaoFiscal> findFirstByEmpresaIdAndFilialIdAndModelo(
            UUID empresaId,
            UUID filialId,
            ModeloDocumentoFiscal modelo
    );

    Optional<ConfiguracaoFiscal> findFirstByEmpresaIdAndFilialIsNullAndModelo(
            UUID empresaId,
            ModeloDocumentoFiscal modelo
    );
}
