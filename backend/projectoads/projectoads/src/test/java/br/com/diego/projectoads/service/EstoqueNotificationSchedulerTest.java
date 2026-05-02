package br.com.diego.projectoads.service;

import br.com.diego.projectoads.dto.EstoqueBaixoResponse;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EstoqueNotificationSchedulerTest {

    private final EstoqueService estoqueService = mock(EstoqueService.class);
    private final ExternalNotificationService notificationService = mock(ExternalNotificationService.class);
    private final AuditoriaService auditoriaService = mock(AuditoriaService.class);
    private final EstoqueNotificationScheduler scheduler = new EstoqueNotificationScheduler(
            estoqueService,
            notificationService,
            auditoriaService
    );

    @Test
    void deveIgnorarQuandoNotificacoesExternasEstaoDesligadas() {
        when(notificationService.ativo()).thenReturn(false);

        EstoqueNotificationScheduler.EstoqueNotificationResult result = scheduler.enviarEstoqueBaixo();

        assertFalse(result.ativo());
        assertEquals(0, result.itensEnviados());
        verify(estoqueService, never()).estoqueBaixo();
        verify(notificationService, never()).enviarEstoqueBaixo(any());
    }

    @Test
    void deveRetornarAtivoSemEnviarQuandoNaoHaEstoqueBaixo() {
        when(notificationService.ativo()).thenReturn(true);
        when(estoqueService.estoqueBaixo()).thenReturn(List.of());

        EstoqueNotificationScheduler.EstoqueNotificationResult result = scheduler.enviarEstoqueBaixo();

        assertTrue(result.ativo());
        assertEquals(0, result.itensEnviados());
        verify(notificationService, never()).enviarEstoqueBaixo(any());
        verify(auditoriaService, never()).registrar(any(), any(), any(), any());
    }

    @Test
    void deveEnviarItensDeEstoqueBaixoERegistrarAuditoria() {
        EstoqueBaixoResponse item = mock(EstoqueBaixoResponse.class);
        List<EstoqueBaixoResponse> itens = List.of(item);
        when(notificationService.ativo()).thenReturn(true);
        when(estoqueService.estoqueBaixo()).thenReturn(itens);

        EstoqueNotificationScheduler.EstoqueNotificationResult result = scheduler.enviarEstoqueBaixo();

        assertTrue(result.ativo());
        assertEquals(1, result.itensEnviados());
        verify(notificationService).enviarEstoqueBaixo(itens);
        verify(auditoriaService).registrar("Estoque", "NOTIFICAR_ESTOQUE_BAIXO", "Notificacao externa de estoque baixo enviada", null);
    }
}
