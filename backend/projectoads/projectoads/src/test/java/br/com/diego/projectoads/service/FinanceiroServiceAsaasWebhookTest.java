package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.StatusPagamento;
import br.com.diego.projectoads.model.Financeiro;
import br.com.diego.projectoads.repository.FilialRepository;
import br.com.diego.projectoads.repository.FinanceiroRepository;
import br.com.diego.projectoads.repository.PedidoRepository;
import br.com.diego.projectoads.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FinanceiroServiceAsaasWebhookTest {

    private final FinanceiroRepository financeiroRepository = mock(FinanceiroRepository.class);
    private final FinanceiroService financeiroService = new FinanceiroService(
            financeiroRepository,
            mock(PedidoRepository.class),
            mock(UsuarioRepository.class),
            mock(FilialRepository.class),
            mock(AuditoriaService.class),
            mock(AsaasPaymentGatewayService.class)
    );

    @Test
    void deveAprovarFinanceiroQuandoPagamentoForRecebido() {
        Financeiro financeiro = financeiroPendente("pay_123");
        when(financeiroRepository.findFirstByCobrancaExternaId("pay_123")).thenReturn(Optional.of(financeiro));

        financeiroService.processarWebhookAsaas("PAYMENT_RECEIVED", "pay_123");

        assertEquals(StatusPagamento.APROVADO, financeiro.getStatus());
        assertNotNull(financeiro.getDataLancamento());
        assertTrue(financeiro.getObservacao().contains("PAYMENT_RECEIVED"));
        verify(financeiroRepository).save(financeiro);
    }

    @Test
    void deveEstornarFinanceiroQuandoPagamentoForReembolsado() {
        Financeiro financeiro = financeiroPendente("pay_456");
        when(financeiroRepository.findFirstByCobrancaExternaId("pay_456")).thenReturn(Optional.of(financeiro));

        financeiroService.processarWebhookAsaas("PAYMENT_REFUNDED", "pay_456");

        assertEquals(StatusPagamento.ESTORNADO, financeiro.getStatus());
        assertTrue(financeiro.getObservacao().contains("PAYMENT_REFUNDED"));
        verify(financeiroRepository).save(financeiro);
    }

    @Test
    void deveCancelarFinanceiroQuandoPagamentoForRemovido() {
        Financeiro financeiro = financeiroPendente("pay_789");
        when(financeiroRepository.findFirstByCobrancaExternaId("pay_789")).thenReturn(Optional.of(financeiro));

        financeiroService.processarWebhookAsaas("PAYMENT_DELETED", "pay_789");

        assertEquals(StatusPagamento.CANCELADO, financeiro.getStatus());
        assertTrue(financeiro.getObservacao().contains("PAYMENT_DELETED"));
        verify(financeiroRepository).save(financeiro);
    }

    @Test
    void deveRegistrarEventoDesconhecidoSemAlterarStatus() {
        Financeiro financeiro = financeiroPendente("pay_000");
        when(financeiroRepository.findFirstByCobrancaExternaId("pay_000")).thenReturn(Optional.of(financeiro));

        financeiroService.processarWebhookAsaas("PAYMENT_BANK_SLIP_VIEWED", "pay_000");

        assertEquals(StatusPagamento.PENDENTE, financeiro.getStatus());
        assertTrue(financeiro.getObservacao().contains("PAYMENT_BANK_SLIP_VIEWED"));
        verify(financeiroRepository).save(financeiro);
    }

    @Test
    void deveIgnorarWebhookSemPaymentId() {
        financeiroService.processarWebhookAsaas("PAYMENT_RECEIVED", "");

        verify(financeiroRepository, never()).findFirstByCobrancaExternaId(any());
        verify(financeiroRepository, never()).save(any());
    }

    private Financeiro financeiroPendente(String externalId) {
        Financeiro financeiro = new Financeiro();
        financeiro.setCobrancaExternaId(externalId);
        financeiro.setDataLancamento(LocalDateTime.now().minusDays(1));
        financeiro.setObservacao("Criado para teste");
        financeiro.setStatus(StatusPagamento.PENDENTE);
        return financeiro;
    }
}
