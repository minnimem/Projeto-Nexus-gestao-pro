package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.StatusPedido;
import br.com.diego.projectoads.config.Enum.TipoEntrega;
import br.com.diego.projectoads.model.Pedido;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

    @Query("""
        select distinct p
        from Pedido p
        left join fetch p.cliente
        left join fetch p.usuario
        left join fetch p.empresa
        left join fetch p.itens i
        left join fetch i.produto
        where p.empresa.id = :empresaId
        order by p.dataPedido desc
    """)
    List<Pedido> findAllWithDetailsByEmpresaId(@Param("empresaId") UUID empresaId);

    @Query("""
        select distinct p
        from Pedido p
        left join fetch p.cliente
        left join fetch p.usuario
        left join fetch p.empresa
        left join fetch p.itens i
        left join fetch i.produto
        where p.id = :id
          and p.empresa.id = :empresaId
    """)
    Optional<Pedido> findDetailedByIdAndEmpresaId(
            @Param("id") UUID id,
            @Param("empresaId") UUID empresaId
    );

    // =========================
    // 💰 RECEITA TOTAL (GERAL)
    // =========================
    @Query("""
        SELECT COALESCE(SUM(p.valorTotalPedido), 0)
        FROM Pedido p
        WHERE p.status = :status
    """)
    BigDecimal receitaTotal(@Param("status") StatusPedido status);


    // =========================
    // 💰 RECEITA POR PERÍODO
    // =========================
    @Query("""
        SELECT COALESCE(SUM(p.valorTotalPedido), 0)
        FROM Pedido p
        WHERE p.status IN :statuses
        AND p.dataPedido BETWEEN :inicio AND :fim
    """)
    BigDecimal receitaPorPeriodo(
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
        SELECT COALESCE(SUM(p.valorTotalPedido), 0)
        FROM Pedido p
        WHERE p.empresa.id = :empresaId
        AND p.status IN :statuses
        AND p.dataPedido BETWEEN :inicio AND :fim
    """)
    BigDecimal receitaPorEmpresaPeriodo(
            @Param("empresaId") UUID empresaId,
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );


    // =========================
    // 📦 TOTAL POR STATUS
    // =========================
    long countByStatus(StatusPedido status);

    long countByEmpresaIdAndStatus(UUID empresaId, StatusPedido status);


    // =========================
    // 📊 TOTAL CONCLUÍDOS
    // =========================
    @Query("""
        SELECT COUNT(p)
        FROM Pedido p
        WHERE p.status IN :statuses
        AND p.dataPedido BETWEEN :inicio AND :fim
    """)
    Long totalPedidosConcluidos(
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
        SELECT COUNT(p)
        FROM Pedido p
        WHERE p.empresa.id = :empresaId
        AND p.status IN :statuses
        AND p.dataPedido BETWEEN :inicio AND :fim
    """)
    Long totalPedidosConcluidosPorEmpresa(
            @Param("empresaId") UUID empresaId,
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );


    // =========================
    // 📈 VENDAS POR DIA (PERFORMANCE)
    // =========================
    @Query("""
        SELECT FUNCTION('DATE', p.dataPedido),
               COALESCE(SUM(p.valorTotalPedido), 0)
        FROM Pedido p
        WHERE p.status IN :statuses
        AND p.dataPedido BETWEEN :inicio AND :fim
        GROUP BY FUNCTION('DATE', p.dataPedido)
        ORDER BY FUNCTION('DATE', p.dataPedido)
    """)
    List<Object[]> vendasPorDia(
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
        SELECT FUNCTION('DATE', p.dataPedido),
               COALESCE(SUM(p.valorTotalPedido), 0)
        FROM Pedido p
        WHERE p.empresa.id = :empresaId
        AND p.status IN :statuses
        AND p.dataPedido BETWEEN :inicio AND :fim
        GROUP BY FUNCTION('DATE', p.dataPedido)
        ORDER BY FUNCTION('DATE', p.dataPedido)
    """)
    List<Object[]> vendasPorDiaPorEmpresa(
            @Param("empresaId") UUID empresaId,
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );


    // =========================
    // 📈 VENDAS POR DIA (POR USUÁRIO)
    // =========================
    @Query("""
        SELECT FUNCTION('DATE', p.dataPedido),
               COALESCE(SUM(p.valorTotalPedido), 0)
        FROM Pedido p
        WHERE p.status IN :statuses
        AND p.usuario.id = :usuarioId
        AND p.dataPedido BETWEEN :inicio AND :fim
        GROUP BY FUNCTION('DATE', p.dataPedido)
        ORDER BY FUNCTION('DATE', p.dataPedido)
    """)
    List<Object[]> vendasPorDiaUsuario(
            @Param("usuarioId") UUID usuarioId,
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
        SELECT FUNCTION('DATE', p.dataPedido),
               COALESCE(SUM(p.valorTotalPedido), 0)
        FROM Pedido p
        WHERE p.empresa.id = :empresaId
        AND p.status IN :statuses
        AND p.usuario.id = :usuarioId
        AND p.dataPedido BETWEEN :inicio AND :fim
        GROUP BY FUNCTION('DATE', p.dataPedido)
        ORDER BY FUNCTION('DATE', p.dataPedido)
    """)
    List<Object[]> vendasPorDiaUsuarioPorEmpresa(
            @Param("empresaId") UUID empresaId,
            @Param("usuarioId") UUID usuarioId,
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );


    // =========================
    // 🏆 RANKING PRODUTOS (COM VALOR)
    // =========================
    @Query("""
        SELECT i.produto.nomeProduto,
               SUM(i.quantidade),
               SUM(i.quantidade * i.precoUnit)
        FROM ItemPedido i
        WHERE i.pedido.status IN :statuses
        AND i.pedido.dataPedido BETWEEN :inicio AND :fim
        GROUP BY i.produto.nomeProduto
        ORDER BY SUM(i.quantidade) DESC
    """)
    List<Object[]> rankingProdutos(
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            Pageable pageable
    );

    @Query("""
        SELECT i.produto.nomeProduto,
               SUM(i.quantidade),
               SUM(i.quantidade * i.precoUnit)
        FROM ItemPedido i
        WHERE i.pedido.empresa.id = :empresaId
        AND i.pedido.status IN :statuses
        AND i.pedido.dataPedido BETWEEN :inicio AND :fim
        GROUP BY i.produto.nomeProduto
        ORDER BY SUM(i.quantidade) DESC
    """)
    List<Object[]> rankingProdutosPorEmpresa(
            @Param("empresaId") UUID empresaId,
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            Pageable pageable
    );


    // =========================
    // 💎 VENDAS HOJE
    // =========================
    @Query("""
        SELECT COALESCE(SUM(p.valorTotalPedido), 0)
        FROM Pedido p
        WHERE p.status IN :statuses
        AND FUNCTION('DATE', p.dataPedido) = CURRENT_DATE
    """)
    BigDecimal vendasHoje(@Param("statuses") Collection<StatusPedido> statuses);

    @Query("""
        SELECT COALESCE(SUM(p.valorTotalPedido), 0)
        FROM Pedido p
        WHERE p.empresa.id = :empresaId
        AND p.status IN :statuses
        AND FUNCTION('DATE', p.dataPedido) = CURRENT_DATE
    """)
    BigDecimal vendasHojePorEmpresa(
            @Param("empresaId") UUID empresaId,
            @Param("statuses") Collection<StatusPedido> statuses
    );


    // =========================
    // 💎 TICKET MÉDIO
    // =========================
    @Query("""
        SELECT COALESCE(AVG(p.valorTotalPedido), 0)
        FROM Pedido p
        WHERE p.status = :status
    """)
    BigDecimal ticketMedio(@Param("status") StatusPedido status);


    // =========================
    // 🧾 ÚLTIMOS PEDIDOS
    // =========================
    List<Pedido> findTop10ByOrderByDataPedidoDesc();

    List<Pedido> findTop10ByEmpresaIdOrderByDataPedidoDesc(UUID empresaId);

    List<Pedido> findByTipoEntrega(TipoEntrega tipoEntrega);


    // =========================
    // 🧑‍💼 TOTAL POR USUÁRIO
    // =========================
    @Query("""
        SELECT COUNT(p)
        FROM Pedido p
        WHERE p.usuario.id = :usuarioId
    """)
    Long totalPedidosPorUsuario(@Param("usuarioId") UUID usuarioId);

    @Query("""
        SELECT COUNT(p)
        FROM Pedido p
        WHERE p.usuario.id = :usuarioId
        AND p.status IN :statuses
        AND p.dataPedido BETWEEN :inicio AND :fim
    """)
    Long totalPedidosPorUsuario(
            @Param("usuarioId") UUID usuarioId,
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
        SELECT COUNT(p)
        FROM Pedido p
        WHERE p.empresa.id = :empresaId
        AND p.usuario.id = :usuarioId
        AND p.status IN :statuses
        AND p.dataPedido BETWEEN :inicio AND :fim
    """)
    Long totalPedidosPorUsuarioEmpresa(
            @Param("empresaId") UUID empresaId,
            @Param("usuarioId") UUID usuarioId,
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
    SELECT COALESCE(SUM(p.valorTotalPedido), 0)
    FROM Pedido p
    WHERE p.usuario.id = :usuarioId
    AND p.status IN :statuses
    AND p.dataPedido BETWEEN :inicio AND :fim
""")
    BigDecimal receitaPorUsuario(
            @Param("usuarioId") UUID usuarioId,
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
    SELECT COALESCE(SUM(p.valorTotalPedido), 0)
    FROM Pedido p
    WHERE p.empresa.id = :empresaId
    AND p.usuario.id = :usuarioId
    AND p.status IN :statuses
    AND p.dataPedido BETWEEN :inicio AND :fim
""")
    BigDecimal receitaPorUsuarioEmpresa(
            @Param("empresaId") UUID empresaId,
            @Param("usuarioId") UUID usuarioId,
            @Param("statuses") Collection<StatusPedido> statuses,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}
