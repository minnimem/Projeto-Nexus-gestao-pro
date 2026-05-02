package br.com.diego.projectoads.controller;

import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.service.FinanceiroService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/webhooks/asaas")
public class AsaasWebhookController {

    private final FinanceiroService financeiroService;
    private final String webhookToken;

    public AsaasWebhookController(FinanceiroService financeiroService,
                                  @Value("${asaas.webhook-token:}") String webhookToken) {
        this.financeiroService = financeiroService;
        this.webhookToken = webhookToken;
    }

    @PostMapping
    public ResponseEntity<Void> receber(
            @RequestHeader(value = "asaas-access-token", required = false) String token,
            @RequestBody Map<String, Object> payload
    ) {
        validarToken(token);
        financeiroService.processarWebhookAsaas(
                texto(payload.get("event")),
                paymentId(payload)
        );
        return ResponseEntity.ok().build();
    }

    private void validarToken(String token) {
        if (webhookToken == null || webhookToken.isBlank()) {
            return;
        }

        if (token == null || !webhookToken.equals(token)) {
            throw new BusinessException("Webhook Asaas nao autorizado.");
        }
    }

    @SuppressWarnings("unchecked")
    private String paymentId(Map<String, Object> payload) {
        Object payment = payload.get("payment");
        if (payment instanceof Map<?, ?> map) {
            return texto(((Map<String, Object>) map).get("id"));
        }
        return null;
    }

    private String texto(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
