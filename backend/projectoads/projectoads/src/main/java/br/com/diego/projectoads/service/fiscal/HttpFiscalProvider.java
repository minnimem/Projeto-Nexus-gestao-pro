package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.config.Enum.AmbienteFiscal;
import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import br.com.diego.projectoads.model.DocumentoFiscal;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@ConditionalOnProperty(prefix = "nexus.fiscal", name = "provider", havingValue = "http")
public class HttpFiscalProvider implements FiscalProvider {

    private final RestTemplate restTemplate;
    private final FiscalSecretResolver fiscalSecretResolver;

    public HttpFiscalProvider(RestTemplateBuilder restTemplateBuilder,
                              FiscalSecretResolver fiscalSecretResolver,
                              @Value("${nexus.fiscal.http.connect-timeout-ms:3000}") long connectTimeoutMs,
                              @Value("${nexus.fiscal.http.read-timeout-ms:10000}") long readTimeoutMs) {
        this(restTemplateBuilder
                .setConnectTimeout(Duration.ofMillis(connectTimeoutMs))
                .setReadTimeout(Duration.ofMillis(readTimeoutMs))
                .build(), fiscalSecretResolver);
    }

    HttpFiscalProvider(RestTemplate restTemplate, FiscalSecretResolver fiscalSecretResolver) {
        this.restTemplate = restTemplate;
        this.fiscalSecretResolver = fiscalSecretResolver;
    }

    @Override
    public boolean supports(ConfiguracaoFiscal configuracao) {
        return configuracao != null && !isBlank(endpointAmbiente(configuracao));
    }

    @Override
    public FiscalTransmissionResult transmitirHomologacao(DocumentoFiscal documento) {
        if (documento == null || documento.getConfiguracaoFiscal() == null) {
            throw new BusinessException("Documento fiscal sem configuracao para transmissao HTTP.");
        }
        if (isBlank(documento.getXmlEnvio())) {
            throw new BusinessException("Documento fiscal sem XML para transmissao HTTP.");
        }
        ConfiguracaoFiscal configuracao = documento.getConfiguracaoFiscal();
        FiscalSecretStatus secretStatus = fiscalSecretResolver.validarSegredos(configuracao);
        if (!secretStatus.pronto()) {
            throw new BusinessException("Segredos fiscais pendentes para transmissao HTTP: " + String.join(" ", secretStatus.pendencias()));
        }

        String endpoint = endpointAmbiente(configuracao);
        if (isBlank(endpoint)) {
            throw new BusinessException("Endpoint fiscal nao configurado para transmissao HTTP.");
        }

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, request(documento), String.class);
            String body = response.getBody();
            if (isBlank(body)) {
                throw new BusinessException("Provedor fiscal HTTP retornou resposta vazia.");
            }
            return interpretarResposta(body);
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BusinessException("Falha na transmissao fiscal HTTP: " + ex.getMessage());
        }
    }

    private HttpEntity<Map<String, Object>> request(DocumentoFiscal documento) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("documentoId", documento.getId());
        payload.put("pedidoId", documento.getPedido() != null ? documento.getPedido().getId() : null);
        payload.put("modelo", documento.getModelo());
        payload.put("ambiente", documento.getAmbiente());
        payload.put("serie", documento.getSerie());
        payload.put("numero", documento.getNumero());
        payload.put("empresaId", documento.getEmpresa() != null ? documento.getEmpresa().getId() : null);
        payload.put("provedor", documento.getProvedor());
        payload.put("xmlEnvio", documento.getXmlEnvio());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String token = token(documento.getConfiguracaoFiscal());
        if (!isBlank(token)) {
            headers.setBearerAuth(token);
        }
        return new HttpEntity<>(payload, headers);
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

    private boolean autorizado(Map<?, ?> body) {
        Object value = body.get("autorizado");
        if (value instanceof Boolean bool) {
            return bool;
        }
        Object success = body.get("success");
        if (success instanceof Boolean bool) {
            return bool;
        }
        String status = texto(body.get("status"));
        String codigo = primeiroTexto(body, "codigoStatus", "cStat");
        return "AUTORIZADO".equalsIgnoreCase(status)
                || "AUTORIZADA".equalsIgnoreCase(status)
                || "AUTHORIZED".equalsIgnoreCase(status)
                || "APPROVED".equalsIgnoreCase(status)
                || "APROVADO".equalsIgnoreCase(status)
                || "100".equals(codigo);
    }

    private Map<?, ?> mapaRetorno(Map<?, ?> body) {
        for (String key : new String[]{"data", "result", "resultado", "documento", "retorno"}) {
            Object nested = body.get(key);
            if (nested instanceof Map<?, ?> map && !map.isEmpty()) {
                return map;
            }
        }
        return body;
    }

    private FiscalTransmissionResult interpretarResposta(String body) {
        String texto = body.trim();
        if (texto.startsWith("<")) {
            return interpretarRespostaXml(texto);
        }
        try {
            Map<?, ?> retorno = mapaRetorno(new com.fasterxml.jackson.databind.ObjectMapper().readValue(texto, Map.class));
            boolean autorizado = autorizado(retorno);
            String mensagem = primeiroTexto(retorno, "mensagem", "message", "motivo", "reason", "xMotivo");
            if (isBlank(mensagem)) {
                mensagem = autorizado ? "Documento fiscal autorizado pelo provedor HTTP." : "Documento fiscal rejeitado pelo provedor HTTP.";
            }
            return new FiscalTransmissionResult(
                    autorizado,
                    primeiroTexto(retorno, "chaveAcesso", "chave", "accessKey", "chave_acesso", "chNFe"),
                    primeiroTexto(retorno, "protocolo", "protocoloAutorizacao", "authorizationProtocol", "receipt", "nProt"),
                    mensagem,
                    primeiroTexto(retorno, "xmlRetorno", "xml", "xmlAutorizado", "authorizedXml", "nfeProc"),
                    primeiroTexto(retorno, "danfeHtml", "danfe", "documentoAuxiliarHtml", "auxiliaryDocumentHtml")
            );
        } catch (Exception ex) {
            throw new BusinessException("Provedor fiscal HTTP retornou JSON invalido: " + ex.getMessage());
        }
    }

    private FiscalTransmissionResult interpretarRespostaXml(String xml) {
        Document document = parseXml(xml);
        String status = primeiroTextoXml(document, "cStat", "Status", "status");
        boolean autorizado = "100".equals(status)
                || "AUTORIZADO".equalsIgnoreCase(status)
                || "AUTORIZADA".equalsIgnoreCase(status);
        String mensagem = primeiroTextoXml(document, "xMotivo", "Mensagem", "message");
        if (isBlank(mensagem)) {
            mensagem = autorizado ? "Documento fiscal autorizado pelo provedor HTTP." : "Documento fiscal rejeitado pelo provedor HTTP.";
        }
        return new FiscalTransmissionResult(
                autorizado,
                primeiroTextoXml(document, "chNFe", "ChaveAcesso", "chaveAcesso", "chave"),
                primeiroTextoXml(document, "nProt", "Protocolo", "protocolo"),
                mensagem,
                xml,
                null
        );
    }

    private Document parseXml(String xml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setXIncludeAware(false);
            factory.setExpandEntityReferences(false);
            return factory.newDocumentBuilder().parse(new InputSource(new StringReader(xml)));
        } catch (Exception ex) {
            throw new BusinessException("Provedor fiscal HTTP retornou XML invalido: " + ex.getMessage());
        }
    }

    private String primeiroTextoXml(Document document, String... tags) {
        for (String tag : tags) {
            Element element = primeiroElementoPorTag(document, tag);
            if (element != null) {
                String value = element.getTextContent();
                if (!isBlank(value)) {
                    return value.trim();
                }
            }
        }
        return null;
    }

    private Element primeiroElementoPorTag(Document document, String tag) {
        NodeList nodes = document.getElementsByTagNameNS("*", tag);
        if (nodes.getLength() == 0) {
            nodes = document.getElementsByTagName(tag);
        }
        if (nodes.getLength() > 0 && nodes.item(0) instanceof Element element) {
            return element;
        }

        NodeList all = document.getElementsByTagName("*");
        for (int index = 0; index < all.getLength(); index++) {
            Node node = all.item(index);
            if (node instanceof Element element && tag.equals(element.getLocalName())) {
                return element;
            }
        }
        return null;
    }

    private String endpointAmbiente(ConfiguracaoFiscal configuracao) {
        return configuracao.getAmbiente() == AmbienteFiscal.PRODUCAO
                ? configuracao.getEndpointProducao()
                : configuracao.getEndpointHomologacao();
    }

    private String texto(Object value) {
        return value != null ? String.valueOf(value) : null;
    }

    private String primeiroTexto(Map<?, ?> body, String... keys) {
        for (String key : keys) {
            String value = texto(body.get(key));
            if (!isBlank(value)) {
                return value;
            }
        }
        return null;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
