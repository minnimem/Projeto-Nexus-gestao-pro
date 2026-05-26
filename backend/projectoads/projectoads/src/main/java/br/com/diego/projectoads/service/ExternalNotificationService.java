package br.com.diego.projectoads.service;

import br.com.diego.projectoads.dto.EstoqueBaixoResponse;
import br.com.diego.projectoads.model.FollowUpCobranca;
import br.com.diego.projectoads.model.FollowUpComercial;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ExternalNotificationService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final boolean enabled;
    private final String webhookUrl;
    private final String token;

    public ExternalNotificationService(ObjectMapper objectMapper,
                                       @Value("${notifications.enabled:false}") boolean enabled,
                                       @Value("${notifications.webhook-url:}") String webhookUrl,
                                       @Value("${notifications.token:}") String token) {
        this.objectMapper = objectMapper;
        this.enabled = enabled;
        this.webhookUrl = webhookUrl;
        this.token = token;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
    }

    public boolean ativo() {
        return enabled && webhookUrl != null && !webhookUrl.isBlank();
    }

    public boolean habilitado() {
        return enabled;
    }

    public boolean webhookConfigurado() {
        return webhookUrl != null && !webhookUrl.isBlank();
    }

    public boolean tokenConfigurado() {
        return token != null && !token.isBlank();
    }

    public String destinoMascarado() {
        if (!webhookConfigurado()) {
            return null;
        }
        try {
            URI uri = URI.create(webhookUrl);
            String port = uri.getPort() > 0 ? ":" + uri.getPort() : "";
            return uri.getScheme() + "://" + uri.getHost() + port + "/...";
        } catch (Exception ignored) {
            return "URL configurada";
        }
    }

    public void enviarFollowUpCobranca(FollowUpCobranca followUp) {
        if (!ativo() || followUp == null) {
            return;
        }

        Map<String, Object> payload = payloadBase("COBRANCA", followUp.getId(), followUp.getClienteNome(),
                followUp.getCanal(), followUp.getProximaAcao(), followUp.getObservacao());
        if (followUp.getFinanceiro() != null) {
            payload.put("financeiroId", followUp.getFinanceiro().getId());
            payload.put("descricao", followUp.getFinanceiro().getDescricao());
            payload.put("valor", followUp.getFinanceiro().getValor());
            payload.put("vencimento", followUp.getFinanceiro().getDataVencimento());
        }
        if (followUp.getFilial() != null) {
            payload.put("filial", followUp.getFilial().getNome());
        }

        enviar(payload);
    }

    public void enviarFollowUpComercial(FollowUpComercial followUp) {
        enviarFollowUpComercial(followUp, null, null);
    }

    public void enviarFollowUpComercial(FollowUpComercial followUp, String canalConfigurado, String regraAutomacao) {
        if (!ativo() || followUp == null) {
            return;
        }

        BigDecimal valor = followUp.getPedido() != null ? followUp.getPedido().getValorTotalPedido() : null;
        Map<String, Object> payload = payloadBase("COMERCIAL", followUp.getId(), followUp.getClienteNome(),
                canalConfigurado != null && !canalConfigurado.isBlank() ? canalConfigurado : followUp.getCanal(),
                followUp.getProximaAcao(), followUp.getObservacao());
        if (regraAutomacao != null && !regraAutomacao.isBlank()) {
            payload.put("regraAutomacao", regraAutomacao);
        }
        if (followUp.getPedido() != null) {
            payload.put("pedidoId", followUp.getPedido().getId());
            payload.put("pedidoNumero", followUp.getPedido().getNumero());
            payload.put("pedidoStatus", followUp.getPedido().getStatus());
            payload.put("valor", valor);
        }
        if (followUp.getFilial() != null) {
            payload.put("filial", followUp.getFilial().getNome());
        }
        payload.put("assunto", assuntoComercial(regraAutomacao));
        payload.put("mensagem", mensagemComercial(followUp, regraAutomacao, valor));

        enviar(payload);
    }

    public void enviarEstoqueBaixo(List<EstoqueBaixoResponse> itens) {
        if (!ativo() || itens == null || itens.isEmpty()) {
            return;
        }

        List<Map<String, Object>> produtos = itens.stream()
                .map(item -> {
                    Map<String, Object> produto = new LinkedHashMap<>();
                    produto.put("produtoId", item.produtoId);
                    produto.put("produto", item.produto);
                    produto.put("quantidadeAtual", item.quantidadeAtual);
                    produto.put("estoqueMinimo", item.estoqueMinimo);
                    produto.put("qtaMaximo", item.qtaMaximo);
                    produto.put("localizacao", item.localizacao);
                    return produto;
                })
                .toList();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("origem", "NEXUS_ONE");
        payload.put("evento", "ESTOQUE_BAIXO");
        payload.put("tipo", "ESTOQUE");
        payload.put("data", LocalDate.now());
        payload.put("totalItens", produtos.size());
        payload.put("itens", produtos);
        enviar(payload);
    }

    public void enviarResumoDiario(Map<String, Object> resumo) {
        if (!ativo() || resumo == null || resumo.isEmpty()) {
            return;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("origem", "NEXUS_ONE");
        payload.put("evento", "RESUMO_DIARIO");
        payload.put("tipo", "RELATORIO");
        payload.put("data", LocalDate.now());
        payload.put("resumo", resumo);
        enviar(payload);
    }

    private Map<String, Object> payloadBase(String tipo, UUID id, String cliente, String canal,
                                            LocalDate proximaAcao, String observacao) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("origem", "NEXUS_ONE");
        payload.put("evento", "FOLLOW_UP_VENCIDO_OU_HOJE");
        payload.put("tipo", tipo);
        payload.put("id", id);
        payload.put("cliente", cliente);
        payload.put("canal", canal);
        payload.put("proximaAcao", proximaAcao != null ? String.valueOf(proximaAcao) : null);
        payload.put("observacao", observacao);
        return payload;
    }

    private String assuntoComercial(String regraAutomacao) {
        if ("ALTO_VALOR_ABERTO".equals(regraAutomacao)) {
            return "Oportunidade de alto valor";
        }
        if ("SEM_PROXIMA_ACAO".equals(regraAutomacao)) {
            return "Oportunidade sem proxima acao";
        }
        if ("FOLLOW_UP_VENCIDO".equals(regraAutomacao)) {
            return "Follow-up comercial vencido";
        }
        return "Follow-up comercial de hoje";
    }

    private String mensagemComercial(FollowUpComercial followUp, String regraAutomacao, BigDecimal valor) {
        String cliente = textoOuPadrao(followUp.getClienteNome(), "Cliente nao informado");
        String pedido = followUp.getPedido() != null
                ? textoOuPadrao(followUp.getPedido().getNumero(), String.valueOf(followUp.getPedido().getId()))
                : "pedido nao informado";
        String proximaAcao = followUp.getProximaAcao() != null ? String.valueOf(followUp.getProximaAcao()) : "sem data definida";
        String observacao = textoOuPadrao(followUp.getObservacao(), "sem observacao");
        return assuntoComercial(regraAutomacao)
                + ": cliente " + cliente
                + ", pedido " + pedido
                + ", valor " + formatarValor(valor)
                + ", proxima acao " + proximaAcao
                + ". Observacao: " + observacao + ".";
    }

    private String formatarValor(BigDecimal valor) {
        if (valor == null) {
            return "nao informado";
        }
        return "R$ " + valor.setScale(2, RoundingMode.HALF_UP);
    }

    private String textoOuPadrao(String valor, String padrao) {
        return valor == null || valor.isBlank() ? padrao : valor.trim();
    }

    private void enviar(Map<String, Object> payload) {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(webhookUrl))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)));

            if (token != null && !token.isBlank()) {
                builder.header("X-Nexus-Token", token);
            }

            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Webhook de notificacao retornou status " + response.statusCode());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Envio de notificacao interrompido.", e);
        } catch (Exception e) {
            throw new IllegalStateException("Erro ao enviar notificacao externa: " + e.getMessage(), e);
        }
    }
}
