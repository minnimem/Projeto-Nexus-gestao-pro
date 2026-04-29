package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.TipoMovimentoCaixa;
import br.com.diego.projectoads.model.Caixa;
import br.com.diego.projectoads.model.MovimentoCaixa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface MovimentoCaixaRepository extends JpaRepository<MovimentoCaixa, UUID> {

    List<MovimentoCaixa> findByCaixaOrderByDataMovimentoDesc(Caixa caixa);

    boolean existsByPedidoIdAndTipo(UUID pedidoId, TipoMovimentoCaixa tipo);

    boolean existsByCaixaIdAndPedidoIdAndTipo(UUID caixaId, UUID pedidoId, TipoMovimentoCaixa tipo);

    @Query("""
            select coalesce(sum(m.valor), 0)
            from MovimentoCaixa m
            where m.caixa.id = :caixaId
              and m.tipo = :tipo
            """)
    BigDecimal somarPorCaixaETipo(@Param("caixaId") UUID caixaId, @Param("tipo") TipoMovimentoCaixa tipo);
}
