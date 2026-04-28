package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.MovimentoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MovimentoEstoqueRepository
        extends JpaRepository<MovimentoEstoque, UUID> {
}