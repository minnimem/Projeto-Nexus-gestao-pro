package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.service.EstoqueNotificationScheduler;
import br.com.diego.projectoads.service.ExternalNotificationService;
import br.com.diego.projectoads.service.FollowUpNotificationScheduler;
import br.com.diego.projectoads.service.DailySummaryNotificationScheduler;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/notificacoes")
@PreAuthorize("@planoComercialService.canAccessModule(authentication, 'notificacoes')")
public class NotificacaoController {

    private final FollowUpNotificationScheduler followUpNotificationScheduler;
    private final EstoqueNotificationScheduler estoqueNotificationScheduler;
    private final DailySummaryNotificationScheduler dailySummaryNotificationScheduler;
    private final ExternalNotificationService externalNotificationService;

    public NotificacaoController(FollowUpNotificationScheduler followUpNotificationScheduler,
                                  EstoqueNotificationScheduler estoqueNotificationScheduler,
                                  DailySummaryNotificationScheduler dailySummaryNotificationScheduler,
                                  ExternalNotificationService externalNotificationService) {
        this.followUpNotificationScheduler = followUpNotificationScheduler;
        this.estoqueNotificationScheduler = estoqueNotificationScheduler;
        this.dailySummaryNotificationScheduler = dailySummaryNotificationScheduler;
        this.externalNotificationService = externalNotificationService;
    }

    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<Map<String, Object>> status() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("ativo", externalNotificationService.ativo());
        response.put("habilitado", externalNotificationService.habilitado());
        response.put("webhookConfigurado", externalNotificationService.webhookConfigurado());
        response.put("tokenConfigurado", externalNotificationService.tokenConfigurado());
        response.put("destino", externalNotificationService.destinoMascarado());
        response.put("proximaAcao", externalNotificationService.ativo()
                ? "Pronto para enviar notificacoes externas."
                : "Configure NOTIFICATIONS_ENABLED=true e NOTIFICATIONS_WEBHOOK_URL.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/follow-ups/enviar")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<Map<String, Object>> enviarFollowUpsPendentes() {
        FollowUpNotificationScheduler.FollowUpNotificationResult result =
                followUpNotificationScheduler.enviarFollowUpsPendentes();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("ativo", result.ativo());
        response.put("cobrancasEnviadas", result.cobrancasEnviadas());
        response.put("comerciaisEnviadas", result.comerciaisEnviadas());
        response.put("totalEnviado", result.totalEnviado());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/estoque-baixo/enviar")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<Map<String, Object>> enviarEstoqueBaixo() {
        EstoqueNotificationScheduler.EstoqueNotificationResult result =
                estoqueNotificationScheduler.enviarEstoqueBaixo();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("ativo", result.ativo());
        response.put("itensEnviados", result.itensEnviados());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resumo-diario/enviar")
    @PreAuthorize("hasAnyRole('ADMIN','GERENTE')")
    public ResponseEntity<Map<String, Object>> enviarResumoDiario() {
        DailySummaryNotificationScheduler.DailySummaryNotificationResult result =
                dailySummaryNotificationScheduler.enviarResumoDiario();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("ativo", result.ativo());
        response.put("resumosEnviados", result.resumosEnviados());
        return ResponseEntity.ok(response);
    }
}
