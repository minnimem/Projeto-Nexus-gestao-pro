package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.service.FinanceiroService;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class AsaasWebhookControllerTest {

    @Test
    void deveProcessarEventoComTokenValido() {
        FinanceiroService financeiroService = mock(FinanceiroService.class);
        AsaasWebhookController controller = new AsaasWebhookController(financeiroService, "token-teste");

        controller.receber("token-teste", Map.of(
                "event", "PAYMENT_RECEIVED",
                "payment", Map.of("id", "pay_123")
        ));

        verify(financeiroService).processarWebhookAsaas("PAYMENT_RECEIVED", "pay_123");
    }

    @Test
    void deveRejeitarTokenInvalido() {
        FinanceiroService financeiroService = mock(FinanceiroService.class);
        AsaasWebhookController controller = new AsaasWebhookController(financeiroService, "token-teste");

        assertThrows(BusinessException.class, () -> controller.receber("token-errado", Map.of(
                "event", "PAYMENT_RECEIVED",
                "payment", Map.of("id", "pay_123")
        )));

        verifyNoInteractions(financeiroService);
    }

    @Test
    void devePermitirWebhookSemTokenConfigurado() {
        FinanceiroService financeiroService = mock(FinanceiroService.class);
        AsaasWebhookController controller = new AsaasWebhookController(financeiroService, "");

        controller.receber(null, Map.of(
                "event", "PAYMENT_REFUNDED",
                "payment", Map.of("id", "pay_456")
        ));

        verify(financeiroService).processarWebhookAsaas("PAYMENT_REFUNDED", "pay_456");
    }
}
