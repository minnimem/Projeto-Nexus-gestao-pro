package br.com.diego.projectoads.service.fiscal;

import java.util.List;

public record FiscalSecretStatus(
        boolean pronto,
        List<String> pendencias
) {
}
