package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.CompraEstoque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CompraEstoqueRepository extends JpaRepository<CompraEstoque, UUID> {

    List<CompraEstoque> findTop50ByOrderByDataCompraDesc();
}
