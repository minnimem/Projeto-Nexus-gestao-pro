package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.StatusFollowUpCobranca;
import br.com.diego.projectoads.model.FollowUpComercial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface FollowUpComercialRepository extends JpaRepository<FollowUpComercial, UUID> {

    List<FollowUpComercial> findTop100ByOrderByProximaAcaoAscCriadoEmDesc();

    List<FollowUpComercial> findByStatusAndProximaAcaoLessThanEqualOrderByProximaAcaoAscCriadoEmDesc(
            StatusFollowUpCobranca status,
            LocalDate proximaAcao
    );

    List<FollowUpComercial> findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
            StatusFollowUpCobranca status,
            LocalDate proximaAcao
    );
}
