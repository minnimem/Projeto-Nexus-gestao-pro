package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Estoque;
import br.com.diego.projectoads.model.Fornecedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface FornecedorRepository extends JpaRepository <Fornecedor, UUID> {

    boolean existsByDocumentoAndIdNot(String documento, UUID id);

    boolean existsByDocumento(String documento);

    @Query("""
    SELECT e FROM Estoque e
    WHERE e.quantidade > 0
""")
    List<Estoque> buscarDisponiveis();
}
