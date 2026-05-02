package br.com.diego.projectoads.repository;

import br.com.diego.projectoads.config.Enum.StatusFollowUpCobranca;
import br.com.diego.projectoads.model.FollowUpCobranca;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface FollowUpCobrancaRepository extends JpaRepository<FollowUpCobranca, UUID> {

    List<FollowUpCobranca> findTop100ByOrderByProximaAcaoAscCriadoEmDesc();

    List<FollowUpCobranca> findByStatusAndProximaAcaoLessThanEqualOrderByProximaAcaoAscCriadoEmDesc(
            StatusFollowUpCobranca status,
            LocalDate data
    );

    List<FollowUpCobranca> findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
            StatusFollowUpCobranca status,
            LocalDate data
    );
}
