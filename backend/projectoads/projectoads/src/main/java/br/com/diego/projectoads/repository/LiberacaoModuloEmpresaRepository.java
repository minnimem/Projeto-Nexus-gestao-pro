package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.ModuloPlano;
import br.com.diego.projectoads.model.LiberacaoModuloEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LiberacaoModuloEmpresaRepository extends JpaRepository<LiberacaoModuloEmpresa, UUID> {
    List<LiberacaoModuloEmpresa> findByEmpresaIdOrderByModuloAsc(UUID empresaId);

    Optional<LiberacaoModuloEmpresa> findByEmpresaIdAndModulo(UUID empresaId, ModuloPlano modulo);
}
