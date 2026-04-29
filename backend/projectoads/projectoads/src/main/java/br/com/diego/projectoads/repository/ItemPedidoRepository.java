package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.ItemPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ItemPedidoRepository extends JpaRepository<ItemPedido, UUID> {

    @Query("""
        select i
        from ItemPedido i
        left join fetch i.produto
        where i.pedido.id = :pedidoId
    """)
    List<ItemPedido> findByPedidoIdWithProduto(@Param("pedidoId") UUID pedidoId);
}
