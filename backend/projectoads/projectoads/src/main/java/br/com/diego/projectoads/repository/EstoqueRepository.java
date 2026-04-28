package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Estoque;
import br.com.diego.projectoads.model.ProdutoEstoqueDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EstoqueRepository extends JpaRepository<Estoque, UUID> {

    Optional<Estoque> findByProdutoIdProduto(UUID idProduto);

    // estoque abaixo do mínimo
    @Query("""
    SELECT e FROM Estoque e
    JOIN FETCH e.produto p
    WHERE p.ativo = true
    AND COALESCE(e.qtaMinimo, 5) > 0
    AND COALESCE(e.quantidade, 0) <= COALESCE(e.qtaMinimo, 5)
    ORDER BY COALESCE(e.quantidade, 0) ASC, p.nomeProduto ASC
""")
    List<Estoque> buscarEstoqueBaixo();

    // produtos com estoque
    @Query("""
    SELECT e FROM Estoque e
    WHERE e.quantidade > 0
""")
    List<Estoque> buscarProdutosComEstoque();

    // 📊 DTO (dashboard)
    @Query("""
    SELECT new br.com.diego.projectoads.model.ProdutoEstoqueDTO(
        p.nomeProduto,
        e.quantidade
    )
    FROM Estoque e
    JOIN e.produto p
    WHERE e.quantidade > 0
""")
    List<ProdutoEstoqueDTO> buscarProdutosComQuantidade();
}

