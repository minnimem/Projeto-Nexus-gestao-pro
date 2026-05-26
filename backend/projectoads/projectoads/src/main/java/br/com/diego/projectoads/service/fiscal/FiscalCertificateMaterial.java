package br.com.diego.projectoads.service.fiscal;

import java.security.PrivateKey;
import java.security.cert.X509Certificate;

public record FiscalCertificateMaterial(
        PrivateKey privateKey,
        X509Certificate certificate,
        String alias
) {
}
