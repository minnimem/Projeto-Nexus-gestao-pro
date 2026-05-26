package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withNoContent;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import org.springframework.http.HttpStatus;

class HttpFiscalServiceStatusCheckerTest {

    private final RestTemplate restTemplate = new RestTemplate();
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
    private final FiscalSecretResolver fiscalSecretResolver = new FiscalSecretResolver(Map.of("FISCAL_PROVIDER_TOKEN", "token-http"));
    private final HttpFiscalServiceStatusChecker checker = new HttpFiscalServiceStatusChecker(restTemplate, fiscalSecretResolver);

    @Test
    void deveRetornarDisponivelQuandoEndpointRespondeHead() {
        server.expect(once(), requestTo("https://fiscal.example/status"))
                .andExpect(method(HttpMethod.HEAD))
                .andExpect(org.springframework.test.web.client.match.MockRestRequestMatchers.header("Authorization", "Bearer token-http"))
                .andRespond(withNoContent());

        FiscalServiceStatusResult result = checker.consultar(configuracao());

        assertTrue(result.disponivel());
        assertTrue(result.status().contains("DISPONIVEL_HTTP"));
        server.verify();
    }

    @Test
    void deveConsiderarDisponivelQuandoEndpointNaoAceitaHead() {
        server.expect(once(), requestTo("https://fiscal.example/status"))
                .andExpect(method(HttpMethod.HEAD))
                .andRespond(withStatus(HttpStatus.METHOD_NOT_ALLOWED));

        FiscalServiceStatusResult result = checker.consultar(configuracao());

        assertTrue(result.disponivel());
        assertTrue(result.mensagem().contains("nao aceita HEAD"));
        server.verify();
    }

    @Test
    void deveRetornarIndisponivelQuandoEndpointFalha() {
        server.expect(once(), requestTo("https://fiscal.example/status"))
                .andRespond(withServerError());

        FiscalServiceStatusResult result = checker.consultar(configuracao());

        assertFalse(result.disponivel());
        assertTrue(result.status().contains("INDISPONIVEL_HTTP"));
        server.verify();
    }

    @Test
    void deveRetornarIndisponivelQuandoTokenNaoExiste() {
        HttpFiscalServiceStatusChecker checkerSemToken = new HttpFiscalServiceStatusChecker(restTemplate, new FiscalSecretResolver(Map.of()));

        FiscalServiceStatusResult result = checkerSemToken.consultar(configuracao());

        assertFalse(result.disponivel());
        assertTrue(result.status().contains("INDISPONIVEL_HTTP_AUTH"));
        assertTrue(result.mensagem().contains("Variavel do token do provedor fiscal nao encontrada"));
    }

    private ConfiguracaoFiscal configuracao() {
        ConfiguracaoFiscal configuracao = new ConfiguracaoFiscal();
        configuracao.setAmbiente(AmbienteFiscal.HOMOLOGACAO);
        configuracao.setProvedorTokenEnv("FISCAL_PROVIDER_TOKEN");
        configuracao.setEndpointHomologacao("https://fiscal.example/status");
        return configuracao;
    }
}
