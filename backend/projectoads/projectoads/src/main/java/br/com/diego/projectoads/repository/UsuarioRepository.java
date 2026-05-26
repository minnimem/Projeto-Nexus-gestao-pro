package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    Optional<Usuario> findByLoginIgnoreCase(String login);

    long countByEmpresaIdAndAtivoTrue(UUID empresaId);

}
