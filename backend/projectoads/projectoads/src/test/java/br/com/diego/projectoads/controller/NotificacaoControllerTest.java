package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.service.DailySummaryNotificationScheduler;
import br.com.diego.projectoads.service.EstoqueNotificationScheduler;
import br.com.diego.projectoads.service.ExternalNotificationService;
import br.com.diego.projectoads.service.FollowUpNotificationScheduler;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class NotificacaoControllerTest {

    private final FollowUpNotificationScheduler followUpScheduler = mock(FollowUpNotificationScheduler.class);
    private final EstoqueNotificationScheduler estoqueScheduler = mock(EstoqueNotificationScheduler.class);
    private final DailySummaryNotificationScheduler resumoScheduler = mock(DailySummaryNotificationScheduler.class);
    private final ExternalNotificationService externalNotificationService = mock(ExternalNotificationService.class);
    private final NotificacaoController controller = new NotificacaoController(
            followUpScheduler,
            estoqueScheduler,
            resumoScheduler,
            externalNotificationService
    );

    @Test
    void deveRetornarResumoDoDisparoDeFollowUps() {
        when(followUpScheduler.enviarFollowUpsPendentes())
                .thenReturn(new FollowUpNotificationScheduler.FollowUpNotificationResult(true, 2, 3));

        ResponseEntity<Map<String, Object>> response = controller.enviarFollowUpsPendentes();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("ativo"));
        assertEquals(2, response.getBody().get("cobrancasEnviadas"));
        assertEquals(3, response.getBody().get("comerciaisEnviadas"));
        assertEquals(5, response.getBody().get("totalEnviado"));
    }

    @Test
    void deveRetornarStatusDasNotificacoesExternas() {
        when(externalNotificationService.ativo()).thenReturn(true);
        when(externalNotificationService.habilitado()).thenReturn(true);
        when(externalNotificationService.webhookConfigurado()).thenReturn(true);
        when(externalNotificationService.tokenConfigurado()).thenReturn(true);
        when(externalNotificationService.destinoMascarado()).thenReturn("http://localhost:8099/...");

        ResponseEntity<Map<String, Object>> response = controller.status();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("ativo"));
        assertEquals(true, response.getBody().get("habilitado"));
        assertEquals(true, response.getBody().get("webhookConfigurado"));
        assertEquals(true, response.getBody().get("tokenConfigurado"));
        assertEquals("http://localhost:8099/...", response.getBody().get("destino"));
    }

    @Test
    void deveRetornarResumoDoDisparoDeEstoqueBaixo() {
        when(estoqueScheduler.enviarEstoqueBaixo())
                .thenReturn(new EstoqueNotificationScheduler.EstoqueNotificationResult(true, 4));

        ResponseEntity<Map<String, Object>> response = controller.enviarEstoqueBaixo();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("ativo"));
        assertEquals(4, response.getBody().get("itensEnviados"));
    }

    @Test
    void deveRetornarResumoDoDisparoDeResumoDiario() {
        when(resumoScheduler.enviarResumoDiario())
                .thenReturn(new DailySummaryNotificationScheduler.DailySummaryNotificationResult(true, 1));

        ResponseEntity<Map<String, Object>> response = controller.enviarResumoDiario();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("ativo"));
        assertEquals(1, response.getBody().get("resumosEnviados"));
    }
}
