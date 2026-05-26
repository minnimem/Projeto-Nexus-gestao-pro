package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.exception.BusinessException;
import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.Key;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.util.Enumeration;

@Component
public class Pkcs12FiscalCertificateLoader {

    private final FiscalSecretResolver fiscalSecretResolver;

    public Pkcs12FiscalCertificateLoader(FiscalSecretResolver fiscalSecretResolver) {
        this.fiscalSecretResolver = fiscalSecretResolver;
    }

    public FiscalCertificateMaterial carregar(ConfiguracaoFiscal configuracao) {
        FiscalSecretStatus secretStatus = fiscalSecretResolver.validarSegredos(configuracao);
        if (!secretStatus.pronto()) {
            throw new BusinessException("Segredos fiscais pendentes para carregar certificado: " + String.join(" ", secretStatus.pendencias()));
        }

        String arquivo = fiscalSecretResolver.resolverObrigatorio(
                configuracao.getCertificadoArquivoEnv(),
                "Variavel do arquivo do certificado nao encontrada."
        );
        String senha = fiscalSecretResolver.resolverObrigatorio(
                configuracao.getCertificadoSenhaEnv(),
                "Variavel da senha do certificado nao encontrada."
        );

        try (InputStream inputStream = Files.newInputStream(Path.of(arquivo))) {
            KeyStore keyStore = KeyStore.getInstance("PKCS12");
            char[] password = senha.toCharArray();
            keyStore.load(inputStream, password);
            String alias = escolherAlias(keyStore, configuracao.getCertificadoAlias());
            Key key = keyStore.getKey(alias, password);
            Certificate certificate = keyStore.getCertificate(alias);
            if (!(key instanceof PrivateKey privateKey) || !(certificate instanceof X509Certificate x509Certificate)) {
                throw new BusinessException("Certificado fiscal nao possui chave privada X509 valida.");
            }
            return new FiscalCertificateMaterial(privateKey, x509Certificate, alias);
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BusinessException("Nao foi possivel carregar o certificado fiscal PKCS12: " + ex.getMessage());
        }
    }

    private String escolherAlias(KeyStore keyStore, String aliasConfigurado) throws Exception {
        if (aliasConfigurado != null && !aliasConfigurado.isBlank() && keyStore.isKeyEntry(aliasConfigurado.trim())) {
            return aliasConfigurado.trim();
        }
        Enumeration<String> aliases = keyStore.aliases();
        while (aliases.hasMoreElements()) {
            String alias = aliases.nextElement();
            if (keyStore.isKeyEntry(alias)) {
                return alias;
            }
        }
        throw new BusinessException("Certificado fiscal PKCS12 sem chave privada disponivel.");
    }
}
