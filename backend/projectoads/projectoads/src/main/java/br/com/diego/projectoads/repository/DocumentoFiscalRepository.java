package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import br.com.diego.projectoads.model.DocumentoFiscal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentoFiscalRepository extends JpaRepository<DocumentoFiscal, UUID> {
    List<DocumentoFiscal> findByPedidoIdOrderByCriadoEmDesc(UUID pedidoId);

    @Query("""
        select d
        from DocumentoFiscal d
        left join fetch d.pedido p
        left join fetch d.configuracaoFiscal
        where p.id in :pedidoIds
        order by p.id asc, d.criadoEm desc
    """)
    List<DocumentoFiscal> findByPedidoIdsOrderByPedidoAndCriadoEmDesc(@Param("pedidoIds") Collection<UUID> pedidoIds);

    Optional<DocumentoFiscal> findFirstByPedidoIdAndModeloAndAmbienteOrderByCriadoEmDesc(
            UUID pedidoId,
            ModeloDocumentoFiscal modelo,
            AmbienteFiscal ambiente
    );
}
