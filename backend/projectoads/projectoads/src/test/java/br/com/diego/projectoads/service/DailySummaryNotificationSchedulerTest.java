package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.config.Enum.StatusPedido;
import br.com.diego.projectoads.config.Enum.TipoFinanceiro;
import br.com.diego.projectoads.repository.FinanceiroRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DailySummaryNotificationSchedulerTest {

    private final PedidoRepository pedidoRepository = mock(PedidoRepository.class);
    private final FinanceiroRepository financeiroRepository = mock(FinanceiroRepository.class);
    private final EstoqueService estoqueService = mock(EstoqueService.class);
    private final ExternalNotificationService notificationService = mock(ExternalNotificationService.class);
    private final AuditoriaService auditoriaService = mock(AuditoriaService.class);
    private final DailySummaryNotificationScheduler scheduler = new DailySummaryNotificationScheduler(
            pedidoRepository,
            financeiroRepository,
            estoqueService,
            notificationService,
            auditoriaService
    );

    @Test
    void deveIgnorarQuandoNotificacoesExternasEstaoDesligadas() {
        when(notificationService.ativo()).thenReturn(false);

        DailySummaryNotificationScheduler.DailySummaryNotificationResult result = scheduler.enviarResumoDiario();

        assertFalse(result.ativo());
        assertEquals(0, result.resumosEnviados());
        verify(notificationService, never()).enviarResumoDiario(any());
        verify(pedidoRepository, never()).receitaPorPeriodo(anyList(), any(), any());
    }

    @Test
    @SuppressWarnings("unchecked")
    void deveMontarEnviarResumoDiarioERegistrarAuditoria() {
        when(notificationService.ativo()).thenReturn(true);
        when(estoqueService.estoqueBaixo()).thenReturn(List.of(mock(br.com.diego.projectoads.dto.EstoqueBaixoResponse.class)));
        when(pedidoRepository.receitaPorPeriodo(anyList(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(new BigDecimal("1500.00"));
        when(pedidoRepository.totalPedidosConcluidos(anyList(), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(7L);
        when(financeiroRepository.somarPorTipoEStatusNoPeriodo(
                eq(TipoFinanceiro.RECEITA),
                eq(StatusPagamento.APROVADO),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(new BigDecimal("1200.00"));
        when(financeiroRepository.somarPorTipoEStatusNoPeriodo(
                eq(TipoFinanceiro.DESPESA),
                eq(StatusPagamento.APROVADO),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(new BigDecimal("300.00"));
        when(financeiroRepository.countByStatusAndDataLancamentoBetween(
                eq(StatusPagamento.PENDENTE),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(2L);

        DailySummaryNotificationScheduler.DailySummaryNotificationResult result = scheduler.enviarResumoDiario();

        assertTrue(result.ativo());
        assertEquals(1, result.resumosEnviados());
        verify(notificationService).enviarResumoDiario(any(Map.class));
        verify(pedidoRepository).receitaPorPeriodo(anyList(), any(LocalDateTime.class), any(LocalDateTime.class));
        verify(financeiroRepository).somarPorTipoEStatusNoPeriodo(
                eq(TipoFinanceiro.RECEITA),
                eq(StatusPagamento.APROVADO),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        );
        verify(auditoriaService).registrar("Relatorios", "NOTIFICAR_RESUMO_DIARIO", "Resumo diario enviado para webhook externo", null);
    }
}
