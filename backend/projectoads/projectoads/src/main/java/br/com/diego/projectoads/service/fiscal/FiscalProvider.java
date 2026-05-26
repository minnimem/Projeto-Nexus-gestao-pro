package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import br.com.diego.projectoads.model.DocumentoFiscal;

public interface FiscalProvider {

    boolean supports(ConfiguracaoFiscal configuracao);

    FiscalTransmissionResult transmitirHomologacao(DocumentoFiscal documento);
}
