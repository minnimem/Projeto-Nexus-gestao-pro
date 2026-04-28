package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.StatusPedido;
import br.com.diego.projectoads.model.Pedido;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

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
        WHERE p.status = :status
        AND p.dataPedido BETWEEN :inicio AND :fim
    """)
    BigDecimal receitaPorPeriodo(
            @Param("status") StatusPedido status,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );


    // =========================
    // 📦 TOTAL POR STATUS
    // =========================
    long countByStatus(StatusPedido status);


    // =========================
    // 📊 TOTAL CONCLUÍDOS
    // =========================
    @Query("""
        SELECT COUNT(p)
        FROM Pedido p
        WHERE p.status = :status
    """)
    Long totalPedidosConcluidos(@Param("status") StatusPedido status);


    // =========================
    // 📈 VENDAS POR DIA (PERFORMANCE)
    // =========================
    @Query("""
        SELECT FUNCTION('DATE', p.dataPedido),
               COALESCE(SUM(p.valorTotalPedido), 0)
        FROM Pedido p
        WHERE p.status = :status
        AND p.dataPedido BETWEEN :inicio AND :fim
        GROUP BY FUNCTION('DATE', p.dataPedido)
        ORDER BY FUNCTION('DATE', p.dataPedido)
    """)
    List<Object[]> vendasPorDia(
            @Param("status") StatusPedido status,
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
        WHERE p.status = :status
        AND p.usuario.id = :usuarioId
        AND p.dataPedido BETWEEN :inicio AND :fim
        GROUP BY FUNCTION('DATE', p.dataPedido)
        ORDER BY FUNCTION('DATE', p.dataPedido)
    """)
    List<Object[]> vendasPorDiaUsuario(
            @Param("usuarioId") UUID usuarioId,
            @Param("status") StatusPedido status,
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
        WHERE i.pedido.status = :status
        AND i.pedido.dataPedido BETWEEN :inicio AND :fim
        GROUP BY i.produto.nomeProduto
        ORDER BY SUM(i.quantidade) DESC
    """)
    List<Object[]> rankingProdutos(
            @Param("status") StatusPedido status,
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
        WHERE p.status = :status
        AND FUNCTION('DATE', p.dataPedido) = CURRENT_DATE
    """)
    BigDecimal vendasHoje(@Param("status") StatusPedido status);


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
    SELECT COALESCE(SUM(p.valorTotalPedido), 0)
    FROM Pedido p
    WHERE p.usuario.id = :usuarioId
    AND p.status = :status
    AND p.dataPedido BETWEEN :inicio AND :fim
""")
    BigDecimal receitaPorUsuario(
            @Param("usuarioId") UUID usuarioId,
            @Param("status") StatusPedido status,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}
