package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.config.Enum.ModeloDocumentoFiscal;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import br.com.diego.projectoads.model.DocumentoFiscal;
import br.com.diego.projectoads.model.Empresa;
import br.com.diego.projectoads.model.Pedido;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class HttpFiscalProviderTest {

    private final RestTemplate restTemplate = new RestTemplate();
    private final MockRestServiceServer server = MockRestServiceServer.bindTo(restTemplate).build();
    private final FiscalSecretResolver fiscalSecretResolver = new FiscalSecretResolver(Map.of(
            "FISCAL_CERT_FILE", "C:\\certificados\\homologacao.pfx",
            "FISCAL_CERT_PASSWORD", "senha-homologacao",
            "FISCAL_PROVIDER_TOKEN", "token-http"
    ));
    private final HttpFiscalProvider provider = new HttpFiscalProvider(restTemplate, fiscalSecretResolver);

    @Test
    void deveTransmitirDocumentoFiscalParaEndpointHttp() {
        DocumentoFiscal documento = documentoFiscal();
        server.expect(once(), requestTo("https://fiscal.example/homologacao"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(org.springframework.test.web.client.match.MockRestRequestMatchers.header("Authorization", "Bearer token-http"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("\"modelo\":\"NFE\"")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("\"numero\":10")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("\"xmlEnvio\":\"<NFeHomologacao />\"")))
                .andRespond(withSuccess("""
                        {
                          "autorizado": true,
                          "chaveAcesso": "NFE123",
                          "protocolo": "PROTO123",
                          "mensagem": "Autorizada em homologacao HTTP",
                          "xmlRetorno": "<retorno />",
                          "danfeHtml": "<html>DANFE</html>"
                        }
                        """, MediaType.APPLICATION_JSON));

        FiscalTransmissionResult response = provider.transmitirHomologacao(documento);

        assertTrue(response.autorizado());
        assertEquals("NFE123", response.chaveAcesso());
        assertEquals("PROTO123", response.protocolo());
        assertEquals("Autorizada em homologacao HTTP", response.mensagem());
        assertEquals("<retorno />", response.xmlRetorno());
        assertEquals("<html>DANFE</html>", response.danfeHtml());
        server.verify();
    }

    @Test
    void deveInterpretarAliasesDeRetornoDoEndpointHttp() {
        DocumentoFiscal documento = documentoFiscal();
        server.expect(once(), requestTo("https://fiscal.example/homologacao"))
                .andRespond(withSuccess("""
                        {
                          "status": "APPROVED",
                          "codigoStatus": "100",
                          "chave": "NFE456",
                          "protocoloAutorizacao": "PROTO456",
                          "mensagem": "Autorizada por provedor externo",
                          "nfeProc": "<nfeProc />",
                          "documentoAuxiliarHtml": "<html>Documento auxiliar</html>"
                        }
                        """, MediaType.APPLICATION_JSON));

        FiscalTransmissionResult response = provider.transmitirHomologacao(documento);

        assertTrue(response.autorizado());
        assertEquals("NFE456", response.chaveAcesso());
        assertEquals("PROTO456", response.protocolo());
        assertEquals("<nfeProc />", response.xmlRetorno());
        assertEquals("<html>Documento auxiliar</html>", response.danfeHtml());
        server.verify();
    }

    @Test
    void deveInterpretarRetornoAninhadoDoEndpointHttp() {
        DocumentoFiscal documento = documentoFiscal();
        server.expect(once(), requestTo("https://fiscal.example/homologacao"))
                .andRespond(withSuccess("""
                        {
                          "success": true,
                          "data": {
                            "status": "AUTORIZADA",
                            "chave_acesso": "NFE789",
                            "authorizationProtocol": "PROTO789",
                            "xMotivo": "Autorizado o uso da NF-e",
                            "authorizedXml": "<xml autorizado />",
                            "auxiliaryDocumentHtml": "<html>DANFE aninhado</html>"
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        FiscalTransmissionResult response = provider.transmitirHomologacao(documento);

        assertTrue(response.autorizado());
        assertEquals("NFE789", response.chaveAcesso());
        assertEquals("PROTO789", response.protocolo());
        assertEquals("Autorizado o uso da NF-e", response.mensagem());
        assertEquals("<xml autorizado />", response.xmlRetorno());
        assertEquals("<html>DANFE aninhado</html>", response.danfeHtml());
        server.verify();
    }

    @Test
    void deveInterpretarJsonComCamposSefazDoEndpointHttp() {
        DocumentoFiscal documento = documentoFiscal();
        server.expect(once(), requestTo("https://fiscal.example/homologacao"))
                .andRespond(withSuccess("""
                        {
                          "cStat": "100",
                          "xMotivo": "Autorizado o uso da NF-e",
                          "chNFe": "35260500000000000000550010000000100000000010",
                          "nProt": "135260000000010",
                          "nfeProc": "<nfeProc />"
                        }
                        """, MediaType.APPLICATION_JSON));

        FiscalTransmissionResult response = provider.transmitirHomologacao(documento);

        assertTrue(response.autorizado());
        assertEquals("35260500000000000000550010000000100000000010", response.chaveAcesso());
        assertEquals("135260000000010", response.protocolo());
        assertEquals("Autorizado o uso da NF-e", response.mensagem());
        assertEquals("<nfeProc />", response.xmlRetorno());
        server.verify();
    }

    @Test
    void deveInterpretarXmlRetornadoDiretamentePeloEndpointHttp() {
        DocumentoFiscal documento = documentoFiscal();
        server.expect(once(), requestTo("https://fiscal.example/homologacao"))
                .andRespond(withSuccess("""
                        <?xml version="1.0" encoding="UTF-8"?>
                        <nfeProc xmlns="http://www.portalfiscal.inf.br/nfe">
                          <protNFe>
                            <infProt>
                              <cStat>100</cStat>
                              <xMotivo>Autorizado o uso da NF-e</xMotivo>
                              <chNFe>35260500000000000000550010000000101234567890</chNFe>
                              <nProt>135260000000001</nProt>
                            </infProt>
                          </protNFe>
                        </nfeProc>
                        """, MediaType.APPLICATION_XML));

        FiscalTransmissionResult response = provider.transmitirHomologacao(documento);

        assertTrue(response.autorizado());
        assertEquals("35260500000000000000550010000000101234567890", response.chaveAcesso());
        assertEquals("135260000000001", response.protocolo());
        assertEquals("Autorizado o uso da NF-e", response.mensagem());
        assertTrue(response.xmlRetorno().contains("<nfeProc"));
        server.verify();
    }

    @Test
    void deveInterpretarXmlDeRejeicaoRetornadoPeloEndpointHttp() {
        DocumentoFiscal documento = documentoFiscal();
        server.expect(once(), requestTo("https://fiscal.example/homologacao"))
                .andRespond(withSuccess("""
                        <?xml version="1.0" encoding="UTF-8"?>
                        <retConsReciNFe xmlns="http://www.portalfiscal.inf.br/nfe">
                          <protNFe>
                            <infProt>
                              <cStat>539</cStat>
                              <xMotivo>Duplicidade de NF-e com diferenca na chave de acesso</xMotivo>
                            </infProt>
                          </protNFe>
                        </retConsReciNFe>
                        """, MediaType.APPLICATION_XML));

        FiscalTransmissionResult response = provider.transmitirHomologacao(documento);

        assertFalse(response.autorizado());
        assertEquals("Duplicidade de NF-e com diferenca na chave de acesso", response.mensagem());
        assertTrue(response.xmlRetorno().contains("<retConsReciNFe"));
        server.verify();
    }

    @Test
    void deveInterpretarStatusRejeitadoDoEndpointHttp() {
        DocumentoFiscal documento = documentoFiscal();
        server.expect(once(), requestTo("https://fiscal.example/homologacao"))
                .andRespond(withSuccess("""
                        {
                          "status": "REJEITADO",
                          "mensagem": "CFOP invalido"
                        }
                        """, MediaType.APPLICATION_JSON));

        FiscalTransmissionResult response = provider.transmitirHomologacao(documento);

        assertFalse(response.autorizado());
        assertEquals("CFOP invalido", response.mensagem());
        server.verify();
    }

    @Test
    void deveBloquearTransmissaoQuandoSegredoNaoExiste() {
        HttpFiscalProvider providerSemSegredo = new HttpFiscalProvider(restTemplate, new FiscalSecretResolver(Map.of()));

        BusinessException exception = assertThrows(BusinessException.class, () ->
                providerSemSegredo.transmitirHomologacao(documentoFiscal())
        );

        assertTrue(exception.getMessage().contains("Segredos fiscais pendentes para transmissao HTTP"));
    }

    @Test
    void deveBloquearTransmissaoQuandoTokenDoProvedorNaoExiste() {
        DocumentoFiscal documento = documentoFiscal();
        HttpFiscalProvider providerSemToken = new HttpFiscalProvider(restTemplate, new FiscalSecretResolver(Map.of(
                "FISCAL_CERT_FILE", "C:\\certificados\\homologacao.pfx",
                "FISCAL_CERT_PASSWORD", "senha-homologacao"
        )));

        BusinessException exception = assertThrows(BusinessException.class, () ->
                providerSemToken.transmitirHomologacao(documento)
        );

        assertTrue(exception.getMessage().contains("Variavel do token do provedor fiscal nao encontrada"));
    }

    private DocumentoFiscal documentoFiscal() {
        Empresa empresa = new Empresa();
        empresa.setId(UUID.randomUUID());
        empresa.setNome("Empresa Fiscal");

        Pedido pedido = new Pedido();
        pedido.setId(UUID.randomUUID());
        pedido.setNumero("PED-1");
        pedido.setEmpresa(empresa);

        ConfiguracaoFiscal configuracao = new ConfiguracaoFiscal();
        configuracao.setId(UUID.randomUUID());
        configuracao.setEmpresa(empresa);
        configuracao.setModelo(ModeloDocumentoFiscal.NFE);
        configuracao.setAmbiente(AmbienteFiscal.HOMOLOGACAO);
        configuracao.setCertificadoAlias("certificado-a1");
        configuracao.setCertificadoArquivoEnv("FISCAL_CERT_FILE");
        configuracao.setCertificadoSenhaEnv("FISCAL_CERT_PASSWORD");
        configuracao.setProvedorTokenEnv("FISCAL_PROVIDER_TOKEN");
        configuracao.setEndpointHomologacao("https://fiscal.example/homologacao");

        DocumentoFiscal documento = new DocumentoFiscal();
        documento.setId(UUID.randomUUID());
        documento.setEmpresa(empresa);
        documento.setPedido(pedido);
        documento.setConfiguracaoFiscal(configuracao);
        documento.setModelo(ModeloDocumentoFiscal.NFE);
        documento.setAmbiente(AmbienteFiscal.HOMOLOGACAO);
        documento.setSerie("1");
        documento.setNumero(10L);
        documento.setProvedor("HTTP");
        documento.setXmlEnvio("<NFeHomologacao />");
        return documento;
    }
}
