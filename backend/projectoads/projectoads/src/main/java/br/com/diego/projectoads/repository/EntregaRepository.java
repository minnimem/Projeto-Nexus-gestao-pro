package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Entrega;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EntregaRepository extends JpaRepository<Entrega, UUID> {
}