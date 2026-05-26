package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import br.com.diego.projectoads.model.DocumentoFiscal;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "nexus.fiscal", name = "provider", havingValue = "controlled", matchIfMissing = true)
public class ControlledHomologationFiscalProvider implements FiscalProvider {

    private final FiscalSecretResolver fiscalSecretResolver;

    public ControlledHomologationFiscalProvider(FiscalSecretResolver fiscalSecretResolver) {
        this.fiscalSecretResolver = fiscalSecretResolver;
    }

    @Override
    public boolean supports(ConfiguracaoFiscal configuracao) {
        return true;
    }

    @Override
    public FiscalTransmissionResult transmitirHomologacao(DocumentoFiscal documento) {
        if (documento == null || documento.getConfiguracaoFiscal() == null) {
            throw new BusinessException("Documento fiscal sem configuracao para transmissao.");
        }
        if (isBlank(documento.getXmlEnvio())) {
            throw new BusinessException("Documento fiscal sem XML para transmissao.");
        }
        FiscalSecretStatus secretStatus = fiscalSecretResolver.validarSegredos(documento.getConfiguracaoFiscal());
        if (!secretStatus.pronto()) {
            throw new BusinessException("Segredos fiscais pendentes: " + String.join(" ", secretStatus.pendencias()));
        }

        String protocolo = "CTRL-" + documento.getModelo() + "-" + documento.getSerie() + "-" + documento.getNumero();
        String chave = "CTRL" + documento.getModelo() + documento.getAmbiente() + documento.getSerie() + documento.getNumero();
        String mensagem = "Transmissao de homologacao controlada autorizada. Substituir por provedor fiscal real.";
        return new FiscalTransmissionResult(
                true,
                chave.replaceAll("[^A-Za-z0-9]", ""),
                protocolo.replaceAll("[^A-Za-z0-9-]", ""),
                mensagem,
                montarXmlRetorno(documento, "AUTORIZADO", mensagem),
                null
        );
    }

    private String montarXmlRetorno(DocumentoFiscal documento, String status, String mensagem) {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<RetornoTransmissaoFiscal>"
                + "<Status>" + status + "</Status>"
                + "<Modelo>" + texto(documento.getModelo()) + "</Modelo>"
                + "<Ambiente>" + texto(documento.getAmbiente()) + "</Ambiente>"
                + "<Serie>" + texto(documento.getSerie()) + "</Serie>"
                + "<Numero>" + texto(documento.getNumero()) + "</Numero>"
                + "<Mensagem>" + escapeXml(mensagem) + "</Mensagem>"
                + "</RetornoTransmissaoFiscal>";
    }

    private String texto(Object value) {
        return escapeXml(value != null ? String.valueOf(value) : "");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
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
