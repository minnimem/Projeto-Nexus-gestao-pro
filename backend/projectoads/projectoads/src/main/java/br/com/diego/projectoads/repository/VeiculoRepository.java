package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VeiculoRepository extends JpaRepository<Veiculo, UUID> {
    List<Veiculo> findByAtivoTrue();
    boolean existsByPlaca(String placa);
}
