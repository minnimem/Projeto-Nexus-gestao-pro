package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Component
@ConditionalOnProperty(prefix = "nexus.fiscal", name = "provider", havingValue = "http")
public class HttpFiscalServiceStatusChecker implements FiscalServiceStatusChecker {

    private final RestTemplate restTemplate;
    private final FiscalSecretResolver fiscalSecretResolver;

    public HttpFiscalServiceStatusChecker(RestTemplateBuilder restTemplateBuilder,
                                          FiscalSecretResolver fiscalSecretResolver,
                                          @Value("${nexus.fiscal.http.connect-timeout-ms:3000}") long connectTimeoutMs,
                                          @Value("${nexus.fiscal.http.status-read-timeout-ms:3000}") long readTimeoutMs) {
        this(restTemplateBuilder
                .setConnectTimeout(Duration.ofMillis(connectTimeoutMs))
                .setReadTimeout(Duration.ofMillis(readTimeoutMs))
                .build(), fiscalSecretResolver);
    }

    HttpFiscalServiceStatusChecker(RestTemplate restTemplate, FiscalSecretResolver fiscalSecretResolver) {
        this.restTemplate = restTemplate;
        this.fiscalSecretResolver = fiscalSecretResolver;
    }

    @Override
    public FiscalServiceStatusResult consultar(ConfiguracaoFiscal configuracao) {
        String endpoint = endpointAmbiente(configuracao);
        try {
            ResponseEntity<Void> response = restTemplate.exchange(endpoint, HttpMethod.HEAD, request(configuracao), Void.class);
            return new FiscalServiceStatusResult(
                    response.getStatusCode().is2xxSuccessful() || response.getStatusCode().is3xxRedirection(),
                    "DISPONIVEL_HTTP",
                    "Endpoint fiscal HTTP respondeu a consulta de disponibilidade."
            );
        } catch (BusinessException ex) {
            return new FiscalServiceStatusResult(
                    false,
                    "INDISPONIVEL_HTTP_AUTH",
                    ex.getMessage()
            );
        } catch (HttpStatusCodeException ex) {
            if (ex.getStatusCode().value() == 405) {
                return new FiscalServiceStatusResult(
                        true,
                        "DISPONIVEL_HTTP",
                        "Endpoint fiscal HTTP respondeu, mas nao aceita HEAD; transmissao POST pode ser usada."
                );
            }
            return new FiscalServiceStatusResult(
                    false,
                    "INDISPONIVEL_HTTP",
                    "Endpoint fiscal HTTP retornou " + ex.getStatusCode().value() + "."
            );
        } catch (Exception ex) {
            return new FiscalServiceStatusResult(
                    false,
                    "INDISPONIVEL_HTTP",
                    "Nao foi possivel consultar o endpoint fiscal HTTP: " + ex.getMessage()
            );
        }
    }

    private String endpointAmbiente(ConfiguracaoFiscal configuracao) {
        return configuracao.getAmbiente() == AmbienteFiscal.PRODUCAO
                ? configuracao.getEndpointProducao()
                : configuracao.getEndpointHomologacao();
    }

    private HttpEntity<Void> request(ConfiguracaoFiscal configuracao) {
        HttpHeaders headers = new HttpHeaders();
        String token = token(configuracao);
        if (token != null && !token.isBlank()) {
            headers.setBearerAuth(token);
        }
        return new HttpEntity<>(headers);
    }

    private String token(ConfiguracaoFiscal configuracao) {
        try {
            return fiscalSecretResolver.resolverOpcional(
                    configuracao != null ? configuracao.getProvedorTokenEnv() : null,
                    "Variavel do token do provedor fiscal nao encontrada."
            );
        } catch (IllegalStateException ex) {
            throw new BusinessException(ex.getMessage());
        }
    }
}
