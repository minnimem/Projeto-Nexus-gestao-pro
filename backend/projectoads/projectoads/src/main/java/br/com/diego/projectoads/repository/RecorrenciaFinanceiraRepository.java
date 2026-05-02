package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.model.RecorrenciaFinanceira;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RecorrenciaFinanceiraRepository extends JpaRepository<RecorrenciaFinanceira, UUID> {
    List<RecorrenciaFinanceira> findAllByOrderByAtivoDescProximaGeracaoAscDescricaoAsc();
}
