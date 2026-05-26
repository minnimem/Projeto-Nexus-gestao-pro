package br.com.diego.projectoads.service.fiscal;

import br.com.diego.projectoads.model.ConfiguracaoFiscal;
import br.com.diego.projectoads.model.DocumentoFiscal;

public interface FiscalXmlSigner {
    String assinarHomologacao(DocumentoFiscal documento, ConfiguracaoFiscal configuracao, String xml);
}
