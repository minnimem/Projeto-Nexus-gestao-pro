package br.com.diego.projectoads.service;

import br.com.diego.projectoads.config.Enum.MetodoPagamento;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.Cliente;
import br.com.diego.projectoads.model.Financeiro;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AsaasPaymentGatewayService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final boolean enabled;
    private final String apiKey;
    private final String baseUrl;

    public AsaasPaymentGatewayService(ObjectMapper objectMapper,
                                      @Value("${asaas.enabled:false}") boolean enabled,
                                      @Value("${asaas.api-key:}") String apiKey,
                                      @Value("${asaas.base-url:https://api-sandbox.asaas.com/v3}") String baseUrl) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        this.enabled = enabled;
        this.apiKey = apiKey;
        this.baseUrl = limparBaseUrl(baseUrl);
    }

    public boolean isEnabled() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }

    public Optional<AsaasChargeResult> criarCobranca(Financeiro financeiro) {
        if (!isEnabled()) {
            return Optional.empty();
        }

        if (financeiro == null || financeiro.getPedido() == null || financeiro.getPedido().getCliente() == null) {
            throw new BusinessException("Cliente do pedido obrigatorio para gerar cobranca no Asaas.");
        }

        Cliente cliente = financeiro.getPedido().getCliente();
        String customerId = garantirCliente(cliente);
        JsonNode payment = criarPagamento(financeiro, customerId);
        String paymentId = text(payment, "id");

        if (paymentId == null || paymentId.isBlank()) {
            throw new BusinessException("Asaas nao retornou o ID da cobranca.");
        }

        String pixPayload = null;
        String pixQrCodeDataUrl = null;
        String boletoLinhaDigitavel = null;
        String boletoNumeroDocumento = text(payment, "nossoNumero");
        String boletoNossoNumero = text(payment, "nossoNumero");

        if (MetodoPagamento.PIX.equals(financeiro.getMetodoPagamento())) {
            JsonNode pix = get("/payments/" + paymentId + "/pixQrCode");
            pixPayload = firstText(pix, "payload", "encodedImage");
            String encodedImage = text(pix, "encodedImage");
            if (encodedImage != null && !encodedImage.isBlank()) {
                pixQrCodeDataUrl = encodedImage.startsWith("data:")
                        ? encodedImage
                        : "data:image/png;base64," + encodedImage;
            }
        }

        if (MetodoPagamento.BOLETO.equals(financeiro.getMetodoPagamento())) {
            JsonNode identification = get("/payments/" + paymentId + "/identificationField");
            boletoLinhaDigitavel = firstText(identification, "identificationField", "linhaDigitavel", "barCode");
            boletoNumeroDocumento = firstText(identification, "nossoNumero", "barCode", "identificationField");
            boletoNossoNumero = firstText(identification, "nossoNumero", "identificationField");
        }

        return Optional.of(new AsaasChargeResult(
                paymentId,
                pixPayload,
                pixQrCodeDataUrl,
                boletoLinhaDigitavel,
                boletoNumeroDocumento,
                boletoNossoNumero,
                firstText(payment, "invoiceUrl", "bankSlipUrl", "transactionReceiptUrl")
        ));
    }

    private String garantirCliente(Cliente cliente) {
        if (cliente.getAsaasCustomerId() != null && !cliente.getAsaasCustomerId().isBlank()) {
            return cliente.getAsaasCustomerId();
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", cliente.getNome());
        body.put("cpfCnpj", somenteDigitos(cliente.getCpf()));
        body.put("email", cliente.getEmail());
        body.put("phone", somenteDigitos(cliente.getTelefone()));
        body.put("externalReference", cliente.getIdCliente() != null ? cliente.getIdCliente().toString() : null);

        JsonNode response = post("/customers", body);
        String id = text(response, "id");
        if (id == null || id.isBlank()) {
            throw new BusinessException("Asaas nao retornou o ID do cliente.");
        }

        cliente.setAsaasCustomerId(id);
        return id;
    }

    private JsonNode criarPagamento(Financeiro financeiro, String customerId) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("customer", customerId);
        body.put("billingType", MetodoPagamento.BOLETO.equals(financeiro.getMetodoPagamento()) ? "BOLETO" : "PIX");
        body.put("value", financeiro.getValor().setScale(2, RoundingMode.HALF_UP));
        body.put("dueDate", financeiro.getDataVencimento() != null ? financeiro.getDataVencimento() : LocalDate.now().plusDays(3));
        body.put("description", financeiro.getDescricao());
        body.put("externalReference", financeiro.getCodigoCobranca());

        return post("/payments", body);
    }

    private JsonNode post(String path, Map<String, Object> body) {
        try {
            String json = objectMapper.writeValueAsString(body);
            HttpRequest request = baseRequest(path)
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            return send(request);
        } catch (IOException e) {
            throw new BusinessException("Erro ao montar requisicao Asaas: " + e.getMessage());
        }
    }

    private JsonNode get(String path) {
        HttpRequest request = baseRequest(path)
                .GET()
                .build();
        return send(request);
    }

    private HttpRequest.Builder baseRequest(String path) {
        return HttpRequest.newBuilder(URI.create(baseUrl + path))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("User-Agent", "NexusGestaoPro/1.0")
                .header("access_token", apiKey);
    }

    private JsonNode send(HttpRequest request) {
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException("Asaas retornou erro " + response.statusCode() + ": " + limitar(response.body(), 260));
            }
            return objectMapper.readTree(response.body());
        } catch (IOException e) {
            throw new BusinessException("Erro de comunicacao com Asaas: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("Comunicacao com Asaas interrompida.");
        }
    }

    private String text(JsonNode node, String field) {
        JsonNode value = node != null ? node.get(field) : null;
        return value == null || value.isNull() ? null : value.asText();
    }

    private String firstText(JsonNode node, String... fields) {
        for (String field : fields) {
            String value = text(node, field);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private String somenteDigitos(String value) {
        return value == null ? null : value.replaceAll("\\D", "");
    }

    private String limparBaseUrl(String value) {
        String clean = value == null || value.isBlank() ? "https://api-sandbox.asaas.com/v3" : value.trim();
        return clean.endsWith("/") ? clean.substring(0, clean.length() - 1) : clean;
    }

    private String limitar(String value, int max) {
        if (value == null || value.length() <= max) {
            return value;
        }
        return value.substring(0, max);
    }

    public record AsaasChargeResult(
            String externalId,
            String pixPayload,
            String pixQrCodeDataUrl,
            String boletoLinhaDigitavel,
            String boletoNumeroDocumento,
            String boletoNossoNumero,
            String paymentUrl
    ) {}
}
