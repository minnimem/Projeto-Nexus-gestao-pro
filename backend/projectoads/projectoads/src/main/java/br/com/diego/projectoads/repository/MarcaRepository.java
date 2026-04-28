package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Marca;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MarcaRepository extends JpaRepository <Marca, UUID> {
}
