package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import br.com.diego.projectoads.model.DocumentoFiscal;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
@ConditionalOnProperty(prefix = "nexus.fiscal", name = "xml-signer", havingValue = "controlled", matchIfMissing = true)
public class ControlledFiscalXmlSigner implements FiscalXmlSigner {

    private final FiscalSecretResolver fiscalSecretResolver;

    public ControlledFiscalXmlSigner(FiscalSecretResolver fiscalSecretResolver) {
        this.fiscalSecretResolver = fiscalSecretResolver;
    }

    @Override
    public String assinarHomologacao(DocumentoFiscal documento, ConfiguracaoFiscal configuracao, String xml) {
        FiscalSecretStatus secretStatus = fiscalSecretResolver.validarSegredos(configuracao);
        if (!secretStatus.pronto()) {
            throw new BusinessException("Segredos fiscais pendentes para assinatura: " + String.join(" ", secretStatus.pendencias()));
        }
        if (xml == null || xml.isBlank()) {
            throw new BusinessException("XML fiscal obrigatorio para assinatura.");
        }

        String blocoAssinatura = "<AssinaturaHomologacao>"
                + "<Tipo>CONTROLADA</Tipo>"
                + "<Algoritmo>SHA256-RSA-PKCS12-PENDENTE</Algoritmo>"
                + "<CertificadoAlias>" + escapeXml(configuracao.getCertificadoAlias()) + "</CertificadoAlias>"
                + "<CertificadoArquivoEnv>" + escapeXml(configuracao.getCertificadoArquivoEnv()) + "</CertificadoArquivoEnv>"
                + "<Digest>" + digest(xml) + "</Digest>"
                + "<AssinaturaRealPendente>true</AssinaturaRealPendente>"
                + "</AssinaturaHomologacao>";

        int rootCloseStart = xml.lastIndexOf("</");
        if (rootCloseStart < 0) {
            throw new BusinessException("XML fiscal sem raiz para assinatura.");
        }
        return xml.substring(0, rootCloseStart) + blocoAssinatura + xml.substring(rootCloseStart);
    }

    private String digest(String xml) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(xml.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new BusinessException("Algoritmo SHA-256 indisponivel para assinatura fiscal.");
        }
    }

    private String escapeXml(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
