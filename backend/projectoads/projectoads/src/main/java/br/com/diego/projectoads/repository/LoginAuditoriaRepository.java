package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.LoginAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginAuditoriaRepository extends JpaRepository<LoginAuditoria, Long> {
}