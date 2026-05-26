package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProdutoRepository extends JpaRepository<Produto, UUID> {

    @Query("SELECT DISTINCT p FROM Produto p LEFT JOIN FETCH p.estoques WHERE p.ativo = true")
    List<Produto> findByAtivoTrue();

    @Query("""
        SELECT DISTINCT p FROM Produto p
        LEFT JOIN FETCH p.estoques
        WHERE LOWER(p.nomeProduto) LIKE LOWER(CONCAT('%', :nome, '%'))
    """)
    List<Produto> findByNomeProdutoContainingIgnoreCase(@Param("nome") String nome);

    @Query("SELECT p FROM Produto p LEFT JOIN FETCH p.estoques WHERE p.idProduto = :id")
    Optional<Produto> findByIdProdutoWithEstoques(@Param("id") UUID id);

    Optional<Produto> findByNomeProdutoIgnoreCase(String nomeProduto);

    Optional<Produto> findBySkuIgnoreCase(String sku);

    Optional<Produto> findByCodBarras(String codBarras);

    List<Produto> findByCodBarrasStartingWith(String prefixo);
}
