package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.model.ConfiguracaoFiscal;

public interface FiscalServiceStatusChecker {
    FiscalServiceStatusResult consultar(ConfiguracaoFiscal configuracao);
}
