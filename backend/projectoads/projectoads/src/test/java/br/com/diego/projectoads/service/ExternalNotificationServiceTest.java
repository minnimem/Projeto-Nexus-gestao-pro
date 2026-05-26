package br.com.diego.projectoads.service;

import br.com.diego.projectoads.model.FollowUpComercial;
import br.com.diego.projectoads.model.Pedido;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ExternalNotificationServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void deveEnviarMensagemComercialProntaNoPayload() throws Exception {
        AtomicReference<String> body = new AtomicReference<>();
        AtomicReference<String> token = new AtomicReference<>();
        HttpServer server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/nexus-notifications", exchange -> {
            token.set(exchange.getRequestHeaders().getFirst("X-Nexus-Token"));
            body.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
        });
        server.start();

        try {
            String url = "http://localhost:" + server.getAddress().getPort() + "/nexus-notifications";
            ExternalNotificationService service = new ExternalNotificationService(objectMapper, true, url, "token-local");
            Pedido pedido = new Pedido();
            pedido.setNumero("PED-123");
            pedido.setValorTotalPedido(BigDecimal.valueOf(1500));
            FollowUpComercial followUp = new FollowUpComercial();
            followUp.setPedido(pedido);
            followUp.setClienteNome("Rebeka Gomes");
            followUp.setProximaAcao(LocalDate.of(2026, 5, 9));
            followUp.setObservacao("Retomar proposta enviada.");

            service.enviarFollowUpComercial(followUp, "WHATSAPP", "ALTO_VALOR_ABERTO");

            Map<String, Object> payload = objectMapper.readValue(body.get(), new TypeReference<>() {});
            assertEquals("token-local", token.get());
            assertEquals("COMERCIAL", payload.get("tipo"));
            assertEquals("WHATSAPP", payload.get("canal"));
            assertEquals("ALTO_VALOR_ABERTO", payload.get("regraAutomacao"));
            assertEquals("Oportunidade de alto valor", payload.get("assunto"));
            assertTrue(String.valueOf(payload.get("mensagem")).contains("cliente Rebeka Gomes"));
            assertTrue(String.valueOf(payload.get("mensagem")).contains("pedido PED-123"));
            assertTrue(String.valueOf(payload.get("mensagem")).contains("R$ 1500.00"));
        } finally {
            server.stop(0);
        }
    }
}
