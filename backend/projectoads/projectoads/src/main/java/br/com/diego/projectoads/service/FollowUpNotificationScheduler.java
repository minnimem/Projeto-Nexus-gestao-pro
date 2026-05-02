package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.StatusFollowUpCobranca;
import br.com.diego.projectoads.model.FollowUpCobranca;
import br.com.diego.projectoads.model.FollowUpComercial;
import br.com.diego.projectoads.repository.FollowUpCobrancaRepository;
import br.com.diego.projectoads.repository.FollowUpComercialRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FollowUpNotificationScheduler {

    private final FollowUpCobrancaRepository cobrancaRepository;
    private final FollowUpComercialRepository comercialRepository;
    private final ExternalNotificationService notificationService;
    private final AuditoriaService auditoriaService;

    public FollowUpNotificationScheduler(FollowUpCobrancaRepository cobrancaRepository,
                                         FollowUpComercialRepository comercialRepository,
                                         ExternalNotificationService notificationService,
                                         AuditoriaService auditoriaService) {
        this.cobrancaRepository = cobrancaRepository;
        this.comercialRepository = comercialRepository;
        this.notificationService = notificationService;
        this.auditoriaService = auditoriaService;
    }

    @Scheduled(cron = "${notifications.follow-up-cron:0 0 8 * * *}")
    @Transactional
    public FollowUpNotificationResult enviarFollowUpsPendentes() {
        if (!notificationService.ativo()) {
            return new FollowUpNotificationResult(false, 0, 0);
        }

        LocalDate hoje = LocalDate.now();
        List<FollowUpCobranca> cobrancas = cobrancaRepository
                .findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                        StatusFollowUpCobranca.PENDENTE,
                        hoje
                );
        List<FollowUpComercial> comerciais = comercialRepository
                .findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                        StatusFollowUpCobranca.PENDENTE,
                        hoje
                );

        cobrancas.forEach(this::notificarCobranca);
        comerciais.forEach(this::notificarComercial);
        return new FollowUpNotificationResult(true, cobrancas.size(), comerciais.size());
    }

    private void notificarCobranca(FollowUpCobranca followUp) {
        notificationService.enviarFollowUpCobranca(followUp);
        followUp.setNotificacaoExternaEm(LocalDateTime.now());
        cobrancaRepository.save(followUp);
        auditoriaService.registrar("Financeiro", "NOTIFICAR_FOLLOW_UP_COBRANCA", "Notificacao externa de cobranca enviada", followUp.getId());
    }

    private void notificarComercial(FollowUpComercial followUp) {
        notificationService.enviarFollowUpComercial(followUp);
        followUp.setNotificacaoExternaEm(LocalDateTime.now());
        comercialRepository.save(followUp);
        auditoriaService.registrar("Pedidos", "NOTIFICAR_FOLLOW_UP_COMERCIAL", "Notificacao externa comercial enviada", followUp.getId());
    }

    public record FollowUpNotificationResult(
            boolean ativo,
            int cobrancasEnviadas,
            int comerciaisEnviadas
    ) {
        public int totalEnviado() {
            return cobrancasEnviadas + comerciaisEnviadas;
        }
    }
}
