package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.EstoqueMovimentacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EstoqueMovimentacaoRepository extends JpaRepository<EstoqueMovimentacao, UUID> {

    List<EstoqueMovimentacao> findByProdutoIdProduto(UUID produtoId);

}