package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.TipoCategoria;
import br.com.diego.projectoads.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoriaRepository extends JpaRepository <Categoria, UUID> {

    List<Categoria> findByTipoAndAtivoTrueOrderByNomeAsc(TipoCategoria tipo);

    boolean existsByNomeIgnoreCaseAndTipo(String nome, TipoCategoria tipo);

    boolean existsByNomeIgnoreCaseAndTipoAndIdNot(String nome, TipoCategoria tipo, UUID id);
}
