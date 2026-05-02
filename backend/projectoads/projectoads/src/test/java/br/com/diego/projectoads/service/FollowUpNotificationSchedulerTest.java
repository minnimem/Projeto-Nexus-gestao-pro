package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.StatusFollowUpCobranca;
import br.com.diego.projectoads.model.FollowUpCobranca;
import br.com.diego.projectoads.model.FollowUpComercial;
import br.com.diego.projectoads.repository.FollowUpCobrancaRepository;
import br.com.diego.projectoads.repository.FollowUpComercialRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FollowUpNotificationSchedulerTest {

    private final FollowUpCobrancaRepository cobrancaRepository = mock(FollowUpCobrancaRepository.class);
    private final FollowUpComercialRepository comercialRepository = mock(FollowUpComercialRepository.class);
    private final ExternalNotificationService notificationService = mock(ExternalNotificationService.class);
    private final AuditoriaService auditoriaService = mock(AuditoriaService.class);
    private final FollowUpNotificationScheduler scheduler = new FollowUpNotificationScheduler(
            cobrancaRepository,
            comercialRepository,
            notificationService,
            auditoriaService
    );

    @Test
    void deveIgnorarQuandoNotificacoesExternasEstaoDesligadas() {
        when(notificationService.ativo()).thenReturn(false);

        FollowUpNotificationScheduler.FollowUpNotificationResult result = scheduler.enviarFollowUpsPendentes();

        assertFalse(result.ativo());
        assertEquals(0, result.totalEnviado());
        verify(cobrancaRepository, never())
                .findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(any(), any());
        verify(comercialRepository, never())
                .findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(any(), any());
    }

    @Test
    void deveEnviarFollowUpsPendentesEMarcarNotificacao() {
        FollowUpCobranca cobranca = new FollowUpCobranca();
        FollowUpComercial comercial = new FollowUpComercial();
        when(notificationService.ativo()).thenReturn(true);
        when(cobrancaRepository.findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                eq(StatusFollowUpCobranca.PENDENTE),
                any(LocalDate.class)
        )).thenReturn(List.of(cobranca));
        when(comercialRepository.findByStatusAndProximaAcaoLessThanEqualAndNotificacaoExternaEmIsNullOrderByProximaAcaoAscCriadoEmDesc(
                eq(StatusFollowUpCobranca.PENDENTE),
                any(LocalDate.class)
        )).thenReturn(List.of(comercial));

        FollowUpNotificationScheduler.FollowUpNotificationResult result = scheduler.enviarFollowUpsPendentes();

        assertTrue(result.ativo());
        assertEquals(1, result.cobrancasEnviadas());
        assertEquals(1, result.comerciaisEnviadas());
        assertEquals(2, result.totalEnviado());
        assertNotNull(cobranca.getNotificacaoExternaEm());
        assertNotNull(comercial.getNotificacaoExternaEm());
        verify(notificationService).enviarFollowUpCobranca(cobranca);
        verify(notificationService).enviarFollowUpComercial(comercial);
        verify(cobrancaRepository).save(cobranca);
        verify(comercialRepository).save(comercial);
        verify(auditoriaService).registrar(eq("Financeiro"), eq("NOTIFICAR_FOLLOW_UP_COBRANCA"), any(), any());
        verify(auditoriaService).registrar(eq("Pedidos"), eq("NOTIFICAR_FOLLOW_UP_COMERCIAL"), any(), any());
    }
}
