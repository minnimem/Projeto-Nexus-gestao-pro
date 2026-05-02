package br.com.diego.projectoads.service;

import br.com.diego.projectoads.dto.EstoqueBaixoResponse;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstoqueNotificationScheduler {

    private final EstoqueService estoqueService;
    private final ExternalNotificationService notificationService;
    private final AuditoriaService auditoriaService;

    public EstoqueNotificationScheduler(EstoqueService estoqueService,
                                        ExternalNotificationService notificationService,
                                        AuditoriaService auditoriaService) {
        this.estoqueService = estoqueService;
        this.notificationService = notificationService;
        this.auditoriaService = auditoriaService;
    }

    @Scheduled(cron = "${notifications.stock-cron:0 15 8 * * *}")
    public EstoqueNotificationResult enviarEstoqueBaixo() {
        if (!notificationService.ativo()) {
            return new EstoqueNotificationResult(false, 0);
        }

        List<EstoqueBaixoResponse> itens = estoqueService.estoqueBaixo();
        if (itens.isEmpty()) {
            return new EstoqueNotificationResult(true, 0);
        }

        notificationService.enviarEstoqueBaixo(itens);
        auditoriaService.registrar("Estoque", "NOTIFICAR_ESTOQUE_BAIXO", "Notificacao externa de estoque baixo enviada", null);
        return new EstoqueNotificationResult(true, itens.size());
    }

    public record EstoqueNotificationResult(
            boolean ativo,
            int itensEnviados
    ) {
    }
}
