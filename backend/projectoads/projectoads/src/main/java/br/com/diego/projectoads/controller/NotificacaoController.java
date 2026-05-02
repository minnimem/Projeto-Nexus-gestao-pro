package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.service.EstoqueNotificationScheduler;
import br.com.diego.projectoads.service.FollowUpNotificationScheduler;
import br.com.diego.projectoads.service.DailySummaryNotificationScheduler;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {

    private final FollowUpNotificationScheduler followUpNotificationScheduler;
    private final EstoqueNotificationScheduler estoqueNotificationScheduler;
    private final DailySummaryNotificationScheduler dailySummaryNotificationScheduler;

    public NotificacaoController(FollowUpNotificationScheduler followUpNotificationScheduler,
                                 EstoqueNotificationScheduler estoqueNotificationScheduler,
                                 DailySummaryNotificationScheduler dailySummaryNotificationScheduler) {
        this.followUpNotificationScheduler = followUpNotificationScheduler;
        this.estoqueNotificationScheduler = estoqueNotificationScheduler;
        this.dailySummaryNotificationScheduler = dailySummaryNotificationScheduler;
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
