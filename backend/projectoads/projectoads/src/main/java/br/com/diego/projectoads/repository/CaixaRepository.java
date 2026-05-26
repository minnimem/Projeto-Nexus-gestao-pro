package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.StatusCaixa;
import br.com.diego.projectoads.model.Caixa;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CaixaRepository extends JpaRepository<Caixa, UUID> {

    Optional<Caixa> findFirstByUsuarioAndStatusOrderByDataAberturaDesc(Usuario usuario, StatusCaixa status);

    Optional<Caixa> findFirstByEmpresaAndStatusOrderByDataAberturaDesc(Empresa empresa, StatusCaixa status);

    boolean existsByUsuarioAndStatus(Usuario usuario, StatusCaixa status);

    long countByEmpresaAndStatus(Empresa empresa, StatusCaixa status);

    List<Caixa> findTop50ByEmpresaOrderByDataAberturaDesc(Empresa empresa);
}
