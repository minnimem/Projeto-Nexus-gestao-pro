package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import br.com.diego.projectoads.model.Financeiro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FinanceiroRepository extends JpaRepository<Financeiro, UUID> {

    List<Financeiro> findByDataLancamentoBetweenOrderByDataLancamentoDesc(
            LocalDateTime inicio,
            LocalDateTime fim
    );

    @Query("""
            select coalesce(sum(f.valor), 0)
            from Financeiro f
            where f.tipo = :tipo
              and f.status = :status
              and f.dataLancamento between :inicio and :fim
            """)
    BigDecimal somarPorTipoEStatusNoPeriodo(
            @Param("tipo") TipoFinanceiro tipo,
            @Param("status") StatusPagamento status,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    long countByStatusAndDataLancamentoBetween(
            StatusPagamento status,
            LocalDateTime inicio,
            LocalDateTime fim
    );

    long countByDataLancamentoBetween(
            LocalDateTime inicio,
            LocalDateTime fim
    );

    Optional<Financeiro> findFirstByPedidoIdAndTipoAndStatusOrderByDataLancamentoDesc(
            UUID pedidoId,
            TipoFinanceiro tipo,
            StatusPagamento status
    );

    Optional<Financeiro> findFirstByCobrancaExternaId(String cobrancaExternaId);
}
